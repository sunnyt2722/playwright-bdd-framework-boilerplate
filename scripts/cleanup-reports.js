#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Clean up reports directory to prevent JSON file conflicts
 */
function cleanupReports() {
    const reportsDir = path.join(__dirname, '..', 'reports');
    
    if (!fs.existsSync(reportsDir)) {
        console.log(' Reports directory does not exist, nothing to clean');
        return;
    }

    console.log(' Cleaning up reports directory...');

    // List of files to keep
    const filesToKeep = [
        'multiple-cucumber-html-report' // Keep the HTML report directory
    ];

    // Get all files in reports directory
    const files = fs.readdirSync(reportsDir);
    
    let cleanedCount = 0;
    
    files.forEach(file => {
        const filePath = path.join(reportsDir, file);
        const stat = fs.statSync(filePath);
        
        // Skip directories that should be kept
        if (stat.isDirectory() && filesToKeep.includes(file)) {
            return;
        }
        
        // Remove JSON files and HTML files from previous runs
        if (file.endsWith('.json') || file.endsWith('.html')) {
            try {
                fs.unlinkSync(filePath);
                console.log(`   Removed: ${file}`);
                cleanedCount++;
            } catch (error) {
                console.log(`   Failed to remove ${file}:`, error.message);
            }
        }
    });
    
    console.log(` Cleanup complete: ${cleanedCount} files removed`);
}

// Run cleanup if this script is executed directly
if (require.main === module) {
    cleanupReports();
}

module.exports = cleanupReports; 