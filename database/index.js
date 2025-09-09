/**
 * Database Manager Module
 * Provides database connection and query functionality for test automation
 */

const mysql = require('mysql2/promise');
const dbConfig = require('../config/database-config');

class DatabaseManager {
    constructor() {
        this.connections = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize the database manager
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🔧 Initializing Database Manager...');
        this.isInitialized = true;
    }

    /**
     * Test connection to a specific database
     */
    async testConnection(databaseName) {
        try {
            console.log(`🔍 Testing connection to ${databaseName} database...`);
            
            const config = dbConfig.getDatabaseConfig(databaseName);
            if (!config) {
                throw new Error(`Database configuration not found for: ${databaseName}`);
            }

            // Simple database connection without SSH tunnels

            // Create test connection
            const connection = await mysql.createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database,
                connectTimeout: 10000,
                acquireTimeout: 10000,
                timeout: 10000
            });

            // Test the connection
            const [rows] = await connection.execute('SELECT 1 as test, VERSION() as version, USER() as user');
            await connection.end();

            return {
                connected: true,
                host: config.host,
                port: config.port,
                database: config.database,
                version: rows[0].version,
                user: rows[0].user
            };

        } catch (error) {
            console.log(`❌ Connection test failed for ${databaseName}: ${error.message}`);
            return {
                connected: false,
                error: error.message
            };
        }
    }

    /**
     * Connect to a specific database
     */
    async connect(databaseName) {
        try {
            await this.initialize();
            
            console.log(`🔌 Connecting to ${databaseName} database...`);
            
            const config = dbConfig.getDatabaseConfig(databaseName);
            if (!config) {
                throw new Error(`Database configuration not found for: ${databaseName}`);
            }

            // For databases requiring SSH tunnel, establish tunnel first
            if (config.requiresSSH) {
                await sshTunnelManager.createTunnel(databaseName);
                config.host = 'localhost';
                config.port = config.localPort;
            }

            // Create connection pool
            const pool = mysql.createPool({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                acquireTimeout: 60000,
                timeout: 60000,
                reconnect: true
            });

            this.connections.set(databaseName, pool);
            console.log(`✅ Connected to ${databaseName} database`);
            
            return pool;

        } catch (error) {
            console.log(`❌ Failed to connect to ${databaseName}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Switch to a different database
     */
    async switchToDatabase(databaseName) {
        return await this.connect(databaseName);
    }

    /**
     * Execute a SELECT query
     */
    async executeSelect(query, params = [], databaseName = 'default') {
        try {
            let connection = this.connections.get(databaseName);
            
            if (!connection) {
                connection = await this.connect(databaseName);
            }

            console.log(`📊 Executing query on ${databaseName}: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
            
            const [rows] = await connection.execute(query, params);
            return rows;

        } catch (error) {
            console.log(`❌ Query execution failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute an INSERT, UPDATE, or DELETE query
     */
    async executeModify(query, params = [], databaseName = 'default') {
        try {
            let connection = this.connections.get(databaseName);
            
            if (!connection) {
                connection = await this.connect(databaseName);
            }

            console.log(`✏️ Executing modify query on ${databaseName}: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
            
            const [result] = await connection.execute(query, params);
            return result;

        } catch (error) {
            console.log(`❌ Modify query execution failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate database schema
     */
    async validateDatabaseSchema(databaseName, expectedTables = null) {
        try {
            console.log(`🔍 Validating schema for ${databaseName} database...`);
            
            // Get all tables in the database
            const tables = await this.executeSelect('SHOW TABLES', [], databaseName);
            const tableNames = tables.map(row => Object.values(row)[0]);
            
            const result = {
                database: databaseName,
                totalTables: tableNames.length,
                tables: tableNames,
                valid: true,
                missingTables: [],
                extraTables: []
            };

            if (expectedTables && expectedTables.length > 0) {
                result.missingTables = expectedTables.filter(table => !tableNames.includes(table));
                result.extraTables = tableNames.filter(table => !expectedTables.includes(table));
                result.valid = result.missingTables.length === 0;
            }

            return result;

        } catch (error) {
            console.log(`❌ Schema validation failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Compare data across multiple databases
     */
    async compareDataAcrossDatabases(query, databases) {
        const results = {};
        
        for (const dbName of databases) {
            try {
                const data = await this.executeSelect(query, [], dbName);
                results[dbName] = {
                    success: true,
                    data: data,
                    rowCount: data.length
                };
            } catch (error) {
                results[dbName] = {
                    success: false,
                    error: error.message,
                    rowCount: 0
                };
            }
        }

        return {
            query: query,
            databases: databases,
            results: results
        };
    }

    /**
     * Close all database connections
     */
    async closeAllConnections() {
        try {
            console.log('🔌 Closing all database connections...');
            
            for (const [dbName, connection] of this.connections) {
                try {
                    await connection.end();
                    console.log(`✅ Closed connection to ${dbName}`);
                } catch (error) {
                    console.log(`⚠️ Warning closing ${dbName}: ${error.message}`);
                }
            }
            
            this.connections.clear();
            
            // Close SSH tunnels
            await sshTunnelManager.closeAllTunnels();
            
            console.log('✅ All database connections closed');
            
        } catch (error) {
            console.log(`❌ Error closing connections: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            activeConnections: Array.from(this.connections.keys()),
            totalConnections: this.connections.size,
            isInitialized: this.isInitialized
        };
    }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

module.exports = {
    databaseManager,
    DatabaseManager
};
