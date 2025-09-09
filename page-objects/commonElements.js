const BasePage = require('./basePage');

class CommonElements extends BasePage {
    // Static locators - single source of truth
    static locators = {
        loadingSpinner: '.loading-spinner',
        modal: '.modal',
        closeButton: '[data-testid="close-button"]',
        confirmButton: '[data-testid="confirm-button"]',
        cancelButton: '[data-testid="cancel-button"]',
        dashboard: '[data-testid="dashboard"]',
        notification: '.notification',
        alertMessage: '.alert',
        breadcrumb: '.breadcrumb',
        backButton: '[data-testid="back-button"]',
        saveButton: '[data-testid="save-button"]',
        editButton: '[data-testid="edit-button"]',
        deleteButton: '[data-testid="delete-button"]'
    };

    constructor(page) {
        super(page);
        // Use static locators
        this.locators = CommonElements.locators;
    }

    // Common methods
    async waitForLoadingToComplete() {
        await this.waitForElementToDisappear(this.locators.loadingSpinner);
    }

    async closeModal() {
        await this.click(this.locators.closeButton);
    }

    async confirmAction() {
        await this.click(this.locators.confirmButton);
    }

    async cancelAction() {
        await this.click(this.locators.cancelButton);
    }

    async isModalVisible() {
        return await this.isVisible(this.locators.modal);
    }

    async getNotificationText() {
        return await this.getText(this.locators.notification);
    }

    async getAlertText() {
        return await this.getText(this.locators.alertMessage);
    }

    async goBack() {
        await this.click(this.locators.backButton);
    }

    async save() {
        await this.click(this.locators.saveButton);
    }

    async edit() {
        await this.click(this.locators.editButton);
    }

    async delete() {
        await this.click(this.locators.deleteButton);
    }

    // Static method to get locators for generic steps - uses static locators
    static getLocators() {
        return {
            CommonElements: CommonElements.locators
        };
    }
}

module.exports = CommonElements;
