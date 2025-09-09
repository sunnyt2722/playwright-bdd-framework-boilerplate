const { devices } = require('@playwright/test');
module.exports = {
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium', headless: false },
        },
        {
            name: 'firefox',
            use: { browserName: 'firefox', headless: false },
        },
        {
            name: 'webkit',
            use: { browserName: 'webkit', headless: false },
        },
        {
            name: 'chrome',
            use: { channel: 'chrome', headless: false },
        },
        {
            name: 'edge',
            use: { channel: 'msedge', headless: false },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 13'], headless: false },
        },
        {
            name: 'Galaxy S22',
            use: { ...devices['Galaxy S22'], headless: false },
        },
    ],
};