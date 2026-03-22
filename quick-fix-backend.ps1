# 백엔드 서버 빠른 수정 스크립트
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== 백엔드 서버 빠른 수정 ===" -ForegroundColor Cyan

# 포트 3000 사용 중인 프로세스 종료
$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    Write-Host "기존 백엔드 서버 종료 중..." -ForegroundColor Yellow
    foreach ($pid in $pids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# 백엔드 디렉토리로 이동
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"
Set-Location $backendPath

# 환경 변수 로드
if (Test-Path "..\.env") {
    Get-Content "..\.env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*?)\s*$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($value -match '^["''](.*)["'']$') {
                $value = $matches[1]
            }
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

Write-Host "`n백엔드 서버 시작 중..." -ForegroundColor Green
Write-Host "포트: 3000" -ForegroundColor Gray
Write-Host "종료: Ctrl+C`n" -ForegroundColor Gray

# 서버 시작
node server.js



