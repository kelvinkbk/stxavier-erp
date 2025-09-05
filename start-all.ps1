# St. Xavier ERP - All-in-One Startup Script
# PowerShell version for Windows

param(
    [switch]$Deploy,
    [switch]$Help
)

# Colors for output
function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Get-LocalIP {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*" | Where-Object {$_.IPAddress -notlike "169.254*" -and $_.IPAddress -notlike "127.*"}).IPAddress
    if ($ip) { return $ip[0] }
    
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254*" -and $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "10.0.75.*"}).IPAddress
    if ($ip) { return $ip[0] }
    
    return "localhost"
}

function Show-Help {
    Write-ColorText "🎓 St. Xavier ERP - All-in-One Startup Script" "Cyan"
    Write-ColorText "=============================================" "Cyan"
    Write-ColorText ""
    Write-ColorText "Usage:" "Yellow"
    Write-ColorText "  .\start-all.ps1          # Start development server" "White"
    Write-ColorText "  .\start-all.ps1 -Deploy  # Build and deploy to production" "White"
    Write-ColorText "  .\start-all.ps1 -Help    # Show this help" "White"
    Write-ColorText ""
    Write-ColorText "Features:" "Yellow"
    Write-ColorText "  ✅ Local development server" "Green"
    Write-ColorText "  ✅ Network access for testing" "Green"
    Write-ColorText "  ✅ Mobile QR code generation" "Green"
    Write-ColorText "  ✅ Production deployment" "Green"
}

function Start-Development {
    $localIP = Get-LocalIP
    $webPort = 8081
    $networkUrl = "http://${localIP}:${webPort}"
    
    Write-ColorText "🎓 St. Xavier ERP - Starting All Services" "Cyan"
    Write-ColorText "=========================================" "Cyan"
    Write-ColorText ""
    
    Write-ColorText "📱 Access Methods:" "Yellow"
    Write-ColorText "   Local Web:     http://localhost:${webPort}" "Green"
    Write-ColorText "   Network Web:   ${networkUrl}" "Green"
    Write-ColorText "   Mobile QR:     Scan QR code below" "Green"
    Write-ColorText ""
    
    Write-ColorText "🌐 Cross-Network Testing:" "Yellow"
    Write-ColorText "   Same WiFi:     ${networkUrl}" "Cyan"
    Write-ColorText "   Share this URL with others on the same WiFi network" "White"
    Write-ColorText ""
    
    Write-ColorText "🚀 Starting Expo Development Server..." "Cyan"
    Write-ColorText "   (This will show QR code and Expo URL)" "White"
    Write-ColorText ""
    
    # Start Expo server
    try {
        Start-Process -NoNewWindow -Wait -FilePath "npx" -ArgumentList "expo", "start", "--web"
    }
    catch {
        Write-ColorText "❌ Failed to start Expo server: $_" "Red"
        Write-ColorText "💡 Try running: npm install -g @expo/cli" "Yellow"
    }
}

function Start-Deployment {
    Write-ColorText "🚀 Starting Deployment Process..." "Cyan"
    Write-ColorText ""
    
    try {
        Write-ColorText "📦 Building web version..." "Yellow"
        & npm run build:web
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✅ Build completed successfully!" "Green"
            Write-ColorText ""
            
            Write-ColorText "☁️ Deploying to Vercel..." "Yellow"
            & vercel --prod
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorText "✅ Deployment completed!" "Green"
                Write-ColorText "🌐 Your app is now available globally!" "Green"
            } else {
                Write-ColorText "❌ Deployment failed!" "Red"
                Write-ColorText "💡 Make sure you're logged in: vercel login" "Yellow"
            }
        } else {
            Write-ColorText "❌ Build failed!" "Red"
        }
    }
    catch {
        Write-ColorText "❌ Deployment error: $_" "Red"
    }
}

# Main execution
if ($Help) {
    Show-Help
}
elseif ($Deploy) {
    Start-Deployment
}
else {
    Start-Development
}
