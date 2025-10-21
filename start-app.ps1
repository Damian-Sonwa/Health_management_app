# Healthcare App Startup Script
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Healthcare App - Starting Servers   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan

# Stop any existing node processes
Write-Host "`n1. Stopping existing servers..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host "`n2. Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\healthcare-mern\backend'; Write-Host '=== BACKEND SERVER ===' -ForegroundColor Green; npm start"
Start-Sleep -Seconds 8

# Start Frontend
Write-Host "`n3. Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\shadcn-ui'; Write-Host '=== FRONTEND SERVER ===' -ForegroundColor Green; npm run dev"
Start-Sleep -Seconds 8

# Verify servers
Write-Host "`n4. Verifying servers..." -ForegroundColor Yellow
$backend = Test-NetConnection -ComputerName localhost -Port 5001 -InformationLevel Quiet -WarningAction SilentlyContinue
$frontend = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         SERVER STATUS                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green

if($backend) {
    Write-Host "✅ Backend:  http://localhost:5001" -ForegroundColor Green
} else {
    Write-Host "❌ Backend:  NOT RUNNING" -ForegroundColor Red
}

if($frontend) {
    Write-Host "✅ Frontend: http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: NOT RUNNING" -ForegroundColor Red
}

if($backend -and $frontend) {
    Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         READY TO USE!                  ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n📋 LOGIN CREDENTIALS:" -ForegroundColor Yellow
    Write-Host "   Email:    madudamian25@gmail.com"
    Write-Host "   Password: password123"
    
    Write-Host "`n🚀 HOW TO LOGIN:" -ForegroundColor Yellow
    Write-Host "   1. Press Ctrl+Shift+N (Incognito Mode)"
    Write-Host "   2. Go to: http://localhost:5173"
    Write-Host "   3. Login with credentials above"
    
    Write-Host "`n⚠️  IMPORTANT: Always use Incognito mode" -ForegroundColor Red
    Write-Host "   to avoid browser cache issues!`n"
    
    # Open browser in incognito
    $choice = Read-Host "Open browser in Incognito mode now? (y/n)"
    if($choice -eq 'y' -or $choice -eq 'Y') {
        Start-Process chrome -ArgumentList "--incognito", "http://localhost:5173"
    }
} else {
    Write-Host "`n⚠️  Some servers failed to start." -ForegroundColor Yellow
    Write-Host "   Check the terminal windows for errors.`n"
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

