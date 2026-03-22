# 프로젝트 관리 웹사이트 시작 스크립트
# UTF-8 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
$env:PYTHONIOENCODING = "utf-8"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "=== 프로젝트 관리 웹사이트 시작 ===" -ForegroundColor Cyan
Write-Host "프로젝트 루트: $scriptPath" -ForegroundColor Gray

# Backend 시작
Write-Host "`n[1/2] Backend 서버 시작 중..." -ForegroundColor Yellow
$backendScript = Join-Path $scriptPath "start-backend-window.ps1"
if (Test-Path $backendScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScript`""
} else {
    Write-Host "오류: start-backend-window.ps1 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# 잠시 대기
Start-Sleep -Seconds 3

# Frontend 시작
Write-Host "[2/2] Frontend 서버 시작 중..." -ForegroundColor Yellow
$frontendScript = Join-Path $scriptPath "start-frontend-window.ps1"
if (Test-Path $frontendScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$frontendScript`""
} else {
    Write-Host "오류: start-frontend-window.ps1 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ 서버 시작 완료!" -ForegroundColor Green
Write-Host "`n접속 주소:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White

# 브라우저 자동 열기 (5초 후)
Write-Host "`n브라우저를 5초 후에 자동으로 엽니다..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Frontend 서버가 준비될 때까지 대기
$maxAttempts = 30
$attempt = 0
$url = "http://localhost:5173"

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ 서버 준비 완료! 브라우저를 엽니다..." -ForegroundColor Green
            Start-Process $url
            break
        }
    } catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "서버 대기 중... ($attempt/$maxAttempts)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        } else {
            Write-Host "서버가 아직 준비되지 않았습니다. 수동으로 브라우저를 열어주세요." -ForegroundColor Yellow
            Write-Host "URL: $url" -ForegroundColor Cyan
            Start-Process $url
        }
    }
}

