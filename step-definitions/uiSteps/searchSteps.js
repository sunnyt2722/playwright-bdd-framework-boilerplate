const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const GoogleSearchPage = require('../../page-objects/googleSearchPage');

let googleSearchPage;

Given('I navigate to the application', async function () {
    googleSearchPage = new GoogleSearchPage(this.page);
    await googleSearchPage.navigateToGoogle();
    console.log('Navigated to Google homepage');
});

When('I search for {string}', async function (searchTerm) {
    await googleSearchPage.search(searchTerm);
    console.log(`Searched for: ${searchTerm}`);
});

When('I start typing {string} in the search box', async function (searchTerm) {
    await googleSearchPage.startTyping(searchTerm);
    console.log(`Started typing: ${searchTerm}`);
});

When('I click on the {string} tab', async function (tabName) {
    if (tabName.toLowerCase() === 'images') {
        await googleSearchPage.clickImagesTab();
    } else if (tabName.toLowerCase() === 'news') {
        await googleSearchPage.clickNewsTab();
    }
    console.log(`Clicked on ${tabName} tab`);
});

When('I navigate to search box using keyboard', async function () {
    await googleSearchPage.navigateToSearchBoxWithKeyboard();
    console.log('Navigated to search box using keyboard');
});

When('I type {string} using keyboard', async function (text) {
    await googleSearchPage.typeWithKeyboard(text);
    console.log(`Typed using keyboard: ${text}`);
});

When('I press Enter key', async function () {
    await googleSearchPage.pressKey('Enter');
    await googleSearchPage.waitForPageLoad();
    console.log('Pressed Enter key');
});

Given('I set the viewport to mobile size', async function () {
    await googleSearchPage.setMobileViewport();
    console.log('Set viewport to mobile size');
});

Then('I should see search results', async function () {
    const resultsVisible = await googleSearchPage.waitForSearchResults();
    expect(resultsVisible).to.be.true;
    console.log('Search results are visible');
});

Then('I should see search suggestions', async function () {
    const suggestionsVisible = await googleSearchPage.areSearchSuggestionsVisible();
    expect(suggestionsVisible).to.be.true;
    console.log('Search suggestions are visible');
});

Then('I should see image search results', async function () {
    const imageResultsVisible = await googleSearchPage.areImageResultsVisible();
    expect(imageResultsVisible).to.be.true;
    console.log('Image search results are visible');
});

Then('I should see news search results', async function () {
    const newsResultsVisible = await googleSearchPage.areNewsResultsVisible();
    expect(newsResultsVisible).to.be.true;
    console.log('News search results are visible');
});

Then('I should see search results or no results message', async function () {
    const resultsVisible = await googleSearchPage.areSearchResultsVisible();
    const noResultsVisible = await googleSearchPage.isNoResultsMessageVisible();
    
    expect(resultsVisible || noResultsVisible).to.be.true;
    
    if (resultsVisible) {
        console.log('Search results are visible');
    } else {
        console.log('No results message is visible');
    }
});

Then('the page title should contain {string}', async function (expectedText) {
    const title = await googleSearchPage.getTitle();
    expect(title.toLowerCase()).to.include(expectedText.toLowerCase());
    console.log(`Page title contains: ${expectedText}`);
});

Then('the page should be mobile responsive', async function () {
    const isMobileResponsive = await googleSearchPage.isPageMobileResponsive();
    expect(isMobileResponsive).to.be.true;
    console.log('Page is mobile responsive');
});

// Additional helper steps
When('I clear the search box', async function () {
    await googleSearchPage.clearSearchBox();
    console.log('Cleared search box');
});

Then('the search box should be empty', async function () {
    const searchBoxValue = await googleSearchPage.getSearchBoxValue();
    expect(searchBoxValue).to.equal('');
    console.log('Search box is empty');
});

Then('the Google logo should be visible', async function () {
    const logoVisible = await googleSearchPage.isGoogleLogoVisible();
    expect(logoVisible).to.be.true;
    console.log('Google logo is visible');
});
