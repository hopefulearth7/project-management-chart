# 배포된 사이트 상태 확인 스크립트
# UTF-8 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== 배포된 사이트 상태 확인 ===" -ForegroundColor Cyan
Write-Host ""

$frontendUrl = "https://project-management-frontend-ogk2.onrender.com"
$backendUrl = "https://project-management-backend-vn80.onrender.com"

# 백엔드 상태 확인
Write-Host "[1/2] 백엔드 서버 확인 중..." -ForegroundColor Yellow
try {
    $startTime = Get-Date
    $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -Method Get -TimeoutSec 60 -ErrorAction Stop
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ 백엔드 서버: 정상 작동 중" -ForegroundColor Green
        Write-Host "  응답 시간: $([math]::Round($duration, 2))초" -ForegroundColor Gray
        if ($duration -gt 10) {
            Write-Host "  ⚠ Cold Start 상태였습니다 (서버가 깨어나고 있었음)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ 백엔드 서버: 연결 실패" -ForegroundColor Red
    Write-Host "  오류: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "  가능한 원인:" -ForegroundColor Yellow
    Write-Host "    - 서버가 정지 상태 (15분 비활성)" -ForegroundColor Gray
    Write-Host "    - 네트워크 연결 문제" -ForegroundColor Gray
    Write-Host "    - Render 서비스 문제" -ForegroundColor Gray
}

Write-Host ""

# 프론트엔드 상태 확인
Write-Host "[2/2] 프론트엔드 서버 확인 중..." -ForegroundColor Yellow
try {
    $startTime = Get-Date
    $response = Invoke-WebRequest -Uri $frontendUrl -Method Get -TimeoutSec 60 -ErrorAction Stop
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ 프론트엔드 서버: 정상 작동 중" -ForegroundColor Green
        Write-Host "  응답 시간: $([math]::Round($duration, 2))초" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ 프론트엔드 서버: 연결 실패" -ForegroundColor Red
    Write-Host "  오류: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== 접속 정보 ===" -ForegroundColor Cyan
Write-Host "프론트엔드: $frontendUrl" -ForegroundColor White
Write-Host "백엔드 API: $backendUrl" -ForegroundColor White

Write-Host ""
Write-Host "=== 빠른 접속 ===" -ForegroundColor Cyan
Write-Host "배포된 사이트 열기: .\open-deployed-site.ps1" -ForegroundColor Yellow
Write-Host "로컬 서버 시작: .\start.ps1" -ForegroundColor Yellow


