# Deploy changes script
# Commit and push all changes to trigger Render auto-deployment
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== Deploy Changes Script Started ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "Changed files:" -ForegroundColor Green
    git status --short
    Write-Host ""
    
    Write-Host "Changes summary:" -ForegroundColor Cyan
    Write-Host "  [OK] Backend: POST /api/roles API added" -ForegroundColor Green
    Write-Host "  [OK] Frontend: Admin page UI improved" -ForegroundColor Green
    Write-Host "  [OK] Frontend: Role creation feature added" -ForegroundColor Green
    Write-Host ""
    
    $commitMessage = Read-Host "Enter commit message (Enter: use default)"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $lines = @(
            "feat: Add role creation feature and improve UI",
            "",
            "- Backend: POST /api/roles API added",
            "- Frontend: Admin page UI improved",
            "- Frontend: Role creation feature added"
        )
        $commitMessage = $lines -join "`n"
    }
    
    Write-Host ""
    Write-Host "[2/5] Adding changes to Git..." -ForegroundColor Yellow
    git add .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Files added successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to add files" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "[3/5] Committing..." -ForegroundColor Yellow
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Commit completed" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Commit failed" -ForegroundColor Red
        exit 1
    }
    
    $currentBranch = git branch --show-current
    Write-Host ""
    Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
    
    Write-Host ""
    $confirmPush = Read-Host "Push to remote repository? (y/n)"
    
    if ($confirmPush -eq "y" -or $confirmPush -eq "Y") {
        Write-Host ""
        Write-Host "[4/5] Pushing to remote repository..." -ForegroundColor Yellow
        git push origin $currentBranch
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "[OK] Push completed!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "  1. Check deployment status on Render dashboard" -ForegroundColor White
            Write-Host "  2. Test site after deployment completes" -ForegroundColor White
            Write-Host "  3. Verify new role creation feature" -ForegroundColor White
            Write-Host ""
            Write-Host "Render dashboard: https://dashboard.render.com/" -ForegroundColor Cyan
            Write-Host ""
            
            $checkDeploy = Read-Host "Run deployment status check script? (y/n)"
            if ($checkDeploy -eq "y" -or $checkDeploy -eq "Y") {
                if (Test-Path "check-deployed-status.ps1") {
                    & .\check-deployed-status.ps1
                } else {
                    Write-Host "Deployment status check script not found." -ForegroundColor Yellow
                }
            }
            
            Write-Host ""
            Write-Host "[5/5] Done!" -ForegroundColor Cyan
        } else {
            Write-Host "[ERROR] Push failed" -ForegroundColor Red
            Write-Host "Please check remote repository settings." -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "[INFO] Push cancelled." -ForegroundColor Yellow
        Write-Host "You can push manually later using 'git push' command." -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] No files changed." -ForegroundColor Green
    Write-Host ""
    Write-Host "[INFO] All changes are already committed." -ForegroundColor Cyan
    Write-Host ""
    
    $currentBranch = git branch --show-current
    $hasUnpushedCommits = git log origin/$currentBranch..HEAD --oneline 2>$null
    
    if ($hasUnpushedCommits) {
        Write-Host "[INFO] Unpushed commits found:" -ForegroundColor Yellow
        git log origin/$currentBranch..HEAD --oneline
        Write-Host ""
        
        $pushNow = Read-Host "Push now? (y/n)"
        if ($pushNow -eq "y" -or $pushNow -eq "Y") {
            git push origin $currentBranch
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Push completed!" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] Push failed" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "[OK] All changes are already in remote repository." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[DONE] Script execution completed" -ForegroundColor Cyan


