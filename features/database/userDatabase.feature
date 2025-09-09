@database @users
Feature: User Database Validation
  As a developer
  I want to validate database operations
  So that I can ensure data integrity

  @C201 @smoke
  Scenario: Connect to database successfully
    Given I connect to "testdb" database
    Then the database connection should be successful

  @C202 @validation
  Scenario: Validate user table structure
    Given I connect to "testdb" database
    When I execute query "DESCRIBE users"
    Then the query should return results
    And the result should contain columns:
      | column_name | data_type |
      | id          | int       |
      | email       | varchar   |
      | first_name  | varchar   |
      | last_name   | varchar   |
      | created_at  | timestamp |

  @C203 @crud
  Scenario: Insert and validate user record
    Given I connect to "testdb" database
    When I execute query "INSERT INTO users (email, first_name, last_name) VALUES ('test@example.com', 'Test', 'User')"
    Then the query should execute successfully
    When I execute query "SELECT * FROM users WHERE email = 'test@example.com'"
    Then the query should return 1 row
    And the result should contain:
      | email           | first_name | last_name |
      | test@example.com| Test       | User      |

  @C204 @validation
  Scenario: Validate user count
    Given I connect to "testdb" database
    When I get record count for table "users"
    Then the record count should be greater than 0

  @C205 @schema
  Scenario: Validate database schema
    Given I connect to "testdb" database
    When I validate the database schema
    Then the schema validation should pass
    And all required tables should exist

  @C206 @cleanup
  Scenario: Clean up test data
    Given I connect to "testdb" database
    When I execute query "DELETE FROM users WHERE email LIKE '%test%'"
    Then the query should execute successfully
