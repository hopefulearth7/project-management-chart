$backendUrl = "https://project-management-backend-vn80.onrender.com"

Write-Host "`n=== API 테스트 ===" -ForegroundColor Cyan

# 1. 프로젝트 목록 확인
Write-Host "`n[1] 프로젝트 목록 조회..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/projects" -Method Get -TimeoutSec 30
    Write-Host "프로젝트 개수: $($response.Count)" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "첫 번째 프로젝트: $($response[0].name)" -ForegroundColor White
    }
} catch {
    Write-Host "실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 직급 목록 확인
Write-Host "`n[2] 직급 목록 조회..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/roles" -Method Get -TimeoutSec 30
    Write-Host "직급 개수: $($response.Count)" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "첫 번째 직급: $($response[0].name) (레벨: $($response[0].level))" -ForegroundColor White
    }
} catch {
    Write-Host "실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 프로젝트 생성 테스트
Write-Host "`n[3] 프로젝트 생성 테스트..." -ForegroundColor Yellow
$projectData = @{
    name = "테스트 프로젝트"
    description = "API 테스트용 프로젝트"
    start_date = "2024-01-01"
    end_date = "2024-12-31"
    status = "planning"
    expected_gain = 10000000
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/projects" -Method Post -Body $projectData -ContentType "application/json" -TimeoutSec 30
    Write-Host "프로젝트 생성 성공! ID: $($response.id), 이름: $($response.name)" -ForegroundColor Green
} catch {
    Write-Host "실패: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "응답: $responseBody" -ForegroundColor Gray
    }
}

Write-Host "`n=== 테스트 완료 ===" -ForegroundColor Cyan
Write-Host "`n브라우저에서 확인: https://project-management-frontend-ogk2.onrender.com" -ForegroundColor White
