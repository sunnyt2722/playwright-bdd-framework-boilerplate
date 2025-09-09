const BasePage = require('./basePage');

class LoginPage extends BasePage {
    // Static locators - single source of truth
    static locators = {
        loginForm: 'form[data-testid="login-form"]',
        emailInput: 'input[name="email"]',
        passwordInput: 'input[name="password"]',
        submitButton: 'button[type="submit"]',
        errorMessage: '.error-message',
        successMessage: '.success-message',
        forgotPasswordLink: 'a[href*="forgot-password"]',
        signUpLink: 'a[href*="signup"]'
    };

    constructor(page) {
        super(page);
        // Use static locators
        this.locators = LoginPage.locators;
    }

    // Page-specific methods
    async login(email, password) {
        await this.type(this.locators.emailInput, email);
        await this.type(this.locators.passwordInput, password);
        await this.click(this.locators.submitButton);
    }

    async isLoginFormVisible() {
        return await this.isVisible(this.locators.loginForm);
    }

    async getErrorMessage() {
        return await this.getText(this.locators.errorMessage);
    }

    async clickForgotPassword() {
        await this.click(this.locators.forgotPasswordLink);
    }

    async clickSignUp() {
        await this.click(this.locators.signUpLink);
    }

    // Static method to get locators for generic steps - uses static locators
    static getLocators() {
        return {
            LoginPage: LoginPage.locators
        };
    }
}

module.exports = LoginPage;
