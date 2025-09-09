@ui @search
Feature: Google Search Functionality
  As a user
  I want to search on Google
  So that I can find relevant information

  Background:
    Given I navigate to "GoogleHomePage" page

  @C101 @smoke
  Scenario: Perform basic search
    When I search for "basicSearch" on "GoogleHomePage" page
    Then I should see "searchResults" element on "GoogleSearchPage" page
    And page title should contain "Playwright automation"

  @C102 @smoke
  Scenario: Search suggestions appear
    When I start typing "automationTesting" in search box on "GoogleHomePage" page
    Then I should see "suggestions" element on "GoogleHomePage" page

  @C103 @navigation
  Scenario: Navigate to Images tab
    When I search for "simpleSearch" on "GoogleHomePage" page
    And I click on "imagesTab" on "GoogleSearchPage" page
    Then I should see "imageResults" element on "GoogleSearchPage" page

  @C104 @navigation
  Scenario: Navigate to News tab
    When I search for "newsSearch" on "GoogleHomePage" page
    And I click on "newsTab" on "GoogleSearchPage" page
    Then I should see "newsResults" element on "GoogleSearchPage" page

  @C105 @validation
  Scenario: Search with special characters
    When I search for "specialCharSearch" on "GoogleHomePage" page
    Then I should see "searchResults" element on "GoogleSearchPage" page

  @C106 @accessibility
  Scenario: Search using keyboard navigation
    When I enter value for "searchBox" on "GoogleHomePage" page from "accessibilitySearch"
    And I press Enter key on "GoogleHomePage" page
    Then I should see "searchResults" element on "GoogleSearchPage" page

  @C107 @responsive
  Scenario: Search on mobile viewport
    Given I set viewport to mobile size on "GoogleHomePage" page
    When I search for "mobileSearch" on "GoogleHomePage" page
    Then I should see "searchResults" element on "GoogleSearchPage" page
