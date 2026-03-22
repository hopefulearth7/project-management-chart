# 전체 API 엔드포인트 테스트 스크립트
# 모든 주요 API가 정상 작동하는지 확인

Write-Host "=== 프로젝트 관리 시스템 API 테스트 ===" -ForegroundColor Green
Write-Host ""

$BASE_URL = "http://localhost:3000"
$PASSED = 0
$FAILED = 0
$TESTS = @()

function Test-API {
    param(
        [string]$Name,
        [string]$Endpoint,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-Host "테스트: $Name" -ForegroundColor Cyan
    Write-Host "  $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
            TimeoutSec = 5
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✅ 성공" -ForegroundColor Green
        $script:PASSED++
        return $true
    }
    catch {
        Write-Host "  ❌ 실패: $($_.Exception.Message)" -ForegroundColor Red
        $script:FAILED++
        return $false
    }
    finally {
        Write-Host ""
    }
}

# 1. Health Check
Test-API -Name "Health Check" -Endpoint "/api/health"

# 2. Users API
Test-API -Name "사용자 목록 조회" -Endpoint "/api/users"
Test-API -Name "특정 사용자 조회" -Endpoint "/api/users/1"

# 3. Admin API
Test-API -Name "관리자 설정 조회" -Endpoint "/api/admin/settings"
Test-API -Name "관리자 요약 정보" -Endpoint "/api/admin/summary"
Test-API -Name "직급별 급여 정보" -Endpoint "/api/admin/role-salaries"
Test-API -Name "멤버 타임라인" -Endpoint "/api/admin/member-timeline"

# 4. Projects API
Test-API -Name "프로젝트 목록 조회" -Endpoint "/api/projects"
Test-API -Name "특정 프로젝트 조회" -Endpoint "/api/projects/1"

# 5. Roles & Salaries API
Test-API -Name "직급 목록 조회" -Endpoint "/api/roles"
Test-API -Name "급여 목록 조회" -Endpoint "/api/salaries"

# 6. WBS API
Test-API -Name "프로젝트 WBS 조회" -Endpoint "/api/projects/1/wbs"

# 7. Project Details
Test-API -Name "프로젝트 비용 조회" -Endpoint "/api/projects/1/costs"
Test-API -Name "프로젝트 멤버 조회" -Endpoint "/api/projects/1/members"
Test-API -Name "프로젝트 ROI 조회" -Endpoint "/api/projects/1/roi"

# 결과 요약
Write-Host "================================" -ForegroundColor Green
Write-Host "테스트 결과 요약" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ 성공: $PASSED" -ForegroundColor Green
Write-Host "❌ 실패: $FAILED" -ForegroundColor Red
Write-Host "총 테스트: $($PASSED + $FAILED)" -ForegroundColor Cyan
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "🎉 모든 테스트 통과!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  일부 테스트 실패" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "문제 해결 방법:" -ForegroundColor Yellow
    Write-Host "1. 백엔드 서버가 실행 중인지 확인: http://localhost:3000" -ForegroundColor White
    Write-Host "2. 데이터베이스 연결 확인: .\check-db.ps1" -ForegroundColor White
    Write-Host "3. 데이터가 있는지 확인: psql 접속 후 SELECT COUNT(*) FROM project;" -ForegroundColor White
    exit 1
}





