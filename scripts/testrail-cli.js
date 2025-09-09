#!/usr/bin/env node

/**
 * TestRail CLI Script
 * Command line interface for TestRail operations
 */

const TestRailManager = require('../utils/testRail');
const fs = require('fs');

async function main() {
    const command = process.argv[2];
    const testRail = new TestRailManager();

    if (!testRail.isEnabled()) {
        console.log('🔕 TestRail integration is disabled or not configured');
        console.log('Set TESTRAIL_KEY and TESTRAIL_SUITE_ID environment variables to enable');
        return;
    }

    switch (command) {
        case 'report':
            await reportResults();
            break;
        case 'add':
            console.log('📝 Add test case functionality - implement as needed');
            break;
        case 'remove':
            console.log('🗑️ Remove test case functionality - implement as needed');
            break;
        case 'list-files':
            listReportFiles();
            break;
        default:
            showHelp();
    }

    async function reportResults() {
        try {
            console.log('📊 Processing test results for TestRail...');
            
            // Load test results
            const environment = process.env.ENV || 'dev';
            const reportFile = `./reports/cucumber_report_${environment}.json`;
            
            if (!fs.existsSync(reportFile)) {
                throw new Error(`Report file not found: ${reportFile}`);
            }

            const cucumberJson = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
            const testResults = parseTestResults(cucumberJson);
            
            const runName = `Automated Test Run - ${environment.toUpperCase()} - ${new Date().toISOString()}`;
            const run = await testRail.processTestResults(testResults, runName);
            
            if (run) {
                console.log(`✅ TestRail run created: ${testRail.getTestRunUrl(run.id)}`);
            }
        } catch (error) {
            console.error('❌ Failed to report results to TestRail:', error.message);
            process.exit(1);
        }
    }

    function parseTestResults(cucumberJson) {
        const scenarios = [];
        
        cucumberJson.forEach(feature => {
            feature.elements?.forEach(scenario => {
                if (scenario.type === 'scenario') {
                    const steps = scenario.steps || [];
                    const failed = steps.some(step => step.result?.status === 'failed');
                    
                    scenarios.push({
                        name: scenario.name,
                        feature: feature.name,
                        tags: scenario.tags || [],
                        result: { status: failed ? 'FAILED' : 'PASSED' }
                    });
                }
            });
        });

        const passed = scenarios.filter(s => s.result.status === 'PASSED').length;
        const failed = scenarios.filter(s => s.result.status === 'FAILED').length;

        return {
            scenarios,
            stats: { scenarios: scenarios.length, passed, failed }
        };
    }

    function listReportFiles() {
        console.log('📁 Available report files:');
        const reportDir = './reports';
        
        if (fs.existsSync(reportDir)) {
            const files = fs.readdirSync(reportDir)
                .filter(file => file.endsWith('.json'))
                .map(file => `  • ${file}`);
            
            if (files.length > 0) {
                console.log(files.join('\n'));
            } else {
                console.log('  No JSON report files found');
            }
        } else {
            console.log('  Reports directory not found');
        }
    }

    function showHelp() {
        console.log(`
TestRail CLI Usage:

  npm run testrail:report     - Upload test results to TestRail
  npm run testrail:add        - Add test case (to be implemented)
  npm run testrail:remove     - Remove test case (to be implemented)
  npm run testrail:list-files - List available report files

Environment Variables:
  TESTRAIL_KEY        - TestRail API key
  TESTRAIL_SUITE_ID   - TestRail suite ID
  TESTRAIL_PROJECT_ID - TestRail project ID (optional)
  ENV                 - Environment (dev/test/prod)
        `);
    }
}

if (require.main === module) {
    main();
}
