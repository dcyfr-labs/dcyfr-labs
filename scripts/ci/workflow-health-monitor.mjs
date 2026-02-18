#!/usr/bin/env node
/**
 * Workflow Health Monitor
 *
 * Tracks GitHub Actions workflow success rates, duration, and reliability metrics
 * Generates health reports and identifies problematic workflows
 *
 * Usage:
 *   node scripts/ci/workflow-health-monitor.mjs [--days=7] [--min-runs=5]
 */

import { execSync } from 'child_process'
import { parseArgs } from 'util'

const args = parseArgs({
  options: {
    days: { type: 'string', default: '7' },
    'min-runs': { type: 'string', default: '5' },
    format: { type: 'string', default: 'markdown' }, // markdown|json
  },
})

const DAYS = parseInt(args.values.days)
const MIN_RUNS = parseInt(args.values['min-runs'])
const FORMAT = args.values.format

/**
 * Get workflow runs from GitHub API
 */
function getWorkflowRuns() {
  const since = new Date()
  since.setDate(since.getDate() - DAYS)
  const sinceISO = since.toISOString()

  try {
    const output = execSync( // NOSONAR - Administrative script, inputs from controlled sources
      `gh run list --limit 500 --json workflowName,status,conclusion,createdAt,displayTitle,workflowDatabaseId --created ">=${sinceISO}"`,
      { encoding: 'utf-8' }
    )

    return JSON.parse(output)
  } catch (error) {
    console.error('Error fetching workflow runs:', error.message)
    process.exit(1)
  }
}

/**
 * Calculate statistics for each workflow
 */
function calculateStatistics(runs) {
  const workflowStats = {}

  runs.forEach((run) => {
    const name = run.workflowName

    if (!workflowStats[name]) {
      workflowStats[name] = {
        name,
        total: 0,
        success: 0,
        failure: 0,
        cancelled: 0,
        in_progress: 0,
        skipped: 0,
        durations: [],
      }
    }

    const stats = workflowStats[name]
    stats.total++

    // Count by conclusion
    if (run.conclusion === 'success') {
      stats.success++
    } else if (run.conclusion === 'failure') {
      stats.failure++
    } else if (run.conclusion === 'cancelled') {
      stats.cancelled++
    } else if (run.conclusion === 'skipped') {
      stats.skipped++
    } else if (run.status === 'in_progress') {
      stats.in_progress++
    }
  })

  // Calculate success rates and filter by minimum runs
  const results = Object.values(workflowStats)
    .filter((stats) => stats.total >= MIN_RUNS)
    .map((stats) => {
      const completedRuns = stats.total - stats.in_progress
      const successRate =
        completedRuns > 0 ? (stats.success / completedRuns) * 100 : 0

      return {
        ...stats,
        successRate: successRate.toFixed(1),
        failureRate: ((stats.failure / completedRuns) * 100).toFixed(1),
        reliability: getReliabilityScore(successRate, stats.failure),
      }
    })
    .sort((a, b) => parseFloat(a.successRate) - parseFloat(b.successRate))

  return results
}

/**
 * Calculate reliability score (A-F)
 */
function getReliabilityScore(successRate, failures) {
  if (successRate >= 99 && failures === 0) return 'A+'
  if (successRate >= 95) return 'A'
  if (successRate >= 90) return 'B'
  if (successRate >= 80) return 'C'
  if (successRate >= 70) return 'D'
  return 'F'
}

/**
 * Get status emoji
 */
function getStatusEmoji(successRate) {
  if (successRate >= 99) return '🟢'
  if (successRate >= 95) return '🟡'
  if (successRate >= 80) return '🟠'
  return '🔴'
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(stats) {
  const totalWorkflows = stats.length
  const healthyWorkflows = stats.filter(
    (s) => parseFloat(s.successRate) >= 95
  ).length
  const problematicWorkflows = stats.filter(
    (s) => parseFloat(s.successRate) < 80
  ).length

  let report = `# 🏥 Workflow Health Report

**Period:** Last ${DAYS} days
**Total Workflows:** ${totalWorkflows}
**Healthy Workflows:** ${healthyWorkflows} (≥95% success rate)
**Problematic Workflows:** ${problematicWorkflows} (<80% success rate)

## 📊 Overall Health

| Metric | Value |
|--------|-------|
| Total Workflows | ${totalWorkflows} |
| Healthy (≥95%) | ${healthyWorkflows} (${((healthyWorkflows / totalWorkflows) * 100).toFixed(1)}%) |
| Warning (80-95%) | ${stats.filter((s) => parseFloat(s.successRate) >= 80 && parseFloat(s.successRate) < 95).length} |
| Critical (<80%) | ${problematicWorkflows} |

## 🔥 Workflow Success Rates

| Status | Workflow | Success Rate | Runs | Failures | Score |
|--------|----------|--------------|------|----------|-------|
`

  stats.forEach((stat) => {
    const emoji = getStatusEmoji(parseFloat(stat.successRate))
    report += `| ${emoji} | ${stat.name} | ${stat.successRate}% | ${stat.total} | ${stat.failure} | ${stat.reliability} |\n`
  })

  report += `

## ⚠️ Action Required

`

  const critical = stats.filter((s) => parseFloat(s.successRate) < 80)
  if (critical.length > 0) {
    report += `### Critical Workflows (<80% success)\n\n`
    critical.forEach((stat) => {
      report += `**${stat.name}**
- Success Rate: ${stat.successRate}%
- Failures: ${stat.failure}/${stat.total} runs
- Reliability Score: ${stat.reliability}

`
    })
  } else {
    report += `✅ No critical workflows detected.\n\n`
  }

  const warning = stats.filter(
    (s) =>
      parseFloat(s.successRate) >= 80 && parseFloat(s.successRate) < 95
  )
  if (warning.length > 0) {
    report += `### Warning Workflows (80-95% success)\n\n`
    warning.forEach((stat) => {
      report += `- **${stat.name}**: ${stat.successRate}% (${stat.failure} failures)\n`
    })
  }

  report += `

## 💡 Recommendations

`

  if (critical.length > 0) {
    report += `1. **Investigate critical workflows immediately** - Review logs for common failure patterns
2. **Add retry logic** for flaky tests or external API calls
3. **Improve error handling** in workflow scripts
4. **Consider splitting large workflows** into smaller, more reliable units
`
  } else if (warning.length > 0) {
    report += `1. **Monitor warning workflows** - Track trends over next week
2. **Review recent failures** - Identify patterns in failure logs
3. **Add workflow status notifications** if not already enabled
`
  } else {
    report += `✅ All workflows are healthy! Keep up the good work.

**Maintenance tips:**
- Continue monitoring workflow health weekly
- Keep workflows updated with latest actions
- Maintain good test coverage to catch issues early
`
  }

  report += `

---

**Report generated:** ${new Date().toISOString()}
**Minimum runs filter:** ${MIN_RUNS} runs
`

  return report
}

/**
 * Main function
 */
function main() {
  console.log(`📊 Fetching workflow runs from last ${DAYS} days...`)

  const runs = getWorkflowRuns()
  console.log(`✅ Found ${runs.length} workflow runs`)

  console.log(`📈 Calculating statistics...`)
  const stats = calculateStatistics(runs)

  console.log(
    `✅ Analyzed ${stats.length} workflows (with ≥${MIN_RUNS} runs)\n`
  )

  if (FORMAT === 'json') {
    console.log(JSON.stringify(stats, null, 2))
  } else {
    const report = generateMarkdownReport(stats)
    console.log(report)
  }
}

main()
