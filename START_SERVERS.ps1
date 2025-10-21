# Healthcare App - Start Both Servers
# PowerShell Script

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║         🚀 Starting Healthcare App Servers 🚀         ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📡 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/healthcare-mern/backend'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Green; npm start"

Write-Host "⏳ Waiting 3 seconds for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host "`n🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/shadcn-ui'; Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Green; npm run dev"

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n📋 Server Information:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5001/api" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "`n🔐 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Email:    madudamian25@gmail.com" -ForegroundColor White
Write-Host "   Password: password123" -ForegroundColor White

Write-Host "`n⏳ Waiting 5 seconds before opening browser..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "`n🌐 Opening app in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host "`n✅ App is ready! Check the browser window." -ForegroundColor Green
Write-Host "💡 Tip: Keep the backend and frontend terminal windows open.`n" -ForegroundColor Yellow

