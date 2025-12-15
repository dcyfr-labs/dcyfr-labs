const {mkdtempSync, cpSync, mkdirSync, rmSync} = require('fs');
const {join} = require('path');
const {tmpdir} = require('os');
const temp = mkdtempSync(join(tmpdir(), 'ai-instructions-'));
const files = ['AGENTS.md','CLAUDE.md','.github/copilot-instructions.md'];
for (const f of files) {
  const src = join(process.cwd(), f);
  const dest = join(temp, f);
  mkdirSync(join(dest,'..'),{recursive:true});
  cpSync(src,dest,{recursive:true});
}
const destDir = join(temp, '.github/agents/instructions');
mkdirSync(destDir, { recursive: true });
cpSync(join(process.cwd(), '.github/agents/instructions/INSTRUCTIONS_CONFIG.json'), join(destDir, 'INSTRUCTIONS_CONFIG.json'));
mkdirSync(join(temp,'scripts','validation'),{recursive:true});
cpSync(join(process.cwd(),'scripts/validation/validate-instructions.mjs'), join(temp,'scripts','validation','validate-instructions.mjs'));
cpSync(join(process.cwd(),'scripts/validate-instructions.mjs'), join(temp,'scripts','validate-instructions.mjs'));
const {spawnSync}=require('child_process');
console.log('RUN 1 (no env):');
let r1 = spawnSync('node',['scripts/validate-instructions.mjs'],{cwd:temp, env:{...process.env, IGNORED_INSTRUCTION_FILES: ''}});
console.log('status', r1.status);
console.log('stdout', r1.stdout.toString());
console.log('stderr', r1.stderr.toString());
console.log('RUN 2 (with env):');
let r2 = spawnSync('node',['scripts/validate-instructions.mjs'],{cwd:temp, env:{...process.env, IGNORED_INSTRUCTION_FILES: '.github/agents/DCYFR.agent.md'}});
console.log('status', r2.status);
console.log('stdout', r2.stdout.toString());
console.log('stderr', r2.stderr.toString());
try { rmSync(temp, { recursive: true }); } catch (e) { }
