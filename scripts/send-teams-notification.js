#!/usr/bin/env node

/**
 * Teams Notification Script
 * Sends test results to Microsoft Teams channel
 */

const TeamsNotificationManager = require('../utils/teamsNotification');

async function main() {
    const isTest = process.argv.includes('--test');
    
    try {
        const teamsManager = new TeamsNotificationManager();
        
        if (isTest) {
            console.log('🧪 Testing Teams notification...');
            
            // Send test notification
            const testData = {
                stats: { scenarios: 5, passed: 4, failed: 1 },
                scenarios: [
                    { name: 'Test Scenario 1', result: { status: 'PASSED' } },
                    { name: 'Test Scenario 2', result: { status: 'PASSED' } },
                    { name: 'Test Scenario 3', result: { status: 'PASSED' } },
                    { name: 'Test Scenario 4', result: { status: 'PASSED' } },
                    { name: 'Test Scenario 5', result: { status: 'FAILED' } }
                ],
                duration: '2m 30s'
            };
            
            await teamsManager.sendNotification(testData);
        } else {
            console.log('📊 Loading test results and sending to Teams...');
            
            const testResults = teamsManager.loadTestResults();
            await teamsManager.sendNotification(testResults);
        }
        
        console.log('✅ Teams notification completed');
    } catch (error) {
        console.error('❌ Teams notification failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
