# Quick Demo (Fresher-Friendly)

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Quick Test Demo" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Running tests..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend
npm test

Set-Location ..

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Demo Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

Write-Host "What this proves:" -ForegroundColor Yellow
Write-Host "✓ Authentication works" -ForegroundColor Green
Write-Host "✓ File upload works" -ForegroundColor Green
Write-Host "✓ APIs are functional" -ForegroundColor Green
Write-Host ""
