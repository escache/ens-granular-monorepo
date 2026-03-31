 #!/usr/bin/env node
/**
 * Automated Test Runner for ENS Granular Contracts
 * Runs tests with reporting, coverage, and gas analysis
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', 'reports', 'test-results');
const COVERAGE_DIR = path.join(__dirname, '..', 'coverage');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Configuration
const config = {
  testFiles: [
    'test/GranularNameAssignment.test.js',
    'test/FullControllerAutomated.test.js',
    'test/ENSCompatibility.test.js',
    'test/IndexedENSManager.test.js'
  ],
  forkMainnet: process.argv.includes('--fork'),
  coverage: process.argv.includes('--coverage'),
  gasReport: process.argv.includes('--gas'),
  verbose: process.argv.includes('--verbose'),
  watch: process.argv.includes('--watch'),
  parallel: process.argv.includes('--parallel'),
  bail: process.argv.includes('--bail'),
  specific: process.argv.find(arg => arg.startsWith('--test='))?.split('=')[1]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log('='.repeat(60), 'cyan');
  log(` ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
  console.log('');
}

async function runCommand(command, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, ...env },
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function compile() {
  logSection('Compiling Contracts');
  await runCommand('npx', ['hardhat', 'compile']);
  log('Compilation successful', 'green');
}

async function runTests() {
  logSection('Running Tests');
  
  const args = ['hardhat', 'test'];
  const env = {};

  if (config.forkMainnet) {
    log('Running with mainnet fork...', 'yellow');
    env.FORK_MAINNET = 'true';
  }

  if (config.gasReport) {
    log('Gas reporting enabled', 'yellow');
    env.REPORT_GAS = 'true';
  }

  if (config.specific) {
    args.push(config.specific);
    log(`Running specific test: ${config.specific}`, 'yellow');
  }

  if (config.bail) {
    args.push('--bail');
  }

  if (config.parallel) {
    args.push('--parallel');
  }

  await runCommand('npx', args, env);
  log('All tests passed', 'green');
}

async function runCoverage() {
  logSection('Running Coverage Analysis');
  await runCommand('npx', ['hardhat', 'coverage']);
  log('Coverage report generated', 'green');
  
  // Copy coverage summary to reports
  if (fs.existsSync(path.join(COVERAGE_DIR, 'coverage-summary.json'))) {
    fs.copyFileSync(
      path.join(COVERAGE_DIR, 'coverage-summary.json'),
      path.join(REPORTS_DIR, 'coverage-summary.json')
    );
  }
}

async function generateReport(startTime, results) {
  logSection('Generating Test Report');
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${duration}s`,
    config: {
      forkMainnet: config.forkMainnet,
      coverage: config.coverage,
      gasReport: config.gasReport
    },
    results: results,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };

  const reportPath = path.join(REPORTS_DIR, 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate markdown summary
  const summaryPath = path.join(REPORTS_DIR, 'TEST-RESULTS-SUMMARY.md');
  const summary = `# Test Results Summary

Generated: ${report.timestamp}
Duration: ${report.duration}

## Configuration
- Mainnet Fork: ${config.forkMainnet ? 'Yes' : 'No'}
- Coverage: ${config.coverage ? 'Yes' : 'No'}
- Gas Report: ${config.gasReport ? 'Yes' : 'No'}

## Results
- Status: ${results.success ? 'PASSED' : 'FAILED'}
- Tests Run: ${results.testsRun || 'All'}

## Environment
- Node: ${report.environment.node}
- Platform: ${report.environment.platform}
- Architecture: ${report.environment.arch}
`;
  
  fs.writeFileSync(summaryPath, summary);
  
  // Save run date
  fs.writeFileSync(
    path.join(REPORTS_DIR, 'test-run-date.txt'),
    new Date().toISOString()
  );
  
  log(`Report saved to: ${reportPath}`, 'green');
  log(`Summary saved to: ${summaryPath}`, 'green');
}

async function main() {
  const startTime = Date.now();
  const results = { success: true, testsRun: 0 };

  try {
    log('ENS Granular Contracts - Automated Test Suite', 'bright');
    log(`Started at: ${new Date().toISOString()}`, 'cyan');
    
    // Compile first
    await compile();
    
    // Run tests
    await runTests();
    
    // Run coverage if requested
    if (config.coverage) {
      await runCoverage();
    }
    
    results.success = true;
    
  } catch (error) {
    results.success = false;
    results.error = error.message;
    log(`Error: ${error.message}`, 'red');
  }
  
  // Generate report
  await generateReport(startTime, results);
  
  // Final status
  logSection('Final Status');
  if (results.success) {
    log('All tests completed successfully', 'green');
  } else {
    log('Tests failed', 'red');
    process.exit(1);
  }
}

// Show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
ENS Granular Contracts - Test Automation

Usage: node scripts/test-automation.js [options]

Options:
  --fork        Run tests with mainnet fork
  --coverage    Generate coverage report
  --gas         Enable gas reporting
  --verbose     Show verbose output
  --watch       Watch mode (rerun on changes)
  --parallel    Run tests in parallel
  --bail        Stop on first failure
  --test=FILE   Run specific test file
  --help, -h    Show this help message

Examples:
  node scripts/test-automation.js
  node scripts/test-automation.js --fork --gas
  node scripts/test-automation.js --coverage
  node scripts/test-automation.js --test=test/GranularNameAssignment.test.js
`);
  process.exit(0);
}

main().catch(console.error);

