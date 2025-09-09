// TestRail Configuration
module.exports = {
    // TestRail API Configuration
    TESTRAIL_URL: process.env.TESTRAIL_URL || 'https://testrail.gamesys.co.uk',
    TESTRAIL_KEY: process.env.TESTRAIL_KEY,
    
    // TestRail Integration Control
    TESTRAIL_ENABLED: !!(process.env.TESTRAIL_KEY && process.env.TESTRAIL_SUITE_ID),
    
    // Project and Suite Configuration
    PROJECT_ID: process.env.TESTRAIL_PROJECT_ID || 51,
    SUITE_ID: process.env.TESTRAIL_SUITE_ID || 58893,

    // Default Section Configuration
    DEFAULT_SECTION_ID: process.env.TESTRAIL_DEFAULT_SECTION_ID || 927894,
    
    // Test Case Status IDs
    STATUS_IDS: {
        PASSED: 1,
        BLOCKED: 2,
        UNTESTED: 3,
        RETEST: 4,
        FAILED: 5
    },
    
    // Custom Field IDs (adjust these based on your TestRail setup)
    CUSTOM_FIELDS: {
        IS_REVIEWED: 'custom_isreviewed',
        IS_AUTOMATED: 'custom_isautomated',
        TESTING_LEVELS: 'custom_testing_levels'
    },
    
    // Default values for new test cases
    DEFAULT_VALUES: {
        IS_REVIEWED: 1,
        IS_AUTOMATED: 1,
        TESTING_LEVELS: [5] // Adjust based on your TestRail configuration
    }
};
