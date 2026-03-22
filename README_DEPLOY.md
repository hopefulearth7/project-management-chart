# 배포 가이드 요약

## 현재 상황
404 에러는 백엔드 서버가 실행되지 않아서 발생합니다. 배포하면 해결됩니다.

## 빠른 배포 옵션

### 옵션 1: Render (가장 간단, 추천)
- **가이드**: `DEPLOY_RENDER.md` 참고
- **장점**: 무료 플랜 제공, 설정 간단
- **단점**: 15분 비활성 시 슬리프 모드

### 옵션 2: Vercel + Railway
- **가이드**: `DEPLOY_VERCEL_RAILWAY.md` 참고
- **장점**: Vercel은 프론트엔드 최적화, Railway는 백엔드 안정적
- **단점**: 두 서비스 설정 필요

### 옵션 3: Docker (로컬 또는 서버)
```bash
docker-compose up -d
```

## 배포 전 체크리스트

- [ ] GitHub에 코드 푸시 완료
- [ ] 환경 변수 준비 (DATABASE_URL, JWT_SECRET 등)
- [ ] 데이터베이스 스키마 초기화 계획
- [ ] CORS 설정 확인

## 배포 후 확인

1. 백엔드 API 테스트: `https://your-backend-url/api/health`
2. 프론트엔드 접속: `https://your-frontend-url`
3. 브라우저 콘솔에서 404 에러 확인

## 로컬에서 빠르게 수정 (배포 전 테스트)

```powershell
# 백엔드 서버 시작
.\quick-fix-backend.ps1

# 또는
cd backend
node server.js
```



