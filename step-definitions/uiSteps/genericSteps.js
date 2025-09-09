const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('playwright');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const envConfig = require('../../utils/envConfig');

// Global variables
let browser;
let context;
let page;

// Load test data based on environment
function loadTestData() {
    const currentEnv = process.env.ENV || 'dev';
    const filePath = path.resolve(__dirname, '../../test-data/', `${currentEnv}.json`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Test data file not found: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Load UI locators from page object classes
function loadLocators(pageName) {
    let allLocators = {};
    
    try {
        // Import page object classes and get their locators
        const GoogleHomePage = require('../../page-objects/googleHomePage');
        const GoogleSearchPage = require('../../page-objects/googleSearchPage');
        const LoginPage = require('../../page-objects/loginPage');
        const CreateAccountPage = require('../../page-objects/createAccountPage');
        const CommonElements = require('../../page-objects/commonElements');
        
        // Merge all locators from page objects
        allLocators = {
            ...GoogleHomePage.getLocators(),
            ...GoogleSearchPage.getLocators(),
            ...LoginPage.getLocators(),
            ...CreateAccountPage.getLocators(),
            ...CommonElements.getLocators()
        };
        
    } catch (error) {
        console.warn('Failed to load locators from page objects:', error.message);
    }
    
    // If a specific page is requested, return only that page's locators
    if (pageName && allLocators[pageName]) {
        return { [pageName]: allLocators[pageName] };
    }
    
    return allLocators;
}

// Browser setup
Before(async function () {
    const browserType = process.env.BROWSER || 'chrome';
    const config = envConfig.getConfig();
    
    // Launch browser based on type
    switch (browserType.toLowerCase()) {
        case 'firefox':
            browser = await firefox.launch({ headless: true });
            break;
        case 'webkit':
        case 'safari':
            browser = await webkit.launch({ headless: true });
            break;
        case 'chrome':
        case 'chromium':
        default:
            browser = await chromium.launch({ headless: true });
            break;
    }
    
    // Create context and page
    context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true
    });
    
    page = await context.newPage();
    
    // Make page available to step definitions
    this.browser = browser;
    this.context = context;
    this.page = page;
    
    console.log(`Browser launched: ${browserType}`);
});

// Browser cleanup is handled in hooks.js
// After(async function () {
//     if (page) await page.close();
//     if (context) await context.close();
//     if (browser) await browser.close();
// });

// Generic navigation steps
Given('I navigate to {string}', async function (url) {
    const config = loadTestData();
    let fullUrl = url;
    
    // Handle relative URLs
    if (!url.startsWith('http')) {
        fullUrl = `${config.baseUrl}${url}`;
    }
    
    await this.page.goto(fullUrl);
    console.log(`Navigated to: ${fullUrl}`);
});

// Generic element interaction steps
When('I click on element {string}', async function (selector) {
    await this.page.click(selector);
    console.log(`Clicked on element: ${selector}`);
});

When('I type {string} into element {string}', async function (text, selector) {
    // Check if text is a JSON path (e.g., "testUser.email")
    let actualText = text;
    if (text.includes('.')) {
        const config = loadTestData();
        const keys = text.split('.');
        let value = config;
        for (const key of keys) {
            value = value[key];
            if (value === undefined) break;
        }
        if (value !== undefined) {
            actualText = value;
        }
    }
    
    await this.page.fill(selector, actualText);
    console.log(`Typed "${actualText}" into element: ${selector}`);
});

When('I enter value for {string} on {string} page from {string}', async function (elementName, pageName, dataSource) {
    // Enhanced generic step that supports page objects and various data sources
    let actualValue;
    
    // Get value from different sources
    if (dataSource === 'randomEmail') {
        // Generate random email
        const timestamp = Date.now();
        actualValue = `test${timestamp}@example.com`;
    } else if (dataSource === 'randomString') {
        // Generate random string
        actualValue = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    } else if (dataSource === 'currentTimestamp') {
        // Current timestamp
        actualValue = Date.now().toString();
    } else if (dataSource.includes('.')) {
        // JSON path (e.g., "testUser.email")
        const config = loadTestData();
        const keys = dataSource.split('.');
        let jsonValue = config;
        for (const key of keys) {
            jsonValue = jsonValue[key];
            if (jsonValue === undefined) break;
        }
        actualValue = jsonValue !== undefined ? jsonValue : dataSource;
    } else {
        // Check if it's a direct JSON property
        const config = loadTestData();
        actualValue = config[dataSource] !== undefined ? config[dataSource] : dataSource;
    }
    
    // Get element selector from page-specific locators or use default strategies
    const locators = loadLocators(pageName);
    let selectors = [];
    
    // Check if element is defined in the specific page's locators
    if (locators[pageName] && locators[pageName][elementName]) {
        selectors.push(locators[pageName][elementName]);
    } else {
        // Check in all loaded locators if not found in specific page
        const allLocators = loadLocators();
        for (const pageKey in allLocators) {
            if (allLocators[pageKey][elementName]) {
                selectors.push(allLocators[pageKey][elementName]);
                break;
            }
        }
    }
    
    // Add default selector strategies
    selectors = selectors.concat([
        `[data-testid="${elementName}"]`,
        `[data-test="${elementName}"]`,
        `[name="${elementName}"]`,
        `[id="${elementName}"]`,
        `#${elementName}`,
        `.${elementName}`,
        `input[placeholder*="${elementName}"]`,
        `textarea[placeholder*="${elementName}"]`,
        `[aria-label="${elementName}"]`,
        `label:has-text("${elementName}") + input`,
        `label:has-text("${elementName}") + textarea`,
        `//label[contains(text(), "${elementName}")]/following-sibling::input`,
        `//label[contains(text(), "${elementName}")]/following-sibling::textarea`
    ]);
    
    let elementFound = false;
    for (const selector of selectors) {
        try {
            const element = this.page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
                await element.fill(actualValue);
                console.log(`✅ Entered "${actualValue}" for "${elementName}" on "${pageName}" page (from: ${dataSource})`);
                elementFound = true;
                break;
            }
        } catch (error) {
            // Continue to next selector
        }
    }
    
    if (!elementFound) {
        throw new Error(`❌ Could not find element "${elementName}" on "${pageName}" page`);
    }
});

When('I click on {string} on {string} page', async function (elementName, pageName) {
    // Generic click step for page objects
    const locators = loadLocators(pageName);
    let selectors = [];
    
    // Check if element is defined in the specific page's locators
    if (locators[pageName] && locators[pageName][elementName]) {
        selectors.push(locators[pageName][elementName]);
    } else {
        // Check in all loaded locators if not found in specific page
        const allLocators = loadLocators();
        for (const pageKey in allLocators) {
            if (allLocators[pageKey][elementName]) {
                selectors.push(allLocators[pageKey][elementName]);
                break;
            }
        }
    }
    
    // Add default selector strategies
    selectors = selectors.concat([
        `[data-testid="${elementName}"]`,
        `[data-test="${elementName}"]`,
        `button:has-text("${elementName}")`,
        `[aria-label="${elementName}"]`,
        `[name="${elementName}"]`,
        `[id="${elementName}"]`,
        `#${elementName}`,
        `.${elementName}`,
        `input[type="submit"][value="${elementName}"]`,
        `input[type="button"][value="${elementName}"]`,
        `a:has-text("${elementName}")`,
        `//button[contains(text(), "${elementName}")]`,
        `//a[contains(text(), "${elementName}")]`,
        `//input[@type="submit" and @value="${elementName}"]`,
        `//span[contains(text(), "${elementName}")]/parent::button`,
        `//div[contains(text(), "${elementName}") and contains(@class, "button")]`
    ]);
    
    let elementFound = false;
    for (const selector of selectors) {
        try {
            const element = this.page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
                await element.click();
                console.log(`✅ Clicked "${elementName}" on "${pageName}" page`);
                elementFound = true;
                break;
            }
        } catch (error) {
            // Continue to next selector
        }
    }
    
    if (!elementFound) {
        throw new Error(`❌ Could not find clickable element "${elementName}" on "${pageName}" page`);
    }
});

When('I select {string} from {string} dropdown on {string} page', async function (optionValue, elementName, pageName) {
    // Generic dropdown selection step
    const locators = loadLocators(pageName);
    let selectors = [];
    
    // Check if element is defined in the specific page's locators
    if (locators[pageName] && locators[pageName][elementName]) {
        selectors.push(locators[pageName][elementName]);
    } else {
        // Check in all loaded locators if not found in specific page
        const allLocators = loadLocators();
        for (const pageKey in allLocators) {
            if (allLocators[pageKey][elementName]) {
                selectors.push(allLocators[pageKey][elementName]);
                break;
            }
        }
    }
    
    // Add default selector strategies
    selectors = selectors.concat([
        `[data-testid="${elementName}"]`,
        `[data-test="${elementName}"]`,
        `[name="${elementName}"]`,
        `[id="${elementName}"]`,
        `#${elementName}`,
        `select[aria-label="${elementName}"]`,
        `//label[contains(text(), "${elementName}")]/following-sibling::select`
    ]);
    
    let elementFound = false;
    for (const selector of selectors) {
        try {
            const element = this.page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
                await element.selectOption({ label: optionValue });
                console.log(`✅ Selected "${optionValue}" from "${elementName}" dropdown on "${pageName}" page`);
                elementFound = true;
                break;
            }
        } catch (error) {
            // Try selecting by value if label fails
            try {
                await element.selectOption({ value: optionValue });
                console.log(`✅ Selected "${optionValue}" (by value) from "${elementName}" dropdown on "${pageName}" page`);
                elementFound = true;
                break;
            } catch (valueError) {
                // Continue to next selector
            }
        }
    }
    
    if (!elementFound) {
        throw new Error(`❌ Could not find dropdown "${elementName}" on "${pageName}" page`);
    }
});

// Validation steps
Then('element {string} should be visible', async function (selector) {
    const isVisible = await this.page.isVisible(selector);
    expect(isVisible).to.be.true;
    console.log(`Verified element is visible: ${selector}`);
});

Then('page title should contain {string}', async function (expectedText) {
    const actualTitle = await this.page.title();
    expect(actualTitle).to.include(expectedText);
    console.log(`Verified page title contains: "${expectedText}"`);
});

When('I click on {string} button on page {string}', async function (buttonText, pageName) {
    // Generic button click step
    const selectors = [
        `button:has-text("${buttonText}")`,
        `input[type="submit"][value="${buttonText}"]`,
        `[data-testid="${buttonText}"]`,
        `[aria-label="${buttonText}"]`,
        `//button[contains(text(), "${buttonText}")]`,
        `//input[@type="submit" and @value="${buttonText}"]`
    ];
    
    let elementFound = false;
    for (const selector of selectors) {
        try {
            if (await this.page.isVisible(selector)) {
                await this.page.click(selector);
                console.log(`Clicked "${buttonText}" button on page "${pageName}"`);
                elementFound = true;
                break;
            }
        } catch (error) {
            // Continue to next selector
        }
    }
    
    if (!elementFound) {
        throw new Error(`Could not find "${buttonText}" button on page "${pageName}"`);
    }
});

Then('I should see {string} text on {string} page', async function (expectedText, pageName) {
    // Check if expectedText is a JSON path or data source
    let actualExpectedText = expectedText;
    if (expectedText.includes('.')) {
        const config = loadTestData();
        const keys = expectedText.split('.');
        let value = config;
        for (const key of keys) {
            value = value[key];
            if (value === undefined) break;
        }
        if (value !== undefined) {
            actualExpectedText = value;
        }
    } else {
        // Check if it's a direct JSON property
        const config = loadTestData();
        if (config[expectedText] !== undefined) {
            actualExpectedText = config[expectedText];
        }
    }
    
    const isVisible = await this.page.getByText(actualExpectedText).isVisible();
    expect(isVisible).to.be.true;
    console.log(`✅ Verified text "${actualExpectedText}" is visible on "${pageName}" page`);
});

Then('I should see {string} element on {string} page', async function (elementName, pageName) {
    // Generic element visibility check
    const locators = loadLocators(pageName);
    let selectors = [];
    
    // Check if element is defined in the specific page's locators
    if (locators[pageName] && locators[pageName][elementName]) {
        selectors.push(locators[pageName][elementName]);
    } else {
        // Check in all loaded locators if not found in specific page
        const allLocators = loadLocators();
        for (const pageKey in allLocators) {
            if (allLocators[pageKey][elementName]) {
                selectors.push(allLocators[pageKey][elementName]);
                break;
            }
        }
    }
    
    // Add default selector strategies
    selectors = selectors.concat([
        `[data-testid="${elementName}"]`,
        `[data-test="${elementName}"]`,
        `[name="${elementName}"]`,
        `[id="${elementName}"]`,
        `#${elementName}`,
        `.${elementName}`,
        `[aria-label="${elementName}"]`
    ]);
    
    // Add Google-specific fallbacks for search results
    if (elementName === 'searchResults') {
        selectors = selectors.concat([
            '#search',
            '#center_col',
            '[data-async-context]',
            '.g',
            '.MjjYud'
        ]);
    }
    
    let elementFound = false;
    for (const selector of selectors) {
        try {
            const element = this.page.locator(selector).first();
            if (await element.isVisible({ timeout: 5000 })) {
                console.log(`✅ Verified "${elementName}" element is visible on "${pageName}" page`);
                elementFound = true;
                break;
            }
        } catch (error) {
            // Continue to next selector
        }
    }
    
    expect(elementFound).to.be.true;
    if (!elementFound) {
        throw new Error(`❌ Element "${elementName}" is not visible on "${pageName}" page`);
    }
});

Then('I should not see {string} element on {string} page', async function (elementName, pageName) {
    // Generic element invisibility check
    const selectors = [
        `[data-testid="${elementName}"]`,
        `[data-test="${elementName}"]`,
        `[name="${elementName}"]`,
        `[id="${elementName}"]`,
        `#${elementName}`,
        `.${elementName}`,
        `[aria-label="${elementName}"]`
    ];
    
    let elementVisible = false;
    for (const selector of selectors) {
        try {
            const element = this.page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
                elementVisible = true;
                break;
            }
        } catch (error) {
            // Element not found or not visible - this is expected
        }
    }
    
    expect(elementVisible).to.be.false;
    console.log(`✅ Verified "${elementName}" element is not visible on "${pageName}" page`);
});

When('I wait for {string} element to appear on {string} page', async function (elementName, pageName) {
    // Wait for element to become visible
    const selectors = [
        `[data-testid="${elementName}"]`,
        `[data-test="${elementName}"]`,
        `[name="${elementName}"]`,
        `[id="${elementName}"]`,
        `#${elementName}`,
        `.${elementName}`,
        `[aria-label="${elementName}"]`
    ];
    
    let elementFound = false;
    for (const selector of selectors) {
        try {
            const element = this.page.locator(selector).first();
            await element.waitFor({ state: 'visible', timeout: 30000 });
            console.log(`✅ Element "${elementName}" appeared on "${pageName}" page`);
            elementFound = true;
            break;
        } catch (error) {
            // Continue to next selector
        }
    }
    
    if (!elementFound) {
        throw new Error(`❌ Element "${elementName}" did not appear on "${pageName}" page within 30 seconds`);
    }
});

When('I navigate to {string} page', async function (pageName) {
    // Generic page navigation using baseUrl + page mapping
    const config = loadTestData();
    const baseUrl = config.baseUrl;
    
    // Page URL mapping - you can extend this based on your application
    const pageUrls = {
        'home': '/',
        'login': '/login',
        'register': '/register',
        'dashboard': '/dashboard',
        'profile': '/profile',
        'settings': '/settings',
        'CreateAccountPage': '/register',
        'LoginPage': '/login',
        'HomePage': '/',
        'DashboardPage': '/dashboard',
        'GoogleHomePage': '/',
        'GoogleSearchPage': '/search'
    };
    
    const pageUrl = pageUrls[pageName] || `/${pageName.toLowerCase()}`;
    const fullUrl = `${baseUrl}${pageUrl}`;
    
    await this.page.goto(fullUrl);
    console.log(`✅ Navigated to "${pageName}" page: ${fullUrl}`);
});

When('I wait for {int} seconds', async function (seconds) {
    await this.page.waitForTimeout(seconds * 1000);
    console.log(`Waited for ${seconds} seconds`);
});

// Google-specific generic steps
When('I search for {string} on {string} page', async function (searchTerm, pageName) {
    // Get search term from data source or use literal
    let actualSearchTerm = searchTerm;
    const config = loadTestData();
    
    if (config.searchData && config.searchData[searchTerm]) {
        actualSearchTerm = config.searchData[searchTerm];
    } else if (searchTerm.includes('.')) {
        const keys = searchTerm.split('.');
        let value = config;
        for (const key of keys) {
            value = value[key];
            if (value === undefined) break;
        }
        if (value !== undefined) {
            actualSearchTerm = value;
        }
    }
    
    // Find and fill search box
    const searchSelectors = [
        'textarea[name="q"]',
        'input[name="q"]',
        '[data-testid="searchBox"]',
        '#searchBox',
        '.searchBox'
    ];
    
    let searchBoxFound = false;
    for (const selector of searchSelectors) {
        try {
            const element = this.page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
                await element.fill(actualSearchTerm);
                await element.press('Enter');
                console.log(`✅ Searched for "${actualSearchTerm}" on "${pageName}" page`);
                searchBoxFound = true;
                break;
            }
        } catch (error) {
            // Continue to next selector
        }
    }
    
    if (!searchBoxFound) {
        throw new Error(`❌ Could not find search box on "${pageName}" page`);
    }
});

When('I start typing {string} in search box on {string} page', async function (searchTerm, pageName) {
    // Get search term from data source or use literal
    let actualSearchTerm = searchTerm;
    const config = loadTestData();
    
    if (config.searchData && config.searchData[searchTerm]) {
        actualSearchTerm = config.searchData[searchTerm];
    }
    
    // Find search box and type (without pressing Enter)
    const searchSelectors = [
        'textarea[name="q"]',
        'input[name="q"]',
        '[data-testid="searchBox"]',
        '#searchBox',
        '.searchBox'
    ];
    
    let searchBoxFound = false;
    for (const selector of searchSelectors) {
        try {
            const element = this.page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
                await element.fill(actualSearchTerm);
                console.log(`✅ Started typing "${actualSearchTerm}" in search box on "${pageName}" page`);
                searchBoxFound = true;
                break;
            }
        } catch (error) {
            // Continue to next selector
        }
    }
    
    if (!searchBoxFound) {
        throw new Error(`❌ Could not find search box on "${pageName}" page`);
    }
});

When('I press Enter key on {string} page', async function (pageName) {
    await this.page.keyboard.press('Enter');
    console.log(`✅ Pressed Enter key on "${pageName}" page`);
});

When('I set viewport to mobile size on {string} page', async function (pageName) {
    await this.page.setViewportSize({ width: 375, height: 667 });
    console.log(`✅ Set viewport to mobile size on "${pageName}" page`);
});

// Export for use in other step files
module.exports = {
    loadTestData,
    loadLocators
};
