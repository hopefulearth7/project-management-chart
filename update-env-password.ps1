# .env 파일의 DATABASE_URL 비밀번호 업데이트 스크립트
# UTF-8 encoding setup
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $scriptPath ".env"

Write-Host "=== .env DATABASE_URL 비밀번호 업데이트 ===" -ForegroundColor Cyan

# 현재 .env 파일 읽기
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    Write-Host "`n현재 DATABASE_URL:" -ForegroundColor Yellow
    if ($content -match 'DATABASE_URL=(.+)') {
        Write-Host $matches[1] -ForegroundColor Gray
    }
} else {
    Write-Host "❌ .env 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host "`nPostgreSQL postgres 사용자의 비밀번호를 입력하세요:" -ForegroundColor Yellow
$password = Read-Host "비밀번호"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "❌ 비밀번호가 입력되지 않았습니다." -ForegroundColor Red
    exit 1
}

# DATABASE_URL 업데이트
$newContent = $content -replace 'DATABASE_URL=.*', "DATABASE_URL=postgresql://postgres:$password@localhost:5432/project_management"

[System.IO.File]::WriteAllText($envFile, $newContent, [System.Text.Encoding]::UTF8)

Write-Host "`n✅ .env 파일이 업데이트되었습니다!" -ForegroundColor Green
Write-Host "`n이제 다음 명령어로 데이터베이스를 초기화하세요:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  node init-db.js" -ForegroundColor White



