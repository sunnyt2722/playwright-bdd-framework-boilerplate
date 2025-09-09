const { BeforeAll, Before, After, AfterAll, setWorldConstructor } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

// Initialize shared test execution metadata
global.testExecutionMetadata = {
    startTime: null,
    endTime: null,
    executedScenarios: 0
};

// World constructor
function CustomWorld({ attach, log, parameters }) {
    this.attach = attach;
    this.log = log;
    this.parameters = parameters || {};
}

setWorldConstructor(CustomWorld);

function getBrowserInstance(browserName) {
    switch (browserName.toLowerCase()) {
        case 'firefox': return firefox;
        case 'webkit': return webkit;
        case 'chrome':
        case 'chromium': return chromium;
        default: throw new Error(`Unsupported browser: ${browserName}`);
    }
}

BeforeAll(async function () {
    console.log(' [BeforeAll] Clearing screenshots');
    
    // Record test execution start time
    global.testExecutionMetadata.startTime = new Date();
    console.log(` [BeforeAll] Test execution started at: ${global.testExecutionMetadata.startTime.toLocaleString()}`);
    
    // Create execution metadata file for report generation
    const metadataPath = path.join('./reports', 'execution-metadata.json');
    if (!fs.existsSync('./reports')) {
        fs.mkdirSync('./reports', { recursive: true });
    }
    
    const initialMetadata = {
        startTime: global.testExecutionMetadata.startTime.toISOString(),
        browser: process.env.BROWSER || 'chrome',
        environment: process.env.ENV || 'dev',
        framework: 'PAW Playwright BDD',
        version: '1.0.0'
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(initialMetadata, null, 2));
    
    // Clear previous screenshots
    const screenshotDir = './test-results';
    if (fs.existsSync(screenshotDir)) {
        try {
            const files = fs.readdirSync(screenshotDir);
            files.forEach(file => {
                if (file.endsWith('.png') || file.endsWith('.jpg')) {
                    fs.unlinkSync(path.join(screenshotDir, file));
                }
            });
        } catch (error) {
            console.warn('Warning: Could not clear screenshots:', error.message);
        }
    }

    console.log('  [BeforeAll] Non-database tests - skipping SSH tunnel setup');
    console.log(' [BeforeAll] Integration manager disabled or not configured');
});

Before(async function (scenario) {
    // Increment scenario counter
    global.testExecutionMetadata.executedScenarios++;
    
    // Log scenario start
    console.log(`\n [Before] Starting scenario: ${scenario.pickle.name}`);
    console.log('TestRail integration disabled - skipping case management');
    
    // Add scenario timing to world
    this.scenarioStartTime = Date.now();
    
    // Launch browser
    const browserName = process.env.BROWSER || 'chrome';
    const browserInstance = getBrowserInstance(browserName);

    this.browser = await browserInstance.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    this.scenario = scenario;
});

After(async function (scenario) {
    // Calculate scenario duration
    const scenarioDuration = Date.now() - this.scenarioStartTime;
    
    // Log scenario completion
    const status = scenario.result.status.toUpperCase();
    console.log(` [After] Scenario completed: ${scenario.pickle.name} - ${status} (${scenarioDuration}ms)`);
    
    // Clean up dynamic headers to prevent cross-scenario interference
    try {
        if (global.clearDynamicHeaders) {
            global.clearDynamicHeaders();
            console.log(' [After] Cleared dynamic headers for next scenario');
        }
    } catch (error) {
        console.log('  [After] Failed to clear dynamic headers:', error.message);
    }
    
    // Take screenshot on failure for UI tests (before closing browser)
    if (scenario.result.status === 'FAILED' && this.page) {
        try {
            // Ensure the page is still available
            if (!this.page.isClosed()) {
                // Create screenshots directory if it doesn't exist
                const screenshotDir = './test-results/screenshots';
                if (!fs.existsSync(screenshotDir)) {
                    fs.mkdirSync(screenshotDir, { recursive: true });
                }

                // Generate unique filename for the screenshot
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const scenarioName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
                const screenshotPath = path.join(screenshotDir, `${scenarioName}_${timestamp}.png`);

                // Take screenshot and save to file
                const screenshot = await this.page.screenshot({
                    path: screenshotPath,
                    fullPage: true,
                    type: 'png'
                });

                // Attach screenshot to Cucumber report
                await this.attach(screenshot, 'image/png');
                
                console.log(` [After] Screenshot captured: ${screenshotPath}`);
            } else {
                console.warn('  [After] Page already closed, cannot take screenshot');
            }
        } catch (error) {
            console.warn('  [After] Could not take screenshot:', error.message);
        }
    }

    // Close browser properly
    try {
        if (this.page && !this.page.isClosed()) {
            await this.page.close();
        }
        if (this.context) {
            await this.context.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    } catch (error) {
        console.warn(' [After] Browser cleanup error:', error.message);
    }
});

AfterAll(async function () {
    // Record test execution end time
    global.testExecutionMetadata.endTime = new Date();
    const totalDuration = global.testExecutionMetadata.endTime - global.testExecutionMetadata.startTime;
    
    console.log(` [AfterAll] Test execution completed at: ${global.testExecutionMetadata.endTime.toLocaleString()}`);
    console.log(`  [AfterAll] Total execution time: ${(totalDuration / 1000).toFixed(2)}s`);
    
    // Update execution metadata file
    const metadataPath = path.join('./reports', 'execution-metadata.json');
    if (fs.existsSync(metadataPath)) {
        try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            metadata.endTime = global.testExecutionMetadata.endTime.toISOString();
            metadata.totalDuration = totalDuration;
            metadata.totalScenarios = global.testExecutionMetadata.executedScenarios;
            
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        } catch (error) {
            console.warn('  [AfterAll] Could not update execution metadata:', error.message);
        }
    }

    console.log('[DEBUG] TestRail Configuration Check:');
    console.log('  - TESTRAIL_KEY: NOT SET');
    console.log('  - TESTRAIL_SUITE_ID: 58893');
    console.log('  - TESTRAIL_ENABLED: false');
    console.log('  - Executed Cases: 0');
    console.log('  - Case IDs: ');
    console.log('[DEBUG] TestRail integration skipped because:');
    console.log('  - TESTRAIL_ENABLED is false (missing TESTRAIL_KEY or TESTRAIL_SUITE_ID)');
    console.log('  - No test cases were executed or linked with @C tags');
    
    console.log(' [AfterAll] Cleanup completed');
});

