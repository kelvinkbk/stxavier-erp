#!/bin/bash
# 🔧 CI/CD Environment Verification Script

echo "🚀 St. Xavier ERP - CI/CD Environment Check"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root."
    exit 1
fi

echo "📦 Project: $(grep '"name"' package.json | cut -d'"' -f4)"
echo "📍 Directory: $(pwd)"
echo ""

# Check Node.js version
echo "📋 Environment Check:"
echo "├── Node.js: $(node --version)"
echo "├── npm: $(npm --version)"
echo "└── Expo CLI: $(npx expo --version 2>/dev/null || echo 'Not installed')"
echo ""

# Check package.json scripts
echo "🔧 Available Scripts:"
if npm run > /dev/null 2>&1; then
    npm run --silent 2>/dev/null | grep -E "^\s+" | head -10
else
    echo "❌ npm scripts not available"
fi
echo ""

# Check for environment files
echo "🔒 Environment Configuration:"
if [ -f ".env" ]; then
    echo "✅ .env file found"
    echo "   Firebase variables:"
    grep -E "^EXPO_PUBLIC_FIREBASE_" .env | cut -d'=' -f1 | sed 's/^/   ├── /'
    echo "   └── $(grep -c "^EXPO_PUBLIC_FIREBASE_" .env) Firebase variables configured"
else
    echo "⚠️  .env file not found"
fi
echo ""

# Check TypeScript configuration
echo "📝 TypeScript Configuration:"
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json found"
else
    echo "❌ tsconfig.json not found"
fi
echo ""

# Check CI/CD files
echo "🔄 CI/CD Configuration:"
if [ -f ".github/workflows/ci-cd.yml" ]; then
    echo "✅ CI/CD workflow found"
    echo "   Jobs configured:"
    grep -E "^  [a-zA-Z-]+:" .github/workflows/ci-cd.yml | sed 's/:$//' | sed 's/^/   ├── /'
else
    echo "❌ CI/CD workflow not found"
fi
echo ""

# Test basic build commands
echo "🧪 Build Test:"
echo "Testing TypeScript compilation..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "   Run 'npx tsc --noEmit' for details"
fi
echo ""

# Test environment loading
echo "🔥 Firebase Configuration Test:"
if npm run test:env > /dev/null 2>&1; then
    echo "✅ Environment test passed"
elif [ -f ".env" ]; then
    echo "⚠️  Environment file exists but test script not found"
    echo "   Add 'test:env' script to package.json for better validation"
else
    echo "❌ No environment configuration found"
fi
echo ""

# Git repository check
echo "📊 Git Repository:"
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
    echo "   Current branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
    echo "   Remote origin: $(git remote get-url origin 2>/dev/null || echo 'Not configured')"
else
    echo "❌ Git repository not initialized"
fi
echo ""

# GitHub Actions status
echo "🔍 GitHub Actions:"
if [ -d ".github/workflows" ]; then
    echo "✅ Workflows directory found"
    echo "   Workflow files:"
    ls .github/workflows/*.yml 2>/dev/null | sed 's/^/   ├── /' || echo "   └── No .yml files found"
else
    echo "❌ No workflows directory"
fi
echo ""

# Recommendations
echo "💡 Recommendations:"
echo "├── Ensure all dependencies are installed: npm ci"
echo "├── Test local build: npm run build:web"
echo "├── Configure Firebase secrets in GitHub repository"
echo "├── Add Vercel secrets for deployment (optional)"
echo "└── Test CI/CD by pushing to main branch"
echo ""

echo "🎯 Next Steps:"
echo "1. If building locally works, your code is ready"
echo "2. Add GitHub secrets following docs/GITHUB_SECRETS_SETUP.md"
echo "3. Push to main branch to trigger CI/CD pipeline"
echo "4. Monitor GitHub Actions tab for pipeline status"
echo ""

echo "✨ CI/CD Environment Check Complete!"
