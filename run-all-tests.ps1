# Run All Tests

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Running Tests" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

Write-Host "Running tests..." -ForegroundColor Yellow
Write-Host ""

npm test

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "  ALL TESTS PASSED! ✓" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your application is tested and working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "What this proves:" -ForegroundColor Yellow
    Write-Host "✓ Authentication works (JWT)" -ForegroundColor Green
    Write-Host "✓ File upload works (AWS S3)" -ForegroundColor Green
    Write-Host "✓ APIs are functional" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "  SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above" -ForegroundColor Yellow
}

Set-Location ..
Write-Host ""
