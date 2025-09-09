@api @users
Feature: User Management API
  As a developer
  I want to test user management endpoints
  So that I can ensure the API works correctly

  Background:
    Given I clear all dynamic headers and query parameters

  @C001 @smoke
  Scenario: Get list of users successfully
    When I send a GET request to "GET_USERS" with headers from "headers.json"
    Then the response status should be 200
    And the response body in JSON should contain the following values:
      | page     | 1    |
      | per_page | 6    |
      | total    | 12   |

  @C002 @smoke
  Scenario: Get single user successfully
    When I send a GET request to "GET_USERS" with path parameter "2"
    Then the response status should be 200
    And the response body in JSON should contain the following values:
      | data.id         | 2                      |
      | data.email      | janet.weaver@reqres.in |
      | data.first_name | Janet                  |
      | data.last_name  | Weaver                 |

  @C003 @smoke
  Scenario: Get non-existent user returns 404
    When I send a GET request to "GET_USERS" with path parameter "999"
    Then the response status should be 404

  @C004 @crud
  Scenario: Create new user successfully
    When I send a POST request to "POST_USERS" with headers from "headers.json" and body from "createUser.json"
    Then the response status should be 201
    And the response body in JSON should contain the following values:
      | name | John Doe           |
      | job  | Software Engineer  |
    And I store the response field "id" as session variable "createdUserId"

  @C005 @crud
  Scenario: Update user successfully
    When I send a PUT request to "PUT_USERS" with path parameter "2" and headers from "headers.json" and body from "updateUser.json"
    Then the response status should be 200
    And the response body in JSON should contain the following values:
      | name | John Smith                |
      | job  | Senior Software Engineer  |

  @C006 @crud
  Scenario: Delete user successfully
    When I send a DELETE request to "DELETE_USERS" with path parameter "2"
    Then the response status should be 204

  @C007 @validation
  Scenario: Create user with missing required fields
    When I send a POST request to "POST_USERS" with headers from "headers.json" and body:
      """
      {
        "name": "Test User"
      }
      """
    Then the response status should be 201
    And the response body in JSON should contain the following values:
      | name | Test User |

  @C008 @performance
  Scenario: API response time should be acceptable
    When I send a GET request to "GET_USERS" with headers from "headers.json"
    Then the response status should be 200
    And the response time should be less than 2000 milliseconds
