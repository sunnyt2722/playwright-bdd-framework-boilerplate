const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const envConfig = require('../../utils/envConfig');

let response;
let dynamicHeaders = {};
let sessionVariables = {};

// Export function to clear dynamic headers for test isolation
function clearDynamicHeaders() {
    dynamicHeaders = {};
}

// Make the function globally accessible for hooks
global.clearDynamicHeaders = clearDynamicHeaders;

module.exports = { clearDynamicHeaders };

// Helper function to get nested values from objects using dot notation
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
};

// Helper function to read JSON files
function readJsonFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.log(`Error reading file ${filePath}:`, error.message);
    }
    return null;
}

// Helper function to get file path for test data
function getFilePath(endpointKey, fileName) {
    const basePath = path.join(__dirname, '../../test-data/api', endpointKey);
    return path.join(basePath, fileName);
}

// Helper function to build URL
function buildUrl(endpointKey, pathParam = '') {
    const config = envConfig.getConfig();
    const baseUrl = config.apiBaseUrl;
    
    const endpoints = {
        'GET_USERS': '/users',
        'POST_USERS': '/users',
        'PUT_USERS': '/users',
        'DELETE_USERS': '/users'
    };
    
    let endpoint = endpoints[endpointKey];
    if (!endpoint) {
        throw new Error(`Unknown endpoint: ${endpointKey}`);
    }
    
    if (pathParam) {
        endpoint += `/${pathParam}`;
    }
    
    return `${baseUrl}${endpoint}`;
}

// Step to clear dynamic headers and query parameters
Given('I clear all dynamic headers and query parameters', function () {
    clearDynamicHeaders();
    console.log('Cleared all dynamic headers and query parameters');
});

// GET request steps
When('I send a GET request to {string} with headers from {string}', async function (endpointKey, headerFile) {
    const url = buildUrl(endpointKey);
    const headers = headerFile ? readJsonFile(getFilePath(endpointKey, headerFile)) || {} : {};
    
    console.log('GET Request:', url);
    
    const startTime = Date.now();
    try {
        response = await axios.get(url, { headers });
        response.responseTime = Date.now() - startTime;
        console.log('Response Status:', response.status);
    } catch (error) {
        response = error.response;
        response.responseTime = Date.now() - startTime;
        console.log('Request failed - Status:', response?.status || 'No response');
    }
});

When('I send a GET request to {string} with path parameter {string}', async function (endpointKey, pathParam) {
    const url = buildUrl(endpointKey, pathParam);
    
    console.log('GET Request:', url);
    
    const startTime = Date.now();
    try {
        response = await axios.get(url);
        response.responseTime = Date.now() - startTime;
        console.log('Response Status:', response.status);
    } catch (error) {
        response = error.response;
        response.responseTime = Date.now() - startTime;
        console.log('Request failed - Status:', response?.status || 'No response');
    }
});

// POST request steps
When('I send a POST request to {string} with headers from {string} and body from {string}', async function (endpointKey, headerFile, bodyFile) {
    const url = buildUrl(endpointKey);
    const headers = headerFile ? readJsonFile(getFilePath(endpointKey, headerFile)) || {} : {};
    const body = bodyFile ? readJsonFile(getFilePath(endpointKey, bodyFile)) : {};
    
    console.log('POST Request:', url);
    
    const startTime = Date.now();
    try {
        response = await axios.post(url, body, { headers });
        response.responseTime = Date.now() - startTime;
        console.log('Response Status:', response.status);
    } catch (error) {
        response = error.response;
        response.responseTime = Date.now() - startTime;
        console.log('Request failed - Status:', response?.status || 'No response');
    }
});

When('I send a POST request to {string} with headers from {string} and body:', async function (endpointKey, headerFile, bodyString) {
    const url = buildUrl(endpointKey);
    const headers = headerFile ? readJsonFile(getFilePath(endpointKey, headerFile)) || {} : {};
    const body = JSON.parse(bodyString);
    
    console.log('POST Request:', url);
    
    const startTime = Date.now();
    try {
        response = await axios.post(url, body, { headers });
        response.responseTime = Date.now() - startTime;
        console.log('Response Status:', response.status);
    } catch (error) {
        response = error.response;
        response.responseTime = Date.now() - startTime;
        console.log('Request failed - Status:', response?.status || 'No response');
    }
});

// PUT request steps
When('I send a PUT request to {string} with path parameter {string} and headers from {string} and body from {string}', async function (endpointKey, pathParam, headerFile, bodyFile) {
    const url = buildUrl(endpointKey, pathParam);
    const headers = headerFile ? readJsonFile(getFilePath(endpointKey, headerFile)) || {} : {};
    const body = bodyFile ? readJsonFile(getFilePath(endpointKey, bodyFile)) : {};
    
    console.log('PUT Request:', url);
    
    const startTime = Date.now();
    try {
        response = await axios.put(url, body, { headers });
        response.responseTime = Date.now() - startTime;
        console.log('Response Status:', response.status);
    } catch (error) {
        response = error.response;
        response.responseTime = Date.now() - startTime;
        console.log('Request failed - Status:', response?.status || 'No response');
    }
});

// DELETE request steps
When('I send a DELETE request to {string} with path parameter {string}', async function (endpointKey, pathParam) {
    const url = buildUrl(endpointKey, pathParam);
    
    console.log('DELETE Request:', url);
    
    const startTime = Date.now();
    try {
        response = await axios.delete(url);
        response.responseTime = Date.now() - startTime;
        console.log('Response Status:', response.status);
    } catch (error) {
        response = error.response;
        response.responseTime = Date.now() - startTime;
        console.log('Request failed - Status:', response?.status || 'No response');
    }
});

// Response validation steps
Then('the response status should be {int}', function (expectedStatus) {
    expect(response.status).to.equal(expectedStatus);
    console.log(`Response status validated: ${expectedStatus}`);
});

Then('the response body in JSON should contain the following values:', function (dataTable) {
    const rows = dataTable.hashes();
    
    rows.forEach(row => {
        const fieldPath = row.field || row.key || Object.keys(row)[0];
        const expectedValue = row.value || row[Object.keys(row)[1]];
        
        const actualValue = getNestedValue(response.data, fieldPath);
        
        // Convert values for comparison
        let expected = expectedValue;
        let actual = actualValue;
        
        if (!isNaN(expectedValue) && expectedValue !== '') {
            expected = Number(expectedValue);
        }
        
        expect(actual).to.equal(expected);
        console.log(`Validated ${fieldPath}: ${actual} === ${expected}`);
    });
});

Then('the response time should be less than {int} milliseconds', function (maxTime) {
    const responseTime = response.responseTime || 0;
    expect(responseTime).to.be.lessThan(maxTime);
    console.log(`Response time validated: ${responseTime}ms < ${maxTime}ms`);
});

// Session variable steps
Then('I store the response field {string} as session variable {string}', function (fieldPath, variableName) {
    const fieldValue = getNestedValue(response.data, fieldPath);
    sessionVariables[variableName] = fieldValue;
    console.log(`Stored response field "${fieldPath}" with value "${fieldValue}" as session variable "${variableName}"`);
});
