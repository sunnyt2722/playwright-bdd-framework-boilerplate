class BasePage {
    constructor(page) {
        this.page = page;
    }

    // Navigation methods
    async navigate(url) {
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }

    async reload() {
        await this.page.reload({ waitUntil: 'networkidle' });
    }

    async goBack() {
        await this.page.goBack({ waitUntil: 'networkidle' });
    }

    async goForward() {
        await this.page.goForward({ waitUntil: 'networkidle' });
    }

    // Element interaction methods
    async click(selector, options = {}) {
        await this.page.click(selector, options);
    }

    async doubleClick(selector) {
        await this.page.dblclick(selector);
    }

    async rightClick(selector) {
        await this.page.click(selector, { button: 'right' });
    }

    async type(selector, text, options = {}) {
        await this.page.fill(selector, text, options);
    }

    async typeSlowly(selector, text, delay = 100) {
        await this.page.type(selector, text, { delay });
    }

    async clear(selector) {
        await this.page.fill(selector, '');
    }

    async selectOption(selector, value) {
        await this.page.selectOption(selector, value);
    }

    async check(selector) {
        await this.page.check(selector);
    }

    async uncheck(selector) {
        await this.page.uncheck(selector);
    }

    // Keyboard and mouse actions
    async pressKey(key) {
        await this.page.keyboard.press(key);
    }

    async pressKeys(keys) {
        for (const key of keys) {
            await this.page.keyboard.press(key);
        }
    }

    async hover(selector) {
        await this.page.hover(selector);
    }

    async dragAndDrop(sourceSelector, targetSelector) {
        await this.page.dragAndDrop(sourceSelector, targetSelector);
    }

    // Wait methods
    async waitForElement(selector, timeout = 30000) {
        await this.page.waitForSelector(selector, { timeout });
    }

    async waitForElementToBeVisible(selector, timeout = 30000) {
        await this.page.waitForSelector(selector, { state: 'visible', timeout });
    }

    async waitForElementToBeHidden(selector, timeout = 30000) {
        await this.page.waitForSelector(selector, { state: 'hidden', timeout });
    }

    async waitForPageLoad(timeout = 30000) {
        await this.page.waitForLoadState('networkidle', { timeout });
    }

    async waitForTimeout(milliseconds) {
        await this.page.waitForTimeout(milliseconds);
    }

    // Element state methods
    async isVisible(selector) {
        try {
            return await this.page.isVisible(selector);
        } catch {
            return false;
        }
    }

    async isEnabled(selector) {
        try {
            return await this.page.isEnabled(selector);
        } catch {
            return false;
        }
    }

    async isChecked(selector) {
        try {
            return await this.page.isChecked(selector);
        } catch {
            return false;
        }
    }

    async isDisabled(selector) {
        try {
            return await this.page.isDisabled(selector);
        } catch {
            return false;
        }
    }

    // Text and attribute methods
    async getText(selector) {
        return await this.page.textContent(selector);
    }

    async getInnerText(selector) {
        return await this.page.innerText(selector);
    }

    async getInputValue(selector) {
        return await this.page.inputValue(selector);
    }

    async getAttribute(selector, attributeName) {
        return await this.page.getAttribute(selector, attributeName);
    }

    async getTitle() {
        return await this.page.title();
    }

    async getUrl() {
        return this.page.url();
    }

    // Element count and collection methods
    async getElementCount(selector) {
        return await this.page.locator(selector).count();
    }

    async getAllTexts(selector) {
        return await this.page.locator(selector).allTextContents();
    }

    // Viewport and screenshot methods
    async setViewport(width, height) {
        await this.page.setViewportSize({ width, height });
    }

    async getViewport() {
        return this.page.viewportSize();
    }

    async takeScreenshot(path, options = {}) {
        return await this.page.screenshot({ path, ...options });
    }

    async takeElementScreenshot(selector, path, options = {}) {
        return await this.page.locator(selector).screenshot({ path, ...options });
    }

    // Scroll methods
    async scrollToElement(selector) {
        await this.page.locator(selector).scrollIntoViewIfNeeded();
    }

    async scrollToTop() {
        await this.page.evaluate(() => window.scrollTo(0, 0));
    }

    async scrollToBottom() {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }

    // Frame methods
    async switchToFrame(frameSelector) {
        return this.page.frame(frameSelector);
    }

    async switchToMainFrame() {
        return this.page.mainFrame();
    }

    // Alert and dialog methods
    async acceptAlert() {
        this.page.on('dialog', dialog => dialog.accept());
    }

    async dismissAlert() {
        this.page.on('dialog', dialog => dialog.dismiss());
    }

    // Cookie methods
    async getCookies() {
        return await this.page.context().cookies();
    }

    async setCookie(cookie) {
        await this.page.context().addCookies([cookie]);
    }

    async clearCookies() {
        await this.page.context().clearCookies();
    }

    // Local storage methods
    async setLocalStorage(key, value) {
        await this.page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
    }

    async getLocalStorage(key) {
        return await this.page.evaluate(k => localStorage.getItem(k), key);
    }

    async clearLocalStorage() {
        await this.page.evaluate(() => localStorage.clear());
    }

    // Session storage methods
    async setSessionStorage(key, value) {
        await this.page.evaluate(([k, v]) => sessionStorage.setItem(k, v), [key, value]);
    }

    async getSessionStorage(key) {
        return await this.page.evaluate(k => sessionStorage.getItem(k), key);
    }

    async clearSessionStorage() {
        await this.page.evaluate(() => sessionStorage.clear());
    }

    // Utility methods
    async executeScript(script, ...args) {
        return await this.page.evaluate(script, ...args);
    }

    async refresh() {
        await this.page.reload({ waitUntil: 'networkidle' });
    }

    async close() {
        await this.page.close();
    }
}

module.exports = BasePage;