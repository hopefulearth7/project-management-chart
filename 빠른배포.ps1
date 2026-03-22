# 프로젝트 관리 시스템 - 빠른 배포 헬퍼 스크립트
# 데이터베이스 SQL 파일들을 하나로 합쳐서 쉽게 복사할 수 있게 해줍니다

Write-Host "=== 프로젝트 관리 시스템 배포 헬퍼 ===" -ForegroundColor Green
Write-Host ""

$PROJECT_ROOT = $PSScriptRoot

# 1. SQL 파일 통합
Write-Host "[1/3] SQL 파일 통합 중..." -ForegroundColor Cyan

$combinedSQL = @"
-- ========================================
-- 프로젝트 관리 시스템 - 통합 DB 초기화
-- 생성일: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- ========================================

-- 1. 기본 스키마 생성
"@

# schema.sql 추가
if (Test-Path "$PROJECT_ROOT\database\schema.sql") {
    $schemaContent = Get-Content "$PROJECT_ROOT\database\schema.sql" -Raw
    $combinedSQL += "`n`n-- === SCHEMA.SQL ===`n"
    $combinedSQL += $schemaContent
}

# update-complete-schema.sql 추가
if (Test-Path "$PROJECT_ROOT\database\update-complete-schema.sql") {
    $updateContent = Get-Content "$PROJECT_ROOT\database\update-complete-schema.sql" -Raw
    $combinedSQL += "`n`n-- === UPDATE COMPLETE SCHEMA ===`n"
    $combinedSQL += $updateContent
}

# seed.sql 추가
if (Test-Path "$PROJECT_ROOT\database\seed.sql") {
    $seedContent = Get-Content "$PROJECT_ROOT\database\seed.sql" -Raw
    $combinedSQL += "`n`n-- === SEED DATA ===`n"
    $combinedSQL += $seedContent
}

# 통합 파일 저장
$outputFile = "$PROJECT_ROOT\database\deploy-complete.sql"
$combinedSQL | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "✅ SQL 파일 통합 완료: database\deploy-complete.sql" -ForegroundColor Green
Write-Host ""

# 2. 배포 정보 출력
Write-Host "[2/3] 배포 정보" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📦 백엔드 URL:" -ForegroundColor Yellow
Write-Host "   https://project-management-backend-vn80.onrender.com" -ForegroundColor White
Write-Host ""
Write-Host "🗄️  데이터베이스:" -ForegroundColor Yellow
Write-Host "   Host: dpg-d5hkg924d50c7394v05g-a" -ForegroundColor White
Write-Host "   Database: project_management_jgvj" -ForegroundColor White
Write-Host ""
Write-Host "🌐 프론트엔드 환경 변수:" -ForegroundColor Yellow
Write-Host "   VITE_API_URL=https://project-management-backend-vn80.onrender.com" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 3. 다음 단계 안내
Write-Host "[3/3] 다음 단계" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  프론트엔드 배포:" -ForegroundColor Yellow
Write-Host "    → https://dashboard.render.com/" -ForegroundColor Cyan
Write-Host "    → New + → Static Site" -ForegroundColor White
Write-Host "    → Root Directory: frontend" -ForegroundColor White
Write-Host "    → Build: npm install && npm run build" -ForegroundColor White
Write-Host "    → Publish: dist" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  데이터베이스 초기화:" -ForegroundColor Yellow
Write-Host "    → Render Dashboard → PostgreSQL → Query" -ForegroundColor Cyan
Write-Host "    → database\deploy-complete.sql 내용 복사하여 실행" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  CORS 설정:" -ForegroundColor Yellow
Write-Host "    → Backend Environment → CORS_ORIGIN 업데이트" -ForegroundColor Cyan
Write-Host "    → 프론트엔드 URL 입력 후 Save" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ 준비 완료! 위 단계대로 진행하세요." -ForegroundColor Green
Write-Host ""
Write-Host "💡 상세 가이드: 배포_체크리스트.md" -ForegroundColor Cyan
Write-Host ""

# 파일 탐색기에서 deploy-complete.sql 열기
Write-Host "📄 deploy-complete.sql 파일을 열겠습니다..." -ForegroundColor Gray
Start-Sleep -Seconds 1
notepad $outputFile





