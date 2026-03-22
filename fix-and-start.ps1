# 문제 해결 및 서버 시작
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "`n=== 문제 해결 및 서버 시작 ===" -ForegroundColor Cyan

# 1. 모든 백엔드 프로세스 종료
Write-Host "`n[1/4] 기존 프로세스 정리 중..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($procId in $processes) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}
Write-Host "정리 완료" -ForegroundColor Green

# 2. 데이터베이스 연결 테스트
Write-Host "`n[2/4] 데이터베이스 연결 테스트..." -ForegroundColor Yellow
Set-Location "$scriptPath\backend"
node test-server.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "데이터베이스 연결 실패! .env 파일을 확인하세요." -ForegroundColor Red
    exit 1
}

# 3. 백엔드 서버 시작
Write-Host "`n[3/4] 백엔드 서버 시작 중..." -ForegroundColor Yellow
$backendScript = Join-Path $scriptPath "start-backend-window.ps1"
if (Test-Path $backendScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScript`""
    Start-Sleep -Seconds 3
    Write-Host "백엔드 서버 시작됨" -ForegroundColor Green
} else {
    Write-Host "백엔드 스크립트를 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# 4. 서버 상태 확인
Write-Host "`n[4/4] 서버 상태 확인 중..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 백엔드 서버 정상 실행 중!" -ForegroundColor Green
        Write-Host "응답: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  서버가 아직 준비되지 않았습니다. 잠시 후 다시 시도하세요." -ForegroundColor Yellow
    Write-Host "에러: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 완료 ===" -ForegroundColor Cyan
Write-Host "백엔드: http://localhost:3000" -ForegroundColor White
Write-Host "프론트엔드: http://localhost:5173" -ForegroundColor White



