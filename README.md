# Playwright BDD Framework Boilerplate

A comprehensive test automation framework using Playwright with Cucumber BDD, featuring generic reusable steps, environment management, and integrated reporting.

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run specific environment
npm run test:dev:chrome
npm run test:test:firefox
npm run test:prod:webkit
```

## 📁 **Project Structure**

```
playwright-bdd-framework-boilerplate/
├── features/                           # BDD feature files
│   ├── api/                           # API test scenarios
│   ├── database/                      # Database test scenarios
│   └── ui/                           # UI test scenarios
├── step-definitions/                   # Cucumber step definitions
│   ├── apiSteps/                     # API-specific steps
│   ├── databaseSteps/                # Database-specific steps
│   ├── uiSteps/                      # UI-specific steps
│   └── hooks.js                      # Test hooks and setup
├── page-objects/                      # Page Object Model files
│   ├── basePage.js                   # Base page with common methods
│   ├── googleHomePage.js             # Google home page object
│   ├── googleSearchPage.js           # Google search page object
│   ├── loginPage.js                  # Login page object
│   ├── createAccountPage.js          # Account creation page object
│   └── commonElements.js             # Common UI elements
├── test-data/                         # Test data and configurations
│   ├── dev.json                      # Development environment data
│   ├── test.json                     # Test environment data
│   ├── prod.json                     # Production environment data
│   └── api/                          # API endpoint configurations
│       ├── GET_USERS/
│       ├── POST_USERS/
│       ├── PUT_USERS/
│       └── DELETE_USERS/
├── utils/                             # Utility functions
├── config/                            # Configuration files
├── scripts/                           # Helper scripts
└── reports/                           # Generated test reports
```

## 🎯 **Generic Steps Framework**

### **Core Generic Steps**

The framework provides reusable generic steps that work across different pages and scenarios:

#### **Input/Form Steps**
```gherkin
# Enter values with different data sources
When I enter value for "emailInput" on "CreateAccountPage" page from "randomEmail"
When I enter value for "firstNameInput" on "LoginPage" page from "testUser.firstName"
When I enter value for "passwordField" on "RegisterPage" page from "testUser.password"
```

#### **Click/Interaction Steps**
```gherkin
# Generic clicking
When I click on "submitButton" on "CreateAccountPage" page
When I click on "loginLink" on "HomePage" page
When I click on "saveButton" on "ProfilePage" page
```

#### **Dropdown Selection**
```gherkin
# Select from dropdowns
When I select "United States" from "countryDropdown" dropdown on "CreateAccountPage" page
When I select "Premium" from "planTypeDropdown" dropdown on "SubscriptionPage" page
```

#### **Navigation Steps**
```gherkin
# Page navigation
When I navigate to "CreateAccountPage" page
When I navigate to "LoginPage" page
When I navigate to "DashboardPage" page
```

#### **Validation Steps**
```gherkin
# Element visibility
Then I should see "successMessage" element on "CreateAccountPage" page
Then I should not see "errorMessage" element on "LoginPage" page

# Text verification
Then I should see "Welcome back!" text on "DashboardPage" page
Then I should see "testUser.firstName" text on "ProfilePage" page
```

#### **Wait Steps**
```gherkin
# Wait for elements
When I wait for "loadingSpinner" element to appear on "DashboardPage" page
When I wait for 3 seconds
```

### **Google Search Specific Steps**
```gherkin
# Search with data from JSON
When I search for "basicSearch" on "GoogleHomePage" page

# Type without pressing Enter
When I start typing "automationTesting" in search box on "GoogleHomePage" page

# Keyboard actions
When I press Enter key on "GoogleHomePage" page

# Viewport control
When I set viewport to mobile size on "GoogleHomePage" page
```

## 📊 **Data Sources**

### **Built-in Data Generators**
- `randomEmail` - Generates: `test1234567890@example.com`
- `randomString` - Generates: `test_1234567890_abc123`
- `currentTimestamp` - Generates: `1234567890123`

### **JSON Data References**
```json
// test-data/dev.json
{
  "testUser": {
    "email": "test.user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123"
  },
  "searchData": {
    "basicSearch": "Playwright automation",
    "automationTesting": "automation testing"
  }
}
```

**Usage in steps:**
- `testUser.email` → `test.user@example.com`
- `testUser.firstName` → `John`
- `basicSearch` → `Playwright automation`

## 🏗️ **Data Structure & Organization**

### **Environment Files (dev.json, test.json, prod.json)**
**✅ Contains:**
- Base URLs
- API URLs
- User credentials
- Test data values
- Database connections
- Timeouts

```json
{
  "baseUrl": "https://www.google.com",
  "apiBaseUrl": "https://reqres.in/api",
  "testUser": {
    "email": "test.user@example.com",
    "password": "TestPassword123",
    "firstName": "Test",
    "lastName": "User"
  },
  "database": {
    "host": "localhost",
    "port": 3306,
    "user": "testuser",
    "password": "testpass",
    "database": "testdb"
  }
}
```

### **API Endpoint Structure**
Each API endpoint has its own folder with specific configurations:

```
test-data/api/
├── GET_USERS/
│   ├── endpoint.json       # Endpoint definition
│   └── headers.json        # Request headers
├── POST_USERS/
│   ├── endpoint.json       # Endpoint definition
│   ├── headers.json        # Request headers
│   └── createUser.json     # Request body
```

**Example endpoint.json:**
```json
{
  "endpoint": "/users",
  "method": "GET",
  "description": "Get list of users",
  "parameters": {
    "page": "optional - page number",
    "per_page": "optional - items per page"
  }
}
```

### **Page Object Model Structure**
Industry-standard page object classes in `page-objects/` folder:

```
page-objects/
├── basePage.js              # Base page with common methods
├── googleHomePage.js        # Google home page class
├── googleSearchPage.js      # Google search page class
├── loginPage.js             # Login page class
├── createAccountPage.js     # Account creation page class
└── commonElements.js        # Common UI elements class
```

**Example page object class:**
```javascript
const BasePage = require('./basePage');

class GoogleHomePage extends BasePage {
    // Static locators - single source of truth
    static locators = {
        searchBox: 'textarea[name="q"]',
        searchButton: 'input[name="btnK"]',
        suggestions: '[role="listbox"]'
    };

    constructor(page) {
        super(page);
        // Use static locators
        this.locators = GoogleHomePage.locators;
    }

    // Page-specific methods
    async search(query) {
        await this.type(this.locators.searchBox, query);
        await this.pressKey('Enter');
    }

    // Static method for generic steps - uses static locators
    static getLocators() {
        return {
            GoogleHomePage: GoogleHomePage.locators
        };
    }
}

module.exports = GoogleHomePage;
```

## 🎨 **Element Selector Strategy**

The framework uses intelligent element resolution:

1. **Page-specific locators** (from `*.locators.json` files)
2. **Default selector strategies**:
   - `[data-testid="elementName"]` ⭐ **Recommended**
   - `[data-test="elementName"]`
   - `[name="elementName"]`
   - `[id="elementName"]`
   - `#elementName`
   - `.elementName`
   - `[aria-label="elementName"]`

## 🌍 **Environment Management**

### **Available Environments**
- **dev** - Development environment
- **test** - Testing environment  
- **prod** - Production environment

### **Running Tests by Environment**
```bash
# Development
npm run test:dev:chrome
npm run test:dev:firefox
npm run test:dev:webkit

# Test
npm run test:test:chrome
npm run test:test:firefox
npm run test:test:webkit

# Production
npm run test:prod:chrome
npm run test:prod:firefox
npm run test:prod:webkit
```

### **Environment Variables**
```bash
ENV=dev BROWSER=chrome npm test
TAG=@smoke npm test
```

## 📝 **Example Feature File**

```gherkin
@ui @registration
Feature: User Registration
  As a new user
  I want to create an account
  So that I can access the application

  Background:
    Given I navigate to "CreateAccountPage" page

  @smoke
  Scenario: Successful account creation
    When I enter value for "emailInput" on "CreateAccountPage" page from "randomEmail"
    And I enter value for "firstNameInput" on "CreateAccountPage" page from "testUser.firstName"
    And I enter value for "lastNameInput" on "CreateAccountPage" page from "testUser.lastName"
    And I enter value for "passwordInput" on "CreateAccountPage" page from "testUser.password"
    And I select "United States" from "countryDropdown" dropdown on "CreateAccountPage" page
    And I click on "submitButton" on "CreateAccountPage" page
    Then I should see "successMessage" element on "CreateAccountPage" page
    And I should see "Account created successfully" text on "CreateAccountPage" page

  @validation
  Scenario: Email validation
    When I enter value for "emailInput" on "CreateAccountPage" page from "invalidEmail"
    And I click on "submitButton" on "CreateAccountPage" page
    Then I should see "errorMessage" element on "CreateAccountPage" page
    And I should see "Please enter a valid email address" text on "CreateAccountPage" page
```

## 🧪 **Test Types**

### **UI Tests**
- Google Search functionality
- Form interactions
- Navigation testing
- Responsive design validation

### **API Tests**
- User management endpoints
- CRUD operations
- Response validation
- Error handling

### **Database Tests**
- Connection validation
- Schema verification
- Data integrity checks
- Query execution

## 📊 **Reporting & Integration**

### **HTML Reports**
Comprehensive HTML reports with:
- Test execution summary
- Screenshots for failed tests
- Step-by-step execution details
- Environment information

### **Screenshots**
- Automatic screenshot capture on test failures
- Saved to `test-results/screenshots/`
- Embedded in HTML reports

### **Integration Support**
- **Teams Notifications**: Send test results to Microsoft Teams
- **Jira Integration**: Post results to Jira tickets
- **TestRail Integration**: Upload test results to TestRail

```bash
# Send Teams notification
npm run teams:notify

# Upload to TestRail
npm run testrail:report
```

## 🔧 **Configuration**

### **Browser Configuration**
Supports multiple browsers:
- Chrome (default)
- Firefox
- WebKit/Safari

### **Parallel Execution**
Configure parallel execution in `cucumber.js`:
```javascript
--parallel 1  // Sequential execution
--parallel 4  // Run 4 tests in parallel
```

### **Timeouts**
Environment-specific timeouts in JSON files:
```json
{
  "timeouts": {
    "default": 30000,
    "api": 10000,
    "database": 5000
  }
}
```

## 💡 **Best Practices**

### **1. Use data-testid attributes (Recommended)**
```html
<input data-testid="emailInput" type="email" />
<button data-testid="submitButton">Submit</button>
```

### **2. Consistent naming conventions**
- Use camelCase for element names: `emailInput`, `submitButton`
- Use PascalCase for page names: `CreateAccountPage`, `LoginPage`

### **3. Organize test data**
```json
{
  "testUser": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "validationMessages": {
    "emailRequired": "Email is required",
    "passwordTooShort": "Password must be at least 8 characters"
  }
}
```

### **4. Use meaningful element names**
- ✅ `emailInput`, `passwordField`, `submitButton`
- ❌ `input1`, `field2`, `btn`

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd playwright-bdd-framework-boilerplate

# Install dependencies
npm install

# Run tests
npm test
```

### **Writing Your First Test**

1. **Create a feature file** in `features/ui/`:
```gherkin
@ui @myfeature
Feature: My New Feature
  Scenario: Test my feature
    Given I navigate to "MyPage" page
    When I enter value for "inputField" on "MyPage" page from "testData"
    Then I should see "successMessage" element on "MyPage" page
```

2. **Create page object** in `page-objects/myPage.js`:
```javascript
const BasePage = require('./basePage');

class MyPage extends BasePage {
    // Static locators - single source of truth
    static locators = {
        inputField: "[data-testid='my-input']",
        successMessage: ".success-msg"
    };

    constructor(page) {
        super(page);
        // Use static locators
        this.locators = MyPage.locators;
    }

    // Static method for generic steps - uses static locators
    static getLocators() {
        return {
            MyPage: MyPage.locators
        };
    }
}

module.exports = MyPage;
```

3. **Add test data** in `test-data/dev.json`:
```json
{
  "testData": "My test value"
}
```

4. **Run your test**:
```bash
TAG=@myfeature npm test
```

## 📋 **Available Scripts**

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests (default: dev environment, Chrome) |
| `npm run test:dev:chrome` | Run tests in dev environment with Chrome |
| `npm run test:test:firefox` | Run tests in test environment with Firefox |
| `npm run test:prod:webkit` | Run tests in prod environment with WebKit |
| `npm run cleanup-reports` | Clean up old test reports |
| `npm run generate-report` | Generate HTML test report |
| `npm run teams:notify` | Send test results to Teams |
| `npm run testrail:report` | Upload results to TestRail |

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Element not found**
   - Check if locator exists in appropriate page object class
   - Verify element is visible on the page
   - Add wait conditions if needed

2. **Test data not loading**
   - Ensure JSON syntax is valid
   - Check file path and naming
   - Verify environment variable is set correctly

3. **Browser not launching**
   - Run `npx playwright install` to install browsers
   - Check if browser is supported on your OS

### **Debug Mode**
```bash
# Run with debug output
DEBUG=pw:api npm test

# Run in headed mode
npm run test:headed
```

## 🤝 **Contributing**

1. Follow the established patterns for generic steps
2. Add appropriate locators to page-specific files
3. Include test data in environment JSON files
4. Write clear, descriptive scenario names
5. Add documentation for new features

## 📄 **License**

This project is licensed under the ISC License.

---

**Happy Testing! 🎉**

For questions or support, please refer to the framework documentation or create an issue in the repository.
