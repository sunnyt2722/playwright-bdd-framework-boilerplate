#!/bin/bash

echo "�� Setting up Playwright BDD Framework Boilerplate"
echo "=================================================="

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browsers"
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p test-results/screenshots
mkdir -p reports/multiple-cucumber-html-report

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Update test-data/*.json files with your application URLs"
echo "2. Configure integrations in config/ directory (optional)"
echo "3. Run your first test: npm test"
echo ""
echo "📚 Available commands:"
echo "  npm test                    # Run all tests (dev environment)"
echo "  npm run test:devChrome      # Run tests in dev environment with Chrome"
echo "  npm run test:stagingFirefox # Run tests in staging environment with Firefox"
echo "  npm run generate-report     # Generate HTML reports"
echo ""
echo "Happy testing! 🎉"
