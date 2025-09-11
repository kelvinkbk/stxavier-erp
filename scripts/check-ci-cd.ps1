# 🔧 CI/CD Environment Verification Script (PowerShell)
# St. Xavier ERP - CI/CD Environment Check

Write-Host "🚀 St. Xavier ERP - CI/CD Environment Check" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this from the project root." -ForegroundColor Red
    exit 1
}

$packageName = (Get-Content "package.json" | ConvertFrom-Json).name
Write-Host "📦 Project: $packageName" -ForegroundColor Green
Write-Host "📍 Directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "📋 Environment Check:" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "├── Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "├── Node.js: Not installed" -ForegroundColor Red
}

try {
    $npmVersion = npm --version
    Write-Host "├── npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "├── npm: Not installed" -ForegroundColor Red
}

try {
    $expoVersion = npx expo --version 2>$null
    Write-Host "└── Expo CLI: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "└── Expo CLI: Not installed" -ForegroundColor Yellow
}
Write-Host ""

# Check for environment files
Write-Host "🔒 Environment Configuration:" -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    $firebaseVars = Get-Content ".env" | Where-Object { $_ -match "^EXPO_PUBLIC_FIREBASE_" } | ForEach-Object { ($_ -split "=")[0] }
    Write-Host "   Firebase variables:"
    $firebaseVars | ForEach-Object { Write-Host "   ├── $_" -ForegroundColor Cyan }
    Write-Host "   └── $($firebaseVars.Count) Firebase variables configured" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
}
Write-Host ""

# Check TypeScript configuration
Write-Host "📝 TypeScript Configuration:" -ForegroundColor Yellow
if (Test-Path "tsconfig.json") {
    Write-Host "✅ tsconfig.json found" -ForegroundColor Green
} else {
    Write-Host "❌ tsconfig.json not found" -ForegroundColor Red
}
Write-Host ""

# Check CI/CD files
Write-Host "🔄 CI/CD Configuration:" -ForegroundColor Yellow
if (Test-Path ".github/workflows/ci-cd.yml") {
    Write-Host "✅ CI/CD workflow found" -ForegroundColor Green
    Write-Host "   Jobs configured:"
    $jobs = Get-Content ".github/workflows/ci-cd.yml" | Where-Object { $_ -match "^  [a-zA-Z-]+:" } | ForEach-Object { $_.Trim().TrimEnd(':') }
    $jobs | ForEach-Object { Write-Host "   ├── $_" -ForegroundColor Cyan }
} else {
    Write-Host "❌ CI/CD workflow not found" -ForegroundColor Red
}
Write-Host ""

# Test basic build commands
Write-Host "🧪 Build Test:" -ForegroundColor Yellow
Write-Host "Testing TypeScript compilation..."
try {
    $tscOutput = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript compilation failed" -ForegroundColor Red
        Write-Host "   Run 'npx tsc --noEmit' for details" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ TypeScript compilation test failed" -ForegroundColor Red
}
Write-Host ""

# Git repository check
Write-Host "📊 Git Repository:" -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
    try {
        $currentBranch = git branch --show-current 2>$null
        Write-Host "   Current branch: $currentBranch" -ForegroundColor Cyan
    } catch {
        Write-Host "   Current branch: Unknown" -ForegroundColor Yellow
    }
    try {
        $remoteOrigin = git remote get-url origin 2>$null
        Write-Host "   Remote origin: $remoteOrigin" -ForegroundColor Cyan
    } catch {
        Write-Host "   Remote origin: Not configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Git repository not initialized" -ForegroundColor Red
}
Write-Host ""

# GitHub Actions status
Write-Host "🔍 GitHub Actions:" -ForegroundColor Yellow
if (Test-Path ".github/workflows") {
    Write-Host "✅ Workflows directory found" -ForegroundColor Green
    $workflowFiles = Get-ChildItem ".github/workflows/*.yml" -ErrorAction SilentlyContinue
    if ($workflowFiles) {
        Write-Host "   Workflow files:"
        $workflowFiles | ForEach-Object { Write-Host "   ├── $($_.Name)" -ForegroundColor Cyan }
    } else {
        Write-Host "   └── No .yml files found" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ No workflows directory" -ForegroundColor Red
}
Write-Host ""

# Recommendations
Write-Host "💡 Recommendations:" -ForegroundColor Magenta
Write-Host "├── Ensure all dependencies are installed: npm ci" -ForegroundColor White
Write-Host "├── Test local build: npm run build:web" -ForegroundColor White
Write-Host "├── Configure Firebase secrets in GitHub repository" -ForegroundColor White
Write-Host "├── Add Vercel secrets for deployment (optional)" -ForegroundColor White
Write-Host "└── Test CI/CD by pushing to main branch" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Next Steps:" -ForegroundColor Magenta
Write-Host "1. If building locally works, your code is ready" -ForegroundColor White
Write-Host "2. Add GitHub secrets following docs/GITHUB_SECRETS_SETUP.md" -ForegroundColor White
Write-Host "3. Push to main branch to trigger CI/CD pipeline" -ForegroundColor White
Write-Host "4. Monitor GitHub Actions tab for pipeline status" -ForegroundColor White
Write-Host ""

Write-Host "✨ CI/CD Environment Check Complete!" -ForegroundColor Green
