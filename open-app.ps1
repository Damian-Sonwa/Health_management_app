# Healthcare App - Open in Incognito Mode
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Opening Healthcare App (Incognito)  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan

# Check if servers are running
Write-Host "`nChecking servers..." -ForegroundColor Yellow
$backend = Test-NetConnection -ComputerName localhost -Port 5001 -InformationLevel Quiet -WarningAction SilentlyContinue
$frontend = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue

if(-not $backend -or -not $frontend) {
    Write-Host "`n❌ Servers are not running!" -ForegroundColor Red
    Write-Host "`nPlease run 'start-app.ps1' first to start the servers.`n"
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "✅ Servers are running!`n" -ForegroundColor Green

# Try to open in different browsers
Write-Host "Opening in Incognito mode..." -ForegroundColor Yellow

$opened = $false

# Try Chrome
if(Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--incognito", "http://localhost:5173"
    Write-Host "✅ Opened in Chrome Incognito" -ForegroundColor Green
    $opened = $true
}
elseif(Test-Path "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe") {
    Start-Process "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" -ArgumentList "--incognito", "http://localhost:5173"
    Write-Host "✅ Opened in Chrome Incognito" -ForegroundColor Green
    $opened = $true
}
# Try Edge
elseif(Test-Path "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe") {
    Start-Process "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "-inprivate", "http://localhost:5173"
    Write-Host "✅ Opened in Edge InPrivate" -ForegroundColor Green
    $opened = $true
}
# Try Firefox
elseif(Test-Path "C:\Program Files\Mozilla Firefox\firefox.exe") {
    Start-Process "C:\Program Files\Mozilla Firefox\firefox.exe" -ArgumentList "-private-window", "http://localhost:5173"
    Write-Host "✅ Opened in Firefox Private" -ForegroundColor Green
    $opened = $true
}
else {
    Write-Host "⚠️  Could not find Chrome, Edge, or Firefox" -ForegroundColor Yellow
    Write-Host "`nPlease manually:" -ForegroundColor Cyan
    Write-Host "1. Press Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Firefox/Edge)"
    Write-Host "2. Go to: http://localhost:5173"
    $opened = $false
}

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         LOGIN CREDENTIALS              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`nEmail:    madudamian25@gmail.com"
Write-Host "Password: password123"

if($opened) {
    Write-Host "`n✨ Browser opened in Incognito mode!" -ForegroundColor Green
    Write-Host "   Login with the credentials above.`n"
} else {
    Write-Host "`n⚠️  Please open Incognito mode manually and go to:" -ForegroundColor Yellow
    Write-Host "   http://localhost:5173`n"
}

Read-Host "Press Enter to close"

