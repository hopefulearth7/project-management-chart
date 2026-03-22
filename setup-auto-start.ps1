# Windows 자동 시작 설정 스크립트 (관리자 권한 필요)
# UTF-8 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# 관리자 권한 확인
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "=== 관리자 권한이 필요합니다 ===" -ForegroundColor Yellow
    Write-Host "이 스크립트를 관리자 권한으로 다시 실행해주세요." -ForegroundColor Yellow
    Write-Host "`n방법: PowerShell을 우클릭 > '관리자 권한으로 실행'" -ForegroundColor Cyan
    
    # 관리자 권한으로 재실행
    $scriptPath = $MyInvocation.MyCommand.Path
    Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-File", "`"$scriptPath`""
    exit
}

Write-Host "=== Windows 자동 시작 설정 ===" -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$startScript = Join-Path $scriptPath "start.ps1"

# 시작 스크립트 경로 확인
if (-not (Test-Path $startScript)) {
    Write-Host "오류: start.ps1 파일을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "경로: $startScript" -ForegroundColor Yellow
    pause
    exit 1
}

# 작업 스케줄러 작업 이름
$taskName = "ProjectManageAutoStart"
$taskDescription = "프로젝트 관리 웹사이트 자동 시작"

# 기존 작업 제거 (있다면)
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "기존 작업 제거 중..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# 작업 스케줄러 작업 생성
Write-Host "작업 스케줄러에 등록 중..." -ForegroundColor Yellow

$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$startScript`"" -WorkingDirectory $scriptPath
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description $taskDescription -Force | Out-Null

Write-Host "`n✓ 자동 시작 설정 완료!" -ForegroundColor Green
Write-Host "`n설정 내용:" -ForegroundColor Cyan
Write-Host "  작업 이름: $taskName" -ForegroundColor White
Write-Host "  실행 시점: Windows 로그인 시" -ForegroundColor White
Write-Host "  실행 스크립트: $startScript" -ForegroundColor White

Write-Host "`n작업 관리자에서 확인:" -ForegroundColor Yellow
Write-Host "  작업 스케줄러 > 작업 스케줄러 라이브러리 > $taskName" -ForegroundColor Gray

Write-Host "`n자동 시작을 해제하려면:" -ForegroundColor Yellow
Write-Host "  작업 스케줄러에서 '$taskName' 작업을 삭제하거나" -ForegroundColor Gray
Write-Host "  또는 PowerShell에서 다음 명령 실행:" -ForegroundColor Gray
Write-Host "  Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor White

Write-Host "`n⚠ 참고:" -ForegroundColor Yellow
Write-Host "  이 작업은 현재 사용자로만 실행됩니다." -ForegroundColor Gray
Write-Host "  다른 사용자 계정에서는 실행되지 않습니다." -ForegroundColor Gray

pause


