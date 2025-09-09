const jiraConfig = {
   // Jira instance details
   baseUrl: 'https://jira.gamesys.co.uk',
   
   // Authentication - Personal Access Token
   email: process.env.JIRA_EMAIL || '',
   token: process.env.JIRA_TOKEN || '',
   
   // Integration flags
   enabled: process.env.JIRA_INTEGRATION_ENABLED === 'true',
   gitlabEnabled: process.env.GITLAB_CI === 'true',
   
   // GitLab integration
   gitlabPipelineUrl: process.env.CI_PIPELINE_URL || '',
   gitlabJobUrl: process.env.CI_JOB_URL || '',
   gitlabProjectUrl: process.env.CI_PROJECT_URL || '',
   
   // Test case mapping - maps feature scenarios to Jira tickets
   testCaseMapping: {
       'GetCompensationCategories': 'GTECH-1307938',
       'getCompensationCategories': 'GTECH-1307938',
       'Game Minimum Bet Limits Validation': 'GTECH-1307938',
       'Gameplay': 'GTECH-1307938'
   },
   
   // Auto-detect Jira ticket from tags (e.g., @GTECH-1307938)
   autoDetectFromTags: true,
   
   // Comment templates
   commentTemplates: {
       header: `✅ Test Execution Successful`,
       
       success: `✅ Test Execution Successful

📊 Test Summary:

Environment: {{environment}}
Browser: {{browser}}
Execution Time: {{duration}}
Status: PASSED
Scenarios: {{passedScenarios}}/{{totalScenarios}} passed

📝 Test Details:
{{testDetails}}

{{testRailSection}}
🚀 GitLab Pipeline:
{{gitlabSection}}

⏰ Executed: {{timestamp}}

—
Posted by PAW Framework v1.0`,

       failure: `❌ Test Execution Failed

📊 Test Summary:

Environment: {{environment}}
Browser: {{browser}}
Execution Time: {{duration}}
Status: FAILED
Scenarios: {{passedScenarios}}/{{totalScenarios}} passed

❌ Failed Tests:
{{failedTests}}

📝 Test Details:
{{testDetails}}

{{testRailSection}}
🚀 GitLab Pipeline:
{{gitlabSection}}

⏰ Executed: {{timestamp}}

—
Posted by PAW Framework v1.0`,

       testRailSection: `
* TestRail Integration:*
- Test Run: {{testRailRunUrl}}
- Suite ID: {{testRailSuiteId}}
- Results uploaded automatically`,

       gitlabSection: `
Pipeline: [View Pipeline]({{gitlabPipelineUrl}})
Job: [View Job]({{gitlabJobUrl}})
Project: [View Project]({{gitlabProjectUrl}})`
   },
   
   // Request configuration
   requestConfig: {
       timeout: 30000,
       headers: {
           'Content-Type': 'application/json',
           'Accept': 'application/json',
           'X-Atlassian-Token': 'no-check'
       }
   }
};

module.exports = jiraConfig;
