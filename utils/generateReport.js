const report = require('multiple-cucumber-html-reporter');
const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced Report Generator with proper timing and metadata
 */
class ReportGenerator {
    constructor() {
        this.reportsDir = './reports';
        this.jsonReportPath = this.findCucumberJsonReport();
        this.reportData = null;
        this.executionMetadata = this.loadExecutionMetadata();
        this.useFallback = false;
    }

    /**
     * Find the appropriate cucumber JSON report file
     * Priority: environment-specific files first, then fallback to generic file
     */
    findCucumberJsonReport() {
        // Try environment-specific files first (updated for new env structure)
        const envFiles = [
            'cucumber_report_dev.json',
            'cucumber_report_test.json', 
            'cucumber_report_prod.json'
        ];

        for (const envFile of envFiles) {
            const envPath = path.join(this.reportsDir, envFile);
            if (fs.existsSync(envPath)) {
                console.log(` Found environment-specific report: ${envFile}`);
                return envPath;
            }
        }

        // Fallback to generic cucumber report
        const genericPath = path.join(this.reportsDir, 'cucumber_report.json');
        if (fs.existsSync(genericPath)) {
            console.log(` Using generic cucumber report: cucumber_report.json`);
            return genericPath;
        }

        console.log(`WARNING:  No cucumber JSON reports found, will use fallback`);
        return genericPath; // Return path anyway for error handling
    }

    /**
     * Load execution metadata from environment and execution metadata file
     */
    loadExecutionMetadata() {
        const metadata = {
            startTime: null,
            endTime: null,
            browser: 'chrome',
            environment: 'dev',
            totalDuration: 0,
            totalScenarios: 0,
            passedScenarios: 0,
            failedScenarios: 0,
            skippedScenarios: 0
        };

        // Try to load from execution metadata file first (more accurate)
        const metadataPath = path.join(this.reportsDir, 'execution-metadata.json');
        if (fs.existsSync(metadataPath)) {
            try {
                const fileMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                if (fileMetadata.startTime) {
                    metadata.startTime = new Date(fileMetadata.startTime).toLocaleString();
                }
                if (fileMetadata.endTime) {
                    metadata.endTime = new Date(fileMetadata.endTime).toLocaleString();
                }
                if (fileMetadata.totalDuration) {
                    metadata.totalDuration = fileMetadata.totalDuration;
                }
                if (fileMetadata.browser) {
                    metadata.browser = fileMetadata.browser;
                }
                if (fileMetadata.environment) {
                    metadata.environment = fileMetadata.environment;
                }
                if (fileMetadata.totalScenarios) {
                    metadata.totalScenarios = fileMetadata.totalScenarios;
                }
                console.log(' Loaded execution metadata from file');
            } catch (error) {
                console.warn('  Could not load execution metadata file:', error.message);
            }
        }

        // Fallback to environment variables
        if (!metadata.browser && process.env.BROWSER) {
            metadata.browser = process.env.BROWSER;
        }
        if (!metadata.environment && process.env.ENV) {
            metadata.environment = process.env.ENV;
        }

        return metadata;
    }

    /**
     * Analyze JSON report to extract timing and statistics
     */
    analyzeJsonReport() {
        if (!fs.existsSync(this.jsonReportPath)) {
            console.warn(`WARNING:  JSON report not found at ${this.jsonReportPath}`);
            console.log(' Will attempt to generate fallback report using available data...');
            this.useFallback = true;
            this.createFallbackJsonReport();
            return;
        }

        try {
            const jsonContent = fs.readFileSync(this.jsonReportPath, 'utf8');
            
            // Check if file is empty or contains only whitespace
            if (!jsonContent.trim()) {
                console.warn('  JSON report file is empty');
                this.useFallback = true;
                this.createFallbackJsonReport();
                return;
            }

            this.reportData = JSON.parse(jsonContent);
            
            // Validate JSON structure
            if (!Array.isArray(this.reportData)) {
                console.warn(`WARNING:  JSON report is not an array. Type: ${typeof this.reportData}`);
                this.useFallback = true;
                this.createFallbackJsonReport();
                return;
            }
            
            // Check if array is empty
            if (this.reportData.length === 0) {
                console.warn('  JSON report is an empty array');
                this.useFallback = true;
                this.createFallbackJsonReport();
                return;
            }
            
            console.log(` Analyzing JSON report with ${this.reportData.length} feature(s)...`);
            
            // Debug: Log first feature structure
            if (this.reportData.length > 0) {
                console.log(`DEBUG: First feature structure: ${Object.keys(this.reportData[0]).join(', ')}`);
                if (this.reportData[0].elements && Array.isArray(this.reportData[0].elements)) {
                    console.log(`DEBUG: First feature has ${this.reportData[0].elements.length} scenario(s)`);
                }
            }
            
            this.calculateExecutionTiming();
            this.calculateScenarioStatistics();
            this.detectBrowserFromReport();
            
        } catch (error) {
            console.error(`ERROR: Failed to parse JSON report: ${error.message}`);
            console.log(' Will attempt to generate fallback report using available data...');
            this.useFallback = true;
            this.createFallbackJsonReport();
        }
    }

    /**
     * Create a fallback JSON report when the primary report is missing or invalid
     */
    createFallbackJsonReport() {
        console.log(' Creating fallback JSON report...');
        
        // Try to gather information from pipeline results if available
        const pipelineResultsDir = './pipeline-results';
        let testStatus = 'UNKNOWN';
        let executionTime = 0;
        
        try {
            if (fs.existsSync(path.join(pipelineResultsDir, 'test_status.txt'))) {
                testStatus = fs.readFileSync(path.join(pipelineResultsDir, 'test_status.txt'), 'utf8').trim();
            }
            if (fs.existsSync(path.join(pipelineResultsDir, 'execution_time.txt'))) {
                executionTime = parseInt(fs.readFileSync(path.join(pipelineResultsDir, 'execution_time.txt'), 'utf8').trim()) || 0;
            }
        } catch (error) {
            console.warn('  Could not read pipeline results:', error.message);
        }

        // Create a minimal fallback report structure
        const fallbackReport = [{
            "uri": "features/fallback.feature",
            "id": "fallback-feature",
            "keyword": "Feature",
            "name": "Test Execution Report",
            "description": "Fallback report generated due to missing or invalid cucumber JSON data",
            "line": 1,
            "elements": [{
                "id": "test-execution-summary",
                "keyword": "Scenario",
                "name": `Test Execution - Status: ${testStatus}`,
                "description": "",
                "line": 3,
                "type": "scenario",
                "steps": [{
                    "keyword": "Given ",
                    "name": "Test execution was attempted",
                    "line": 4,
                    "match": {
                        "location": "step-definitions/fallback.js:1"
                    },
                    "result": {
                        "status": testStatus === 'PASSED' ? 'passed' : testStatus === 'FAILED' ? 'failed' : 'undefined',
                        "duration": executionTime * 1000000000 // Convert seconds to nanoseconds
                    }
                }],
                "tags": []
            }],
            "tags": []
        }];

        // Save fallback report
        const fallbackJsonPath = path.join(this.reportsDir, 'cucumber_report_fallback.json');
        fs.writeFileSync(fallbackJsonPath, JSON.stringify(fallbackReport, null, 2));
        console.log(` Fallback JSON report created at: ${fallbackJsonPath}`);
        
        // Update the report data and path to use fallback
        this.reportData = fallbackReport;
        this.jsonReportPath = fallbackJsonPath;
        
        // Calculate metadata from fallback data
        this.calculateFallbackMetadata(testStatus, executionTime);
    }

    /**
     * Calculate metadata when using fallback report
     */
    calculateFallbackMetadata(testStatus, executionTime) {
        // Set basic statistics
        this.executionMetadata.totalScenarios = 1;
        this.executionMetadata.passedScenarios = testStatus === 'PASSED' ? 1 : 0;
        this.executionMetadata.failedScenarios = testStatus === 'FAILED' ? 1 : 0;
        this.executionMetadata.skippedScenarios = testStatus === 'UNKNOWN' ? 1 : 0;
        this.executionMetadata.totalDuration = executionTime * 1000; // Convert to milliseconds

        // Set timing information
        if (!this.executionMetadata.startTime || !this.executionMetadata.endTime) {
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - (executionTime * 1000));
            
            this.executionMetadata.startTime = startTime.toLocaleString();
            this.executionMetadata.endTime = endTime.toLocaleString();
        }

        console.log(` Fallback Metadata: ${this.executionMetadata.totalScenarios} scenario(s), Status: ${testStatus}, Duration: ${executionTime}s`);
    }

    /**
     * Calculate actual execution timing from JSON report and metadata file
     */
    calculateExecutionTiming() {
        // If we already have timing from metadata file, use that (more accurate)
        if (this.executionMetadata.startTime && this.executionMetadata.endTime && this.executionMetadata.totalDuration) {
            console.log(`  Using metadata file timing - Duration: ${(this.executionMetadata.totalDuration / 1000).toFixed(2)}s`);
            return;
        }

        // Fallback: Calculate from JSON report step durations
        let totalDuration = 0;

        this.reportData.forEach(feature => {
            if (feature.elements) {
                feature.elements.forEach(scenario => {
                    if (scenario.steps) {
                        scenario.steps.forEach(step => {
                            if (step.result && step.result.duration) {
                                totalDuration += step.result.duration;
                            }
                        });
                    }
                });
            }
        });

        // Convert nanoseconds to milliseconds for total duration
        this.executionMetadata.totalDuration = totalDuration / 1000000;
        
        // Set execution times (approximated since Cucumber doesn't provide absolute timestamps)
        if (!this.executionMetadata.startTime || !this.executionMetadata.endTime) {
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - this.executionMetadata.totalDuration);
            
            this.executionMetadata.startTime = startTime.toLocaleString();
            this.executionMetadata.endTime = endTime.toLocaleString();
        }

        console.log(`  Calculated Duration from JSON: ${this.formatDuration(this.executionMetadata.totalDuration)}`);
    }

    /**
     * Calculate scenario statistics
     */
    calculateScenarioStatistics() {
        let totalScenarios = 0;
        let passedScenarios = 0;
        let failedScenarios = 0;
        let skippedScenarios = 0;

        this.reportData.forEach(feature => {
            if (feature.elements) {
                feature.elements.forEach(scenario => {
                    totalScenarios++;
                    
                    // Determine scenario status
                    let scenarioStatus = 'passed';
                    let hasFailedStep = false;
                    let hasSkippedStep = false;

                    if (scenario.steps) {
                        scenario.steps.forEach(step => {
                            if (step.result) {
                                if (step.result.status === 'failed') {
                                    hasFailedStep = true;
                                } else if (step.result.status === 'skipped') {
                                    hasSkippedStep = true;
                                }
                            }
                        });
                    }

                    if (hasFailedStep) {
                        scenarioStatus = 'failed';
                        failedScenarios++;
                    } else if (hasSkippedStep) {
                        scenarioStatus = 'skipped';
                        skippedScenarios++;
                    } else {
                        passedScenarios++;
                    }
                });
            }
        });

        this.executionMetadata.totalScenarios = totalScenarios;
        this.executionMetadata.passedScenarios = passedScenarios;
        this.executionMetadata.failedScenarios = failedScenarios;
        this.executionMetadata.skippedScenarios = skippedScenarios;

        console.log(` Scenarios: ${totalScenarios} total, ${passedScenarios} passed, ${failedScenarios} failed, ${skippedScenarios} skipped`);
    }

    /**
     * Detect browser from report data or world parameters
     */
    detectBrowserFromReport() {
        // Try to detect from world parameters in the JSON report
        if (this.reportData && this.reportData.length > 0) {
            const firstFeature = this.reportData[0];
            if (firstFeature.elements && firstFeature.elements.length > 0) {
                const firstScenario = firstFeature.elements[0];
                if (firstScenario.steps && firstScenario.steps.length > 0) {
                    // Look for world parameters in step metadata
                    const step = firstScenario.steps.find(s => s.match && s.match.location);
                    if (step) {
                        // Browser detection from environment variables or world parameters
                        if (process.env.BROWSER) {
                            this.executionMetadata.browser = process.env.BROWSER;
                        }
                    }
                }
            }
        }

        console.log(` Browser: ${this.executionMetadata.browser}`);
    }

    /**
     * Format duration from milliseconds to readable format (hrs, mins, secs)
     * @param {number} durationMs - Duration in milliseconds
     * @returns {string} Formatted duration string
     */
    formatDuration(durationMs) {
        const totalSeconds = Math.floor(durationMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
        
        return parts.join(' ');
    }

    /**
     * Generate the enhanced HTML report
     */
    generateReport() {
        console.log(' Starting HTML report generation...');
        
        // Ensure reports directory exists
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
            console.log(` Created reports directory: ${this.reportsDir}`);
        }

        // Analyze the report data (this will handle missing/invalid JSON)
        this.analyzeJsonReport();

        console.log(` Processing Cucumber JSON report: ${path.basename(this.jsonReportPath)}...`);
        if (this.useFallback) {
            console.log('  Using fallback report generation due to missing/invalid primary JSON report');
        }

        // Create a clean temporary directory for report generation to avoid JSON conflicts
        const tempReportDir = path.join(this.reportsDir, 'temp_report_generation');
        if (fs.existsSync(tempReportDir)) {
            fs.rmSync(tempReportDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempReportDir);

        // Copy the JSON report to temp directory
        const tempJsonPath = path.join(tempReportDir, 'cucumber_report.json');
        try {
            fs.copyFileSync(this.jsonReportPath, tempJsonPath);
        } catch (error) {
            console.error(`ERROR: Failed to copy JSON report: ${error.message}`);
            throw new Error(`Failed to prepare report data: ${error.message}`);
        }

        try {
            // Generate the enhanced report configuration using temp directory
            const reportConfig = {
                jsonDir: tempReportDir,
                reportPath: path.join(this.reportsDir, 'multiple-cucumber-html-report'),
                reportTitle: this.useFallback ? 'PAW Automation Test Execution Report (Fallback)' : 'PAW Automation Test Execution Report',
                pageTitle: 'PAW BDD Test Results',
                pageFooter: '<div><p>Generated by PAW Automation Framework</p></div>',
                displayDuration: true,
                displayReportTime: true,
                openReportInBrowser: false,
                disableLog: false,
                hideMetadata: false,
                metadata: {
                    browser: {
                        name: this.executionMetadata.browser,
                        version: 'latest'
                    },
                    device: 'Local Test Machine',
                    platform: {
                        name: os.type(),
                        version: os.release()
                    }
                },
                customData: {
                    title: 'Test Execution Summary',
                    data: [
                        { label: 'Project', value: 'Playwright BDD Framework' },
                        { label: 'Environment', value: this.executionMetadata.environment.toUpperCase() },
                        { label: 'Browser', value: this.executionMetadata.browser },
                        { label: 'Execution Start Time', value: this.executionMetadata.startTime || 'Unknown' },
                        { label: 'Execution End Time', value: this.executionMetadata.endTime || 'Unknown' },
                        { label: 'Total Duration', value: this.formatDuration(this.executionMetadata.totalDuration) },
                        { label: 'Report Type', value: this.useFallback ? 'Fallback Report' : 'Standard Report' }
                    ]
                }
            };

            // Generate the report
            report.generate(reportConfig);
            console.log('\n Enhanced HTML report generated successfully!');
            console.log(` Report location: ${path.join(this.reportsDir, 'multiple-cucumber-html-report', 'index.html')}`);
            console.log(` Summary: ${this.executionMetadata.passedScenarios}/${this.executionMetadata.totalScenarios} scenarios passed`);
            
            // Success rate calculation
            const successRate = this.executionMetadata.totalScenarios > 0 
                ? ((this.executionMetadata.passedScenarios / this.executionMetadata.totalScenarios) * 100).toFixed(1)
                : '0.0';
            console.log(` Success Rate: ${successRate}%`);
            
            if (this.useFallback) {
                console.log('  Note: This is a fallback report due to missing/invalid primary test data');
                console.log(' Primary cucumber JSON report was missing, empty, or malformed');
            }
            
        } catch (error) {
            console.error(' Multiple Cucumber HTML Reporter Error Details:');
            console.error('   Error:', error.message);
            console.error('   Stack:', error.stack);
            
            // Check if it's a known issue with the reporter
            if (error.message.includes('map is not a function')) {
                console.error(' This appears to be a data structure issue with the JSON report.');
                console.error('   The multiple-cucumber-html-reporter expects a specific JSON format.');
                console.error('   Please check the cucumber_report.json structure.');
            }
            
            // Try one more fallback approach - create a basic HTML report manually
            if (this.useFallback) {
                console.log(' Attempting to create basic HTML report manually...');
                this.createBasicHtmlReport();
                return;
            }
            
            throw new Error(`Failed to generate HTML report: ${error.message}`);
        } finally {
            // Clean up temporary directory
            if (fs.existsSync(tempReportDir)) {
                fs.rmSync(tempReportDir, { recursive: true, force: true });
            }
            
            // Clean up fallback JSON if created
            const fallbackJsonPath = path.join(this.reportsDir, 'cucumber_report_fallback.json');
            if (fs.existsSync(fallbackJsonPath) && this.useFallback) {
                try {
                    fs.unlinkSync(fallbackJsonPath);
                } catch (error) {
                    console.warn('  Could not clean up fallback JSON file:', error.message);
                }
            }
        }
    }

    /**
     * Create a basic HTML report manually when all else fails
     */
    createBasicHtmlReport() {
        const htmlReportDir = path.join(this.reportsDir, 'multiple-cucumber-html-report');
        if (!fs.existsSync(htmlReportDir)) {
            fs.mkdirSync(htmlReportDir, { recursive: true });
        }

        const basicHtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>PAW BDD Test Results - Basic Report</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status-failed { color: #dc3545; }
        .status-passed { color: #28a745; }
        .status-unknown { color: #ffc107; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table th, .info-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .info-table th { background-color: #f8f9fa; }
        .alert { padding: 15px; margin: 20px 0; border-radius: 4px; }
        .alert-warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PAW Automation Test Execution Report</h1>
            <h2>Basic Fallback Report</h2>
        </div>
        
        <div class="alert alert-warning">
            <strong> Fallback Report</strong><br>
            This is a basic report generated because the primary cucumber JSON report was missing or invalid.
            Test execution may have failed before generating proper results.
        </div>

        <table class="info-table">
            <tr><th>Property</th><th>Value</th></tr>
            <tr><td>Environment</td><td>${this.executionMetadata.environment.toUpperCase()}</td></tr>
            <tr><td>Browser</td><td>${this.executionMetadata.browser}</td></tr>
            <tr><td>Start Time</td><td>${this.executionMetadata.startTime || 'Unknown'}</td></tr>
            <tr><td>End Time</td><td>${this.executionMetadata.endTime || 'Unknown'}</td></tr>
            <tr><td>Duration</td><td>${this.formatDuration(this.executionMetadata.totalDuration)}</td></tr>
            <tr><td>Total Scenarios</td><td>${this.executionMetadata.totalScenarios}</td></tr>
            <tr><td>Passed</td><td class="status-passed">${this.executionMetadata.passedScenarios}</td></tr>
            <tr><td>Failed</td><td class="status-failed">${this.executionMetadata.failedScenarios}</td></tr>
            <tr><td>Skipped</td><td class="status-unknown">${this.executionMetadata.skippedScenarios}</td></tr>
        </table>

        <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Generated by PAW Automation Framework - Fallback Report Mode</p>
            <p>Report generated at: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;

        const htmlReportPath = path.join(htmlReportDir, 'index.html');
        fs.writeFileSync(htmlReportPath, basicHtmlContent);
        
        console.log(' Basic HTML report created successfully!');
        console.log(` Basic report location: ${htmlReportPath}`);
    }
}

// Main execution
if (require.main === module) {
    try {
        const generator = new ReportGenerator();
        generator.generateReport();
        
        // Ensure we have an index.html file
        const htmlReportPath = path.join('./reports', 'multiple-cucumber-html-report', 'index.html');
        if (fs.existsSync(htmlReportPath)) {
            console.log(' HTML report verification: index.html exists');
        } else {
            console.error(' HTML report verification: index.html NOT found');
            process.exit(1);
        }
        
    } catch (error) {
        console.error(' Report generation failed:', error.message);
        
        // Try to create an emergency basic report
        try {
            const emergencyGenerator = new ReportGenerator();
            emergencyGenerator.useFallback = true;
            emergencyGenerator.createBasicHtmlReport();
            console.log(' Emergency basic HTML report created');
        } catch (emergencyError) {
            console.error(' Emergency report creation also failed:', emergencyError.message);
        }
        
        process.exit(1);
    }
}

module.exports = ReportGenerator;
