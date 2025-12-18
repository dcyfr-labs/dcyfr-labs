#!/usr/bin/env node

/**
 * Advanced LinkedIn Network Connectivity Diagnostic
 * 
 * Helps diagnose network issues preventing LinkedIn OAuth from working
 * Run: node scripts/diagnose-linkedin-network.mjs
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🔍 LinkedIn Network Connectivity Diagnostics');
console.log('==============================================\n');

// Test basic network connectivity
async function testNetworkConnectivity() {
  console.log('🌐 Testing Basic Network Connectivity:');
  
  const testSites = [
    'https://www.google.com',
    'https://www.linkedin.com',
    'https://api.linkedin.com'
  ];
  
  for (const url of testSites) {
    try {
      const startTime = Date.now();
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: { 'User-Agent': 'dcyfr-labs/network-test' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      const duration = Date.now() - startTime;
      
      console.log(`  ✅ ${url} - Status: ${response.status} (${duration}ms)`);
    } catch (error) {
      console.log(`  ❌ ${url} - Error: ${error.message}`);
      
      if (error.message.includes('timeout')) {
        console.log('     → Timeout suggests network latency issues');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('     → DNS resolution failure');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('     → Connection refused (firewall/proxy blocking)');
      }
    }
  }
}

// Test DNS resolution
async function testDNSResolution() {
  console.log('\n🔍 Testing DNS Resolution:');
  
  const domains = [
    'www.linkedin.com',
    'api.linkedin.com'
  ];
  
  for (const domain of domains) {
    try {
      const { stdout } = await execAsync(`nslookup ${domain}`);
      const ips = stdout.match(/Address: (\d+\.\d+\.\d+\.\d+)/g);
      if (ips && ips.length > 0) {
        console.log(`  ✅ ${domain} resolves to: ${ips.join(', ').replace(/Address: /g, '')}`);
      } else {
        console.log(`  ⚠️  ${domain} - Unable to parse IP addresses from response`);
      }
    } catch (error) {
      console.log(`  ❌ ${domain} - DNS lookup failed: ${error.message}`);
    }
  }
}

// Test specific LinkedIn OAuth endpoints
async function testLinkedInOAuthEndpoints() {
  console.log('\n🔐 Testing LinkedIn OAuth Endpoints:');
  
  const endpoints = [
    {
      url: 'https://www.linkedin.com/oauth/v2/authorization',
      method: 'GET',
      expectedStatus: [200, 400] // 200 for basic access, 400 for missing params
    },
    {
      url: 'https://www.linkedin.com/oauth/v2/accessToken',
      method: 'POST',
      expectedStatus: [400, 405], // 400 for missing params, 405 for method not allowed with GET
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    },
    {
      url: 'https://api.linkedin.com/v2/me',
      method: 'GET',
      expectedStatus: [401] // Unauthorized without token
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'User-Agent': 'dcyfr-labs/oauth-test',
          ...endpoint.headers
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      const duration = Date.now() - startTime;
      
      if (endpoint.expectedStatus.includes(response.status)) {
        console.log(`  ✅ ${endpoint.url} - Status: ${response.status} (${duration}ms) [Expected]`);
      } else {
        console.log(`  ⚠️  ${endpoint.url} - Status: ${response.status} (${duration}ms) [Unexpected]`);
      }
    } catch (error) {
      console.log(`  ❌ ${endpoint.url} - Error: ${error.message}`);
      
      // Provide specific guidance based on error type
      if (error.message.includes('fetch failed')) {
        console.log('     → This is the same error you\'re experiencing');
        console.log('     → Likely cause: Network firewall or proxy blocking');
      } else if (error.message.includes('timeout')) {
        console.log('     → Request timeout - slow network or filtering');
      } else if (error.message.includes('ECONNRESET')) {
        console.log('     → Connection reset - firewall interference');
      }
    }
  }
}

// Check for common network interfering software
async function checkNetworkConfiguration() {
  console.log('\n⚙️  Checking Network Configuration:');
  
  // Check for common proxy environment variables
  const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY'];
  const proxySettings = proxyVars.filter(varName => process.env[varName]);
  
  if (proxySettings.length > 0) {
    console.log('  ⚠️  Proxy settings detected:');
    proxySettings.forEach(varName => {
      console.log(`     ${varName}: ${process.env[varName]}`);
    });
    console.log('     → These may interfere with LinkedIn OAuth');
  } else {
    console.log('  ✅ No proxy environment variables detected');
  }
  
  // Check for NO_PROXY settings
  if (process.env.NO_PROXY || process.env.no_proxy) {
    console.log('  📝 NO_PROXY settings:');
    console.log(`     ${process.env.NO_PROXY || process.env.no_proxy}`);
  }
  
  // Platform-specific network checks
  const platform = process.platform;
  console.log(`  📍 Platform: ${platform}`);
  
  if (platform === 'darwin') {
    console.log('  💡 macOS detected - check System Preferences → Network → Advanced → Proxies');
  } else if (platform === 'win32') {
    console.log('  💡 Windows detected - check Internet Options → Connections → LAN Settings');
  } else {
    console.log('  💡 Unix-like system - check /etc/environment and ~/.bashrc for proxy settings');
  }
}

// Test alternative OAuth method
async function testAlternativeOAuthFlow() {
  console.log('\n🔄 Testing Alternative OAuth Approach:');
  
  const clientId = process.env.LINKEDIN_OPENID_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (!clientId || !siteUrl) {
    console.log('  ⚠️  Cannot test - missing LINKEDIN_OPENID_CLIENT_ID or NEXT_PUBLIC_SITE_URL');
    return;
  }
  
  // Create a direct authorization URL
  const redirectUri = `${siteUrl}/api/auth/linkedin/callback`;
  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: 'network-test',
    scope: 'openid profile email',
  });
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${authParams.toString()}`;
  
  console.log('  🔗 Direct Authorization URL:');
  console.log(`     ${authUrl}`);
  console.log('');
  console.log('  📋 Manual Test Steps:');
  console.log('     1. Open the URL above in your browser');
  console.log('     2. If LinkedIn loads → Network to LinkedIn works');
  console.log('     3. If it times out/fails → Confirm network blocking');
  console.log('     4. Complete auth if possible to test full flow');
}

// Provide solutions and next steps
function provideSolutions() {
  console.log('\n🛠️  Solutions & Next Steps:');
  console.log('');
  
  console.log('🔥 Immediate Actions:');
  console.log('   1. Try accessing https://www.linkedin.com in your browser');
  console.log('   2. If LinkedIn doesn\'t load → Network/firewall issue');
  console.log('   3. If LinkedIn loads → Try OAuth URL from test above');
  console.log('');
  
  console.log('🏢 Corporate Network Solutions:');
  console.log('   • Contact IT to whitelist *.linkedin.com domains');
  console.log('   • Request OAuth endpoints be unblocked:');
  console.log('     - https://www.linkedin.com/oauth/v2/*');
  console.log('     - https://api.linkedin.com/v2/*');
  console.log('   • Ask for SSL inspection bypass for LinkedIn OAuth');
  console.log('');
  
  console.log('🌐 Alternative Network Solutions:');
  console.log('   • Try from different network (mobile hotspot, home WiFi)');
  console.log('   • Temporarily disable VPN if using one');
  console.log('   • Check router/firewall settings if on home network');
  console.log('   • Use curl to test: curl -v https://www.linkedin.com/oauth/v2/authorization');
  console.log('');
  
  console.log('⚙️  Development Workarounds:');
  console.log('   • Use ngrok to expose local dev server');
  console.log('   • Deploy to Vercel/Netlify for testing');
  console.log('   • Set up LinkedIn app with external callback URL');
  console.log('');
  
  console.log('🔍 If All Else Fails:');
  console.log('   • Check LinkedIn Status: https://www.linkedin-status.com/');
  console.log('   • Test from another device/location');
  console.log('   • Use network packet capture (Wireshark) to see what\'s blocked');
  console.log('   • Contact your network administrator with this diagnostic output');
}

// Run all diagnostics
async function runDiagnostics() {
  try {
    await testNetworkConnectivity();
    await testDNSResolution();
    await testLinkedInOAuthEndpoints();
    await checkNetworkConfiguration();
    await testAlternativeOAuthFlow();
    provideSolutions();
    
    console.log('\n✅ Network diagnostic complete');
    console.log('📋 Share this output with your network administrator if corporate firewall is suspected');
    
  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
  }
}

runDiagnostics();