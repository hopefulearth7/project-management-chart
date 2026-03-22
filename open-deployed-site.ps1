# 배포된 사이트 바로 접속 스크립트
# UTF-8 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== 배포된 사이트 접속 ===" -ForegroundColor Cyan

# 배포 URL
$frontendUrl = "https://project-management-frontend-ogk2.onrender.com"
$backendUrl = "https://project-management-backend-vn80.onrender.com"

Write-Host "`n프론트엔드 서버 상태 확인 중..." -ForegroundColor Yellow

# 백엔드 깨우기 (Cold Start 방지)
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -Method Get -TimeoutSec 30 -ErrorAction Stop
    Write-Host "✓ 백엔드 서버 활성화 완료" -ForegroundColor Green
} catch {
    Write-Host "⚠ 백엔드 서버 깨우는 중... (최대 50초 소요)" -ForegroundColor Yellow
    Write-Host "   (Render 무료 플랜은 15분 비활성 시 자동 정지됩니다)" -ForegroundColor Gray
}

Write-Host "`n브라우저를 엽니다..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# 프론트엔드 사이트 열기
Start-Process $frontendUrl

Write-Host "`n✓ 브라우저가 열렸습니다!" -ForegroundColor Green
Write-Host "`n배포된 사이트 URL:" -ForegroundColor Cyan
Write-Host "  프론트엔드: $frontendUrl" -ForegroundColor White
Write-Host "  백엔드 API: $backendUrl" -ForegroundColor White
Write-Host "`n참고: Render 무료 플랜은 15분 비활성 시 자동 정지됩니다." -ForegroundColor Yellow
Write-Host "      첫 접속 시 최대 50초 정도 걸릴 수 있습니다." -ForegroundColor Yellow


