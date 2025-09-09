/**
 * Simple Database Configuration for dev/test/prod environments
 */

const path = require('path');
const fs = require('fs');

class DatabaseConfig {
    constructor() {
        this.env = process.env.ENV || 'dev';
        this.loadConfiguration();
    }

    /**
     * Load configuration from environment files
     */
    loadConfiguration() {
        // Load base configuration from environment file
        const configPath = path.join(__dirname, '..', 'test-data', `${this.env}.json`);
        let envConfig = {};
        
        if (fs.existsSync(configPath)) {
            try {
                envConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } catch (error) {
                console.warn(`Failed to load config from ${configPath}:`, error.message);
            }
        }

        // Simple database configurations for each environment
        this.databases = {
            default: {
                host: process.env.DB_HOST || envConfig.database?.host || 'localhost',
                port: process.env.DB_PORT || envConfig.database?.port || 3306,
                user: process.env.DB_USER || envConfig.database?.user || 'root',
                password: process.env.DB_PASSWORD || envConfig.database?.password || '',
                database: process.env.DB_NAME || envConfig.database?.database || 'testdb',
                connectTimeout: 30000,
                acquireTimeout: 30000,
                timeout: 30000
            },
            testdb: {
                host: process.env.DB_HOST || envConfig.database?.host || 'localhost',
                port: process.env.DB_PORT || envConfig.database?.port || 3306,
                user: process.env.DB_USER || envConfig.database?.user || 'root',
                password: process.env.DB_PASSWORD || envConfig.database?.password || '',
                database: process.env.DB_NAME || envConfig.database?.database || 'testdb',
                connectTimeout: 30000,
                acquireTimeout: 30000,
                timeout: 30000
            }
        };
    }

    /**
     * Get database configuration for a specific database
     */
    getDatabaseConfig(databaseName) {
        return this.databases[databaseName] || this.databases.default;
    }

    /**
     * Get all configured database names
     */
    getConfiguredDatabases() {
        return Object.keys(this.databases);
    }
}

// Export singleton instance
module.exports = new DatabaseConfig();