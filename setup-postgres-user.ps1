# PostgreSQL 사용자 설정 가이드
# UTF-8 encoding setup
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== PostgreSQL 사용자 설정 ===" -ForegroundColor Cyan
Write-Host "`nPostgreSQL에 접속하여 사용자를 생성해야 합니다." -ForegroundColor Yellow
Write-Host "`n방법 1: psql 명령어 사용" -ForegroundColor Green
Write-Host "1. PowerShell에서 다음 명령어 실행:" -ForegroundColor White
Write-Host "   psql -U postgres" -ForegroundColor Gray
Write-Host "2. 비밀번호 입력 후 다음 SQL 실행:" -ForegroundColor White
Write-Host "   CREATE USER hopefulearth WITH PASSWORD 'test316';" -ForegroundColor Gray
Write-Host "   CREATE DATABASE project_management;" -ForegroundColor Gray
Write-Host "   GRANT ALL PRIVILEGES ON DATABASE project_management TO hopefulearth;" -ForegroundColor Gray
Write-Host "   \q" -ForegroundColor Gray

Write-Host "`n방법 2: SQL 파일 실행" -ForegroundColor Green
Write-Host "1. database\create-user.sql 파일을 확인하세요" -ForegroundColor White
Write-Host "2. psql -U postgres -f database\create-user.sql" -ForegroundColor Gray

Write-Host "`n방법 3: pgAdmin 사용" -ForegroundColor Green
Write-Host "1. pgAdmin 실행" -ForegroundColor White
Write-Host "2. 서버에 연결 (postgres 사용자)" -ForegroundColor White
Write-Host "3. 데이터베이스 > 우클릭 > Create > Database" -ForegroundColor White
Write-Host "   이름: project_management" -ForegroundColor Gray
Write-Host "4. Login/Group Roles > 우클릭 > Create > Login/Group Role" -ForegroundColor White
Write-Host "   이름: hopefulearth" -ForegroundColor Gray
Write-Host "   비밀번호: test316" -ForegroundColor Gray

Write-Host "`n사용자 생성 후 다시 실행:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  node init-db.js" -ForegroundColor White



