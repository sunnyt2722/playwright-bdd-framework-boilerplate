const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config/testRailConfig');

// Constants
const TESTRAIL_URL = config.TESTRAIL_URL;
const TESTRAIL_KEY = config.TESTRAIL_KEY;

const AUTH_HEADER = {
    Authorization: TESTRAIL_KEY,
    'Content-Type': 'application/json'
};

/**
 * TestRail Integration Manager
 */
class TestRailManager {
    constructor() {
        this.config = config;
        this.enabled = config.TESTRAIL_ENABLED;
    }

    /**
     * Check if TestRail integration is enabled
     */
    isEnabled() {
        return this.enabled && TESTRAIL_KEY;
    }

    /**
     * Create a test run in TestRail
     */
    async createTestRun(name, description = '') {
        if (!this.isEnabled()) {
            console.log('🔕 TestRail integration disabled');
            return null;
        }

        try {
        const response = await axios.post(
                `${TESTRAIL_URL}/index.php?/api/v2/add_run/${config.PROJECT_ID}`,
                {
                    suite_id: config.SUITE_ID,
                    name: name,
                    description: description,
                    include_all: false,
                    case_ids: []
                },
                { headers: AUTH_HEADER, timeout: 30000 }
            );

            console.log(`✅ Created TestRail run: ${response.data.id}`);
        return response.data;
    } catch (error) {
            console.error('❌ Failed to create TestRail run:', error.message);
        return null;
    }
}

/**
     * Add test result to TestRail
     */
    async addTestResult(runId, caseId, status, comment = '') {
        if (!this.isEnabled()) return;

        try {
            await axios.post(
                `${TESTRAIL_URL}/index.php?/api/v2/add_result_for_case/${runId}/${caseId}`,
                {
                    status_id: status,
                    comment: comment
                },
                { headers: AUTH_HEADER, timeout: 30000 }
            );

            console.log(`✅ Added result for case ${caseId} in run ${runId}`);
    } catch (error) {
            console.error(`❌ Failed to add result for case ${caseId}:`, error.message);
        }
    }

    /**
     * Process test results and upload to TestRail
     */
    async processTestResults(testResults, runName) {
        if (!this.isEnabled()) return;

        try {
            // Create test run
            const run = await this.createTestRun(runName);
            if (!run) return;

            // Process each scenario
            for (const scenario of testResults.scenarios) {
                const caseId = this.extractTestCaseId(scenario);
                if (caseId) {
                    const status = scenario.result.status === 'PASSED' ? 
                        config.STATUS_IDS.PASSED : 
                        config.STATUS_IDS.FAILED;
                    
                    const comment = scenario.result.status === 'FAILED' ? 
                        `Test failed: ${scenario.name}` : 
                        `Test passed: ${scenario.name}`;
                    
                    await this.addTestResult(run.id, caseId, status, comment);
                }
            }

            console.log(`✅ TestRail results uploaded to run: ${run.id}`);
            return run;
        } catch (error) {
            console.error('❌ Failed to process TestRail results:', error.message);
        }
    }

    /**
     * Extract TestRail case ID from scenario tags
     */
    extractTestCaseId(scenario) {
        if (!scenario.tags) return null;
        
        for (const tag of scenario.tags) {
            const match = tag.name.match(/@C(\d+)/);
            if (match) return parseInt(match[1]);
        }
        return null;
    }

    /**
     * Get test run URL
     */
    getTestRunUrl(runId) {
        return `${TESTRAIL_URL}/index.php?/runs/view/${runId}`;
    }

    /**
     * Close test run
     */
    async closeTestRun(runId) {
        if (!this.isEnabled()) return;

        try {
            await axios.post(
                `${TESTRAIL_URL}/index.php?/api/v2/close_run/${runId}`,
                {},
                { headers: AUTH_HEADER, timeout: 30000 }
            );

            console.log(`✅ Closed TestRail run: ${runId}`);
        } catch (error) {
            console.error(`❌ Failed to close TestRail run ${runId}:`, error.message);
        }
    }
}

module.exports = TestRailManager;
