const fs = require('fs');
const path = require('path');

class EnvConfig {
    constructor() {
        this.env = process.env.ENV || 'dev';
        this.loadConfig();
    }

    loadConfig() {
        try {
            const configPath = path.resolve(__dirname, '../test-data', `${this.env}.json`);
            this.data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (error) {
            console.error(`Failed to load config for environment: ${this.env}`, error.message);
            // Fallback to default config
            this.data = {
                baseUrl: "https://www.google.com",
                apiBaseUrl: "https://reqres.in/api",
                timeouts: {
                    default: 30000,
                    api: 10000,
                    database: 5000
                }
            };
        }
    }

    getConfig() {
        return this.data;
    }

    getEnv() {
        return this.env;
    }

    getBaseUrl() {
        return this.data.baseUrl;
    }

    getApiBaseUrl() {
        return this.data.apiBaseUrl;
    }

    getTimeouts() {
        return this.data.timeouts;
    }
}

// Create singleton instance
const envConfig = new EnvConfig();

module.exports = envConfig;