const axios = require('axios');
const jiraConfig = require('../config/jiraConfig');

class JiraIntegrationManager {
    constructor() {
        // Jira configuration
        this.jiraConfig = {
            baseUrl: jiraConfig.baseUrl,
            email: jiraConfig.email,
            token: jiraConfig.token,
            enabled: !!jiraConfig.token
        };
    }

    /**
     * Check if Jira integration is enabled
     */
    isEnabled() {
        return this.jiraConfig.enabled && this.jiraConfig.token;
    }

    /**
     * Post test results to Jira ticket
     */
    async postTestResults(ticketKey, testResults) {
        if (!this.isEnabled()) {
            console.log('🔕 Jira integration disabled or not configured');
            return;
        }

        try {
            const comment = this.buildJiraComment(testResults);
            await this.addCommentToTicket(ticketKey, comment);
            console.log(`✅ Posted test results to Jira ticket: ${ticketKey}`);
        } catch (error) {
            console.error(`❌ Failed to post to Jira ticket ${ticketKey}:`, error.message);
        }
    }

    /**
     * Add comment to Jira ticket
     */
    async addCommentToTicket(ticketKey, comment) {
        const url = `${this.jiraConfig.baseUrl}/rest/api/2/issue/${ticketKey}/comment`;
        
        const auth = Buffer.from(`${this.jiraConfig.email}:${this.jiraConfig.token}`).toString('base64');
        
        await axios.post(url, 
            { body: comment },
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
    }

    /**
     * Build Jira comment from test results
     */
    buildJiraComment(testResults) {
        const { stats, duration, environment, browser } = testResults;
        const isSuccess = stats.failed === 0;
        
        const template = isSuccess ? jiraConfig.commentTemplates.success : jiraConfig.commentTemplates.failure;
        
        return template
            .replace('{{environment}}', environment || 'dev')
            .replace('{{browser}}', browser || 'chrome')
            .replace('{{duration}}', duration || 'N/A')
            .replace('{{passedScenarios}}', stats.passed.toString())
            .replace('{{totalScenarios}}', stats.scenarios.toString())
            .replace('{{testDetails}}', this.formatTestDetails(testResults))
            .replace('{{failedTests}}', this.formatFailedTests(testResults))
            .replace('{{timestamp}}', new Date().toISOString())
            .replace('{{testRailSection}}', '')
            .replace('{{gitlabSection}}', this.formatGitLabSection());
    }

    /**
     * Format test details for Jira comment
     */
    formatTestDetails(testResults) {
        const { scenarios } = testResults;
        return scenarios.map(scenario => 
            `• ${scenario.name}: ${scenario.result.status}`
        ).join('\n');
    }

    /**
     * Format failed tests for Jira comment
     */
    formatFailedTests(testResults) {
        const { scenarios } = testResults;
        const failed = scenarios.filter(s => s.result.status === 'FAILED');
        return failed.map(scenario => `• ${scenario.name}`).join('\n');
    }

    /**
     * Format GitLab section for Jira comment
     */
    formatGitLabSection() {
        if (!jiraConfig.gitlabPipelineUrl) return '';
        
        return jiraConfig.commentTemplates.gitlabSection
            .replace('{{gitlabPipelineUrl}}', jiraConfig.gitlabPipelineUrl)
            .replace('{{gitlabJobUrl}}', jiraConfig.gitlabJobUrl)
            .replace('{{gitlabProjectUrl}}', jiraConfig.gitlabProjectUrl);
    }

    /**
     * Extract Jira ticket from scenario tags
     */
    extractJiraTicketFromTags(scenario) {
        if (!scenario.tags) return null;
        
        for (const tag of scenario.tags) {
            const match = tag.name.match(/@([A-Z]+-\d+)/);
            if (match) return match[1];
        }
        return null;
    }

    /**
     * Process test results and post to relevant Jira tickets
     */
    async processTestResults(testResults) {
        if (!this.isEnabled()) return;

        const { scenarios } = testResults;
        const ticketMap = new Map();

        // Group scenarios by Jira ticket
        scenarios.forEach(scenario => {
            const ticket = this.extractJiraTicketFromTags(scenario) || 
                          jiraConfig.testCaseMapping[scenario.name];
            
            if (ticket) {
                if (!ticketMap.has(ticket)) {
                    ticketMap.set(ticket, []);
                }
                ticketMap.get(ticket).push(scenario);
            }
        });

        // Post results to each ticket
        for (const [ticket, scenarioList] of ticketMap) {
            const ticketResults = {
                ...testResults,
                scenarios: scenarioList,
                stats: this.calculateStats(scenarioList)
            };
            
            await this.postTestResults(ticket, ticketResults);
        }
    }

    /**
     * Calculate stats for a subset of scenarios
     */
    calculateStats(scenarios) {
        const passed = scenarios.filter(s => s.result.status === 'PASSED').length;
        const failed = scenarios.filter(s => s.result.status === 'FAILED').length;
        
        return {
            scenarios: scenarios.length,
            passed,
            failed
        };
    }
}

module.exports = JiraIntegrationManager;
