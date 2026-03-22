# 배포 가이드

## 빠른 배포 (Render 사용 - 가장 간단)

상세 가이드는 `DEPLOY_SIMPLE.md` 파일을 참고하세요.

### 요약

1. **GitHub에 코드 푸시**
   ```bash
   git init
   git add .
   git commit -m "배포 준비"
   git remote add origin <YOUR_GITHUB_REPO>
   git push -u origin main
   ```

2. **Render에서 PostgreSQL 데이터베이스 생성**

3. **Render에서 백엔드 배포**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - 환경 변수: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`

4. **데이터베이스 초기화**
   - Render PostgreSQL Query에서 `database/schema.sql` 실행

5. **Render에서 프론트엔드 배포**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - 환경 변수: `VITE_API_URL`

6. **CORS 설정 업데이트**
   - 백엔드의 `CORS_ORIGIN`을 프론트엔드 URL로 설정

## 다른 배포 옵션

- **Vercel + Railway**: `DEPLOY_VERCEL_RAILWAY.md` 참고
- **Docker**: `docker-compose.yml` 사용

## 필수 환경 변수

### Backend
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 토큰 암호화 키 (랜덤 문자열)
- `CORS_ORIGIN`: 프론트엔드 URL
- `NODE_ENV`: production
- `PORT`: 3000 (기본값)

### Frontend
- `VITE_API_URL`: 백엔드 API URL

