# UTF-8 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "`n=== 백엔드 서버 재시작 ===" -ForegroundColor Cyan

# 포트 3000 사용 중인 프로세스 종료
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    Write-Host "포트 3000 사용 중인 프로세스 종료 중..." -ForegroundColor Yellow
    foreach ($pid in $processes) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# 백엔드 디렉토리로 이동
Set-Location "$PSScriptRoot\backend"

# 환경 변수 로드
if (Test-Path "..\.env") {
    Get-Content "..\.env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*?)\s*$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            # 따옴표 제거
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
