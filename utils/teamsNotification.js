const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Teams Notification Manager for PAW Automation Framework
 * Sends formatted test results to Microsoft Teams channels via PowerAutomate webhook
 */
class TeamsNotificationManager {
  constructor() {
    this.webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    this.environment = process.env.ENV || 'dev';
    this.browser = process.env.BROWSER || 'chrome';
    this.targetTags = ['@Compensation', '@Registration', '@GamingHistory', '@GameConfig', '@Personalisation', '@SlotSession'];

    // Teams mention configuration
    this.enableMentions = process.env.TEAMS_ENABLE_MENTIONS !== 'false'; // Default: true
    this.mentionOnFailureOnly = process.env.TEAMS_MENTION_FAILURE_ONLY === 'true'; // Default: false

    // GitLab CI environment variables
    this.gitlabPipelineUrl = process.env.CI_PIPELINE_URL || '';
    this.gitlabJobUrl = process.env.CI_JOB_URL || '';
    this.gitlabProjectUrl = process.env.CI_PROJECT_URL || '';
    this.gitlabCommitSha = process.env.CI_COMMIT_SHA || '';
    this.gitlabBranch = process.env.CI_COMMIT_REF_NAME || '';
  }

  /**
   * Send notification to Teams
   */
  async sendNotification(reportData) {
    if (!this.webhookUrl) {
      console.log('🔕 Teams webhook URL not configured, skipping notification');
      return;
    }

    try {
      const message = this.buildTeamsMessage(reportData);
      
      await axios.post(this.webhookUrl, message, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      console.log('✅ Teams notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Teams notification:', error.message);
    }
  }

  /**
   * Build Teams message format
   */
  buildTeamsMessage(reportData) {
    const { stats, scenarios, duration } = reportData;
    const isSuccess = stats.failed === 0;
    
    const message = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": isSuccess ? "00FF00" : "FF0000",
      "summary": `Test Results - ${this.environment.toUpperCase()}`,
      "sections": [
        {
          "activityTitle": `🧪 Test Execution ${isSuccess ? 'Passed' : 'Failed'}`,
          "activitySubtitle": `Environment: ${this.environment.toUpperCase()} | Browser: ${this.browser}`,
          "facts": [
            { "name": "Total Scenarios", "value": stats.scenarios.toString() },
            { "name": "Passed", "value": stats.passed.toString() },
            { "name": "Failed", "value": stats.failed.toString() },
            { "name": "Duration", "value": duration },
            { "name": "Environment", "value": this.environment.toUpperCase() },
            { "name": "Browser", "value": this.browser.toUpperCase() }
          ]
        }
      ]
    };

    // Add failed scenarios if any
    if (stats.failed > 0) {
      const failedScenarios = scenarios.filter(s => s.result.status === 'FAILED');
      message.sections.push({
        "activityTitle": "❌ Failed Scenarios",
        "text": failedScenarios.map(s => `• ${s.name}`).join('\n')
      });
    }

    // Add GitLab info if available
    if (this.gitlabPipelineUrl) {
      message.sections.push({
        "activityTitle": "🚀 GitLab Pipeline",
        "facts": [
          { "name": "Branch", "value": this.gitlabBranch },
          { "name": "Commit", "value": this.gitlabCommitSha.substring(0, 8) }
        ]
      });

      message.potentialAction = [
        {
          "@type": "OpenUri",
          "name": "View Pipeline",
          "targets": [{ "os": "default", "uri": this.gitlabPipelineUrl }]
        }
      ];
    }

    return message;
  }

  /**
   * Load test results from JSON report
   */
  loadTestResults() {
    const reportFiles = [
      `./reports/cucumber_report_${this.environment}.json`,
      './reports/cucumber_report.json'
    ];

    for (const reportFile of reportFiles) {
      if (fs.existsSync(reportFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
          return this.parseTestResults(data);
        } catch (error) {
          console.warn(`Failed to parse ${reportFile}:`, error.message);
        }
      }
    }

    throw new Error('No valid test report found');
  }

  /**
   * Parse Cucumber JSON results
   */
  parseTestResults(cucumberJson) {
    const scenarios = [];
    let totalPassed = 0;
    let totalFailed = 0;

    cucumberJson.forEach(feature => {
      feature.elements?.forEach(scenario => {
        if (scenario.type === 'scenario') {
          const steps = scenario.steps || [];
          const failed = steps.some(step => step.result?.status === 'failed');
          
          scenarios.push({
            name: scenario.name,
            feature: feature.name,
            result: { status: failed ? 'FAILED' : 'PASSED' },
            duration: this.calculateDuration(steps)
          });

          if (failed) totalFailed++;
          else totalPassed++;
        }
      });
    });

    return {
      stats: {
        scenarios: scenarios.length,
        passed: totalPassed,
        failed: totalFailed
      },
      scenarios,
      duration: this.formatDuration(scenarios.reduce((sum, s) => sum + s.duration, 0))
    };
  }

  /**
   * Calculate scenario duration from steps
   */
  calculateDuration(steps) {
    return steps.reduce((total, step) => {
      return total + (step.result?.duration || 0);
    }, 0);
  }

  /**
   * Format duration in human readable format
   */
  formatDuration(nanoseconds) {
    const seconds = Math.round(nanoseconds / 1000000000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }
}

module.exports = TeamsNotificationManager;
