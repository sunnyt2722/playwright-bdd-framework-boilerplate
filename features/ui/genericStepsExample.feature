@ui @generic-steps
Feature: Generic Steps Example
  As a test automation engineer
  I want to use generic, reusable steps
  So that I can write maintainable and readable tests

  Background:
    Given I navigate to "CreateAccountPage" page

  @example @smoke
  Scenario: Create account using generic steps
    When I enter value for "emailInput" on "CreateAccountPage" page from "randomEmail"
    And I enter value for "firstNameInput" on "CreateAccountPage" page from "testUser.firstName"
    And I enter value for "lastNameInput" on "CreateAccountPage" page from "testUser.lastName"
    And I enter value for "passwordInput" on "CreateAccountPage" page from "testUser.password"
    And I select "United States" from "countryDropdown" dropdown on "CreateAccountPage" page
    And I click on "submitButton" on "CreateAccountPage" page
    Then I should see "successMessage" element on "CreateAccountPage" page
    And I should see "Account created successfully" text on "CreateAccountPage" page

  @example @validation
  Scenario: Form validation using generic steps
    When I enter value for "emailInput" on "CreateAccountPage" page from "invalidEmail"
    And I click on "submitButton" on "CreateAccountPage" page
    Then I should see "errorMessage" element on "CreateAccountPage" page
    And I should not see "successMessage" element on "CreateAccountPage" page

  @example @data-driven
  Scenario: Using different data sources
    When I enter value for "timestampField" on "CreateAccountPage" page from "currentTimestamp"
    And I enter value for "randomField" on "CreateAccountPage" page from "randomString"
    And I enter value for "emailField" on "CreateAccountPage" page from "randomEmail"
    And I enter value for "staticField" on "CreateAccountPage" page from "testUser.email"
    Then I should see "dataEntryComplete" element on "CreateAccountPage" page

  @example @navigation
  Scenario: Page navigation and element waiting
    When I navigate to "LoginPage" page
    And I wait for "loginForm" element to appear on "LoginPage" page
    And I enter value for "usernameInput" on "LoginPage" page from "testUser.email"
    And I enter value for "passwordInput" on "LoginPage" page from "testUser.password"
    And I click on "loginButton" on "LoginPage" page
    Then I should see "dashboard" element on "DashboardPage" page
