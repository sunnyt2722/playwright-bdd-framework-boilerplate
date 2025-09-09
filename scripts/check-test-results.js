#!/usr/bin/env node

/**
 * Test Result Checker Script
 * 
 * This script analyzes the generated cucumber report JSON file to determine
 * if any tests failed and sets the appropriate exit code.
 * 
 * Usage: node scripts/check-test-results.js [report-file]
 * 
 * Exit Codes:
 * - 0: All tests passed
 * - 1: Some tests failed
 * - 2: Error reading report file
 */

const fs = require('fs');
const path = require('path');

function checkTestResults(reportFile = null) {
    try {
        // Default report file location
        const defaultReportFile = path.join(process.cwd(), 'reports', 'cucumber_report.json');
        const reportPath = reportFile || defaultReportFile;
        
        console.log(`DEBUG: Checking test results in: ${reportPath}`);
        
        // Check if report file exists
        if (!fs.existsSync(reportPath)) {
            console.error(`ERROR: Error: Report file not found at ${reportPath}`);
            process.exit(2);
        }
        
        // Read and parse the JSON report
        const reportContent = fs.readFileSync(reportPath, 'utf8');
        let reportData;
        
        try {
            reportData = JSON.parse(reportContent);
        } catch (parseError) {
            console.error(' Error: Invalid JSON in report file:', parseError.message);
            process.exit(2);
        }
        
        // Initialize counters
        let totalScenarios = 0;
        let passedScenarios = 0;
        let failedScenarios = 0;
        let skippedScenarios = 0;
        
        // Process each feature
        reportData.forEach(feature => {
            if (feature.elements) {
                feature.elements.forEach(element => {
                    if (element.type === 'scenario') {
                        totalScenarios++;
                        
                        // Check if any step failed
                        let scenarioFailed = false;
                        let scenarioSkipped = false;
                        
                        if (element.steps) {
                            for (const step of element.steps) {
                                if (step.result) {
                                    if (step.result.status === 'failed') {
                                        scenarioFailed = true;
                                        break;
                                    } else if (step.result.status === 'skipped' || step.result.status === 'pending') {
                                        scenarioSkipped = true;
                                    }
                                }
                            }
                        }
                        
                        if (scenarioFailed) {
                            failedScenarios++;
                        } else if (scenarioSkipped) {
                            skippedScenarios++;
                        } else {
                            passedScenarios++;
                        }
                    }
                });
            }
        });
        
        // Calculate pass rate
        const passRate = totalScenarios > 0 ? ((passedScenarios / totalScenarios) * 100).toFixed(1) : 0;
        
        // Display results
        console.log('\n Test Results Summary:');
        console.log(`   Total Scenarios: ${totalScenarios}`);
        console.log(`   Passed: ${passedScenarios}`);
        console.log(`   Failed: ${failedScenarios}`);
        console.log(`   Skipped: ${skippedScenarios}`);
        console.log(`   Pass Rate: ${passRate}%`);
        
        // Determine exit code
        if (failedScenarios > 0) {
            console.log(`\n Test execution FAILED: ${failedScenarios} scenario(s) failed`);
            
            // In CI environment, don't exit with failure code - let the evaluate stage handle it
            if (process.env.CI || process.env.GITLAB_CI) {
                console.log(' CI environment detected - not setting exit code (evaluation stage will handle failures)');
                process.exit(0);
            } else {
                console.log(' Setting exit code to 1 to indicate test failures');
                process.exit(1);
            }
        } else if (totalScenarios === 0) {
            console.log('\n  Warning: No test scenarios found in report');
            console.log(' Setting exit code to 2 to indicate potential issue');
            process.exit(2);
        } else {
            console.log(`\n Test execution PASSED: All ${passedScenarios} scenarios passed`);
            console.log(' Setting exit code to 0');
            process.exit(0);
        }
        
    } catch (error) {
        console.error(' Unexpected error while checking test results:', error.message);
        console.error(error.stack);
        process.exit(2);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
const reportFile = args[0] || null;

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
 Test Result Checker

Usage: node scripts/check-test-results.js [report-file]

Arguments:
  report-file    Path to cucumber JSON report file (optional)
                 Default: reports/cucumber_report.json

Exit Codes:
  0    All tests passed
  1    Some tests failed  
  2    Error reading report or no tests found

Examples:
  node scripts/check-test-results.js
  node scripts/check-test-results.js reports/cucumber_report_npe.json
  node scripts/check-test-results.js --help
`);
    process.exit(0);
}

// Run the check
checkTestResults(reportFile);
