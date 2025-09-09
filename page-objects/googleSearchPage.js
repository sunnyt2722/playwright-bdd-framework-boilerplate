const BasePage = require('./basePage');

class GoogleSearchPage extends BasePage {
    // Static locators - single source of truth
    static locators = {
        searchBox: 'textarea[name="q"], input[name="q"]',
        searchButton: 'input[value="Google Search"], button[aria-label="Google Search"]',
        searchResults: '#rso',
        searchSuggestions: '.wM6W7d',
        imagesTab: 'a[href*="tbm=isch"]',
        newsTab: 'a[href*="tbm=nws"]',
        videosTab: 'a[href*="tbm=vid"]',
        shoppingTab: 'a[href*="tbm=shop"]',
        imageResults: '#islrg',
        newsResults: '#rso',
        resultStats: '#result-stats',
        noResultsMessage: '.med',
        logo: 'img[alt="Google"]',
        nextPageButton: '#pnnext',
        previousPageButton: '#pnprev'
    };

    constructor(page) {
        super(page);
        // Use static locators
        this.locators = GoogleSearchPage.locators;
    }

    // Page-specific methods
    async search(query) {
        await this.type(this.locators.searchBox, query);
        await this.pressKey('Enter');
        await this.waitForPageLoad();
    }

    async clickImagesTab() {
        await this.click(this.locators.imagesTab);
        await this.waitForPageLoad();
    }

    async clickNewsTab() {
        await this.click(this.locators.newsTab);
        await this.waitForPageLoad();
    }

    async clickVideosTab() {
        await this.click(this.locators.videosTab);
        await this.waitForPageLoad();
    }

    async areSearchResultsVisible() {
        return await this.isVisible(this.locators.searchResults);
    }

    async areImageResultsVisible() {
        return await this.isVisible(this.locators.imageResults);
    }

    async areNewsResultsVisible() {
        return await this.isVisible(this.locators.newsResults);
    }

    async getResultStats() {
        return await this.getText(this.locators.resultStats);
    }

    async goToNextPage() {
        await this.click(this.locators.nextPageButton);
        await this.waitForPageLoad();
    }

    async goToPreviousPage() {
        await this.click(this.locators.previousPageButton);
        await this.waitForPageLoad();
    }

    // Static method to get locators for generic steps - uses static locators
    static getLocators() {
        return {
            GoogleSearchPage: GoogleSearchPage.locators
        };
    }
}

module.exports = GoogleSearchPage;