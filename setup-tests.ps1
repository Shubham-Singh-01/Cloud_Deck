# Quick Test Setup 

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Cloud-Deck Test Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Installing test dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install backend test dependencies
Set-Location backend
npm install --save-dev jest supertest

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Test dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Installation failed" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Make sure .env file has AWS credentials" -ForegroundColor White
Write-Host "3. Run: cd backend ; npm test" -ForegroundColor Cyan
Write-Host ""
