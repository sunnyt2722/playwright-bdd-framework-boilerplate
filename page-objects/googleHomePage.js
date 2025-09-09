const BasePage = require('./basePage');

class GoogleHomePage extends BasePage {
    // Static locators - single source of truth
    static locators = {
        searchBox: 'textarea[name="q"]',
        searchButton: 'input[name="btnK"]',
        luckyButton: 'input[name="btnI"]',
        suggestions: '[role="listbox"]',
        logo: 'img[alt="Google"]',
        languageLinks: '#SIvCob a',
        footerLinks: '#fbar a'
    };

    constructor(page) {
        super(page);
        // Use static locators
        this.locators = GoogleHomePage.locators;
    }

    // Page-specific methods
    async navigateToGoogle() {
        await this.navigate('https://www.google.com');
        await this.waitForPageLoad();
    }

    async search(query) {
        await this.type(this.locators.searchBox, query);
        await this.pressKey('Enter');
        await this.waitForPageLoad();
    }

    async startTyping(query) {
        await this.type(this.locators.searchBox, query);
        // Wait for suggestions to appear
        await this.waitForElement(this.locators.suggestions, 5000);
    }

    async clickSearchButton() {
        await this.click(this.locators.searchButton);
        await this.waitForPageLoad();
    }

    async clickLuckyButton() {
        await this.click(this.locators.luckyButton);
        await this.waitForPageLoad();
    }

    async areSuggestionsVisible() {
        return await this.isVisible(this.locators.suggestions);
    }

    async isLogoVisible() {
        return await this.isVisible(this.locators.logo);
    }

    // Static method to get locators for generic steps - uses static locators
    static getLocators() {
        return {
            GoogleHomePage: GoogleHomePage.locators
        };
    }
}

module.exports = GoogleHomePage;
