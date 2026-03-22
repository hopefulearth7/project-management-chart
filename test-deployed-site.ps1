$backendUrl = "https://project-management-backend-vn80.onrender.com"
$frontendUrl = "https://project-management-frontend-ogk2.onrender.com"

Write-Host "=== Deployed Site Test ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Backend Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -Method Get -TimeoutSec 60 -UseBasicParsing
    Write-Host "OK: Backend server is running" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "FAIL: Backend server connection failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

Write-Host "[2/4] Frontend Status Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method Get -TimeoutSec 60 -UseBasicParsing
    Write-Host "OK: Frontend server is running" -ForegroundColor Green
} catch {
    Write-Host "FAIL: Frontend server connection failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

Write-Host "[3/4] Admin Settings API Test..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/admin/settings" -Method Get -TimeoutSec 60
    Write-Host "OK: Admin settings API is working" -ForegroundColor Green
    Write-Host "Settings: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 200 -or $statusCode -eq 404) {
        Write-Host "OK: Admin settings API responded (expected)" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Admin settings API error: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""

Write-Host "[4/4] Admin Verify Code API Test..." -ForegroundColor Yellow
try {
    $body = @{
        code = "test"
        company_name = "test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$backendUrl/api/admin/verify-code" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 60
    Write-Host "OK: Admin verify code API is working" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 200 -or $statusCode -eq 400) {
        Write-Host "OK: Admin verify code API responded (expected)" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Admin verify code API error: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: $frontendUrl" -ForegroundColor White
Write-Host "Backend: $backendUrl" -ForegroundColor White
