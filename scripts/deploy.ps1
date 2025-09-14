# PowerShell deployment script for Windows
param(
    [string]$Platform = "vercel"
)

Write-Host "Starting deployment of St. Xavier ERP..." -ForegroundColor Green

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build:web

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy based on platform choice
if ($Platform -eq "vercel") {
    Write-Host "Deploying to Vercel..." -ForegroundColor Blue
    npx vercel --prod
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully deployed to Vercel!" -ForegroundColor Green
        Write-Host "Your app is live at: https://stxavier-erp.vercel.app" -ForegroundColor Cyan
    }
}
elseif ($Platform -eq "netlify") {
    Write-Host "Deploying to Netlify..." -ForegroundColor Blue
    npx netlify deploy --prod --dir=dist
}
elseif ($Platform -eq "railway") {
    Write-Host "Deploying to Railway..." -ForegroundColor Blue
    railway up
}
elseif ($Platform -eq "docker") {
    Write-Host "Building and running Docker container..." -ForegroundColor Blue
    docker build -t stxavier-erp .
    docker run -d -p 3000:3000 --name stxavier-erp-container stxavier-erp
}
else {
    Write-Host "Unknown platform: $Platform" -ForegroundColor Red
    Write-Host "Available platforms: vercel, netlify, railway, docker" -ForegroundColor Yellow
    exit 1
}

# Health check
Write-Host "Running health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

try {
    $response = Invoke-WebRequest -Uri "https://stxavier-erp.vercel.app" -Method Head
    if ($response.StatusCode -eq 200) {
        Write-Host "Health check passed!" -ForegroundColor Green
    }
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "Deployment complete! Your ERP system is now running 24/7 in the cloud." -ForegroundColor Green
