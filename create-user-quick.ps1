# PostgreSQL 사용자 생성 (빠른 방법)
# UTF-8 encoding setup
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== PostgreSQL 사용자 생성 ===" -ForegroundColor Cyan
Write-Host "`npostgres 사용자로 접속하여 hopefulearth 사용자를 생성합니다." -ForegroundColor Yellow
Write-Host "`npostgres 사용자의 비밀번호를 입력하세요:" -ForegroundColor Yellow
$postgresPassword = Read-Host "비밀번호"

if ([string]::IsNullOrWhiteSpace($postgresPassword)) {
    Write-Host "❌ 비밀번호가 입력되지 않았습니다." -ForegroundColor Red
    exit 1
}

# SQL 명령어 생성
$sqlCommands = @"
CREATE USER hopefulearth WITH PASSWORD '0316';
CREATE DATABASE project_management;
GRANT ALL PRIVILEGES ON DATABASE project_management TO hopefulearth;
"@

# 임시 SQL 파일 생성
$tempSqlFile = Join-Path $env:TEMP "create_user_$(Get-Date -Format 'yyyyMMddHHmmss').sql"
$sqlCommands | Out-File -FilePath $tempSqlFile -Encoding UTF8

Write-Host "`n사용자 생성 중..." -ForegroundColor Yellow
$env:PGPASSWORD = $postgresPassword

# psql로 실행
$result = & psql -U postgres -f $tempSqlFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ 사용자 생성 완료!" -ForegroundColor Green
    Write-Host "  - 사용자: hopefulearth" -ForegroundColor White
    Write-Host "  - 비밀번호: 0316" -ForegroundColor White
    Write-Host "  - 데이터베이스: project_management" -ForegroundColor White
} else {
    Write-Host "`n⚠️  오류 발생 (이미 존재할 수 있음):" -ForegroundColor Yellow
    Write-Host $result -ForegroundColor Gray
}

# 임시 파일 삭제
Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
$env:PGPASSWORD = $null

Write-Host "`n이제 데이터베이스 초기화를 실행하세요:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  node init-db.js" -ForegroundColor White



