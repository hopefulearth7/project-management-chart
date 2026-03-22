# 백엔드 서버 상태 확인 및 자동 재시작 스크립트
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== 백엔드 서버 상태 확인 ===" -ForegroundColor Cyan

# 포트 3000 사용 중인 프로세스 확인
$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    Write-Host "✅ 포트 3000 사용 중인 프로세스 발견:" -ForegroundColor Green
    foreach ($pid in $pids) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "  - PID: $pid, 이름: $($process.ProcessName)" -ForegroundColor Gray
        }
    }
    
    # API 테스트
    Write-Host "`nAPI 엔드포인트 테스트 중..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ 백엔드 서버 정상 작동 중! (Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Admin API 테스트
        try {
            $adminResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/role-salaries" -Method Get -TimeoutSec 3 -ErrorAction Stop
            Write-Host "✅ Admin API 엔드포인트 정상 작동 중!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Admin API 엔드포인트 오류: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ 백엔드 서버가 응답하지 않습니다: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "백엔드 서버를 재시작해야 합니다." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ 포트 3000을 사용하는 프로세스가 없습니다." -ForegroundColor Red
    Write-Host "백엔드 서버를 시작해야 합니다." -ForegroundColor Yellow
}

Write-Host "`n백엔드 서버를 재시작하시겠습니까? (Y/N)" -ForegroundColor Cyan
$answer = Read-Host
if ($answer -eq 'Y' -or $answer -eq 'y') {
    Write-Host "`n백엔드 서버 재시작 중..." -ForegroundColor Yellow
    
    # 기존 프로세스 종료
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
    
    # 백엔드 서버 시작
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    $backendScript = Join-Path $scriptPath "start-backend-window.ps1"
    if (Test-Path $backendScript) {
        Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScript`""
        Write-Host "✅ 백엔드 서버 시작 완료!" -ForegroundColor Green
    } else {
        Write-Host "❌ start-backend-window.ps1 파일을 찾을 수 없습니다." -ForegroundColor Red
    }
}



