const BasePage = require('./basePage');

class CreateAccountPage extends BasePage {
    // Static locators - single source of truth
    static locators = {
        emailInput: 'input[name="email"]',
        firstNameInput: 'input[name="firstName"]',
        lastNameInput: 'input[name="lastName"]',
        passwordInput: 'input[name="password"]',
        confirmPasswordInput: 'input[name="confirmPassword"]',
        countryDropdown: 'select[name="country"]',
        submitButton: 'button[type="submit"]',
        errorMessage: '.error-message',
        successMessage: '.success-message',
        dataEntryComplete: '[data-testid="data-complete"]',
        termsCheckbox: 'input[name="terms"]',
        newsletterCheckbox: 'input[name="newsletter"]'
    };

    constructor(page) {
        super(page);
        // Use static locators
        this.locators = CreateAccountPage.locators;
    }

    // Page-specific methods
    async createAccount(userData) {
        await this.type(this.locators.emailInput, userData.email);
        await this.type(this.locators.firstNameInput, userData.firstName);
        await this.type(this.locators.lastNameInput, userData.lastName);
        await this.type(this.locators.passwordInput, userData.password);
        
        if (userData.confirmPassword) {
            await this.type(this.locators.confirmPasswordInput, userData.confirmPassword);
        }
        
        if (userData.country) {
            await this.selectOption(this.locators.countryDropdown, userData.country);
        }
        
        await this.click(this.locators.submitButton);
    }

    async selectCountry(country) {
        await this.selectOption(this.locators.countryDropdown, country);
    }

    async acceptTerms() {
        await this.check(this.locators.termsCheckbox);
    }

    async subscribeToNewsletter() {
        await this.check(this.locators.newsletterCheckbox);
    }

    async getSuccessMessage() {
        return await this.getText(this.locators.successMessage);
    }

    async getErrorMessage() {
        return await this.getText(this.locators.errorMessage);
    }

    // Static method to get locators for generic steps - uses static locators
    static getLocators() {
        return {
            CreateAccountPage: CreateAccountPage.locators
        };
    }
}

module.exports = CreateAccountPage;
