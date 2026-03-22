# 배포 가이드

## 배포 옵션

### 1. Vercel (프론트엔드) + Railway/Render (백엔드 + DB)

#### 프론트엔드 배포 (Vercel)
1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 프로젝트 설정:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### 백엔드 배포 (Railway)
1. [Railway](https://railway.app)에 가입
2. New Project > Deploy from GitHub
3. 환경 변수 설정:
   ```
   PORT=3000
   DATABASE_URL=<Railway PostgreSQL URL>
   JWT_SECRET=<랜덤 문자열>
   CORS_ORIGIN=<Vercel 배포 URL>
   NODE_ENV=production
   ```
4. PostgreSQL 추가 (Railway에서 제공)

### 2. Render (전체 스택)

#### 백엔드
1. [Render](https://render.com)에 가입
2. New > Web Service
3. GitHub 저장소 연결
4. 설정:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables 추가

#### 프론트엔드
1. New > Static Site
2. GitHub 저장소 연결
3. 설정:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`

### 3. Docker 배포

#### Dockerfile 생성 필요
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`

## 빠른 해결: 로컬 서버 재시작

배포 전에 로컬에서 문제를 해결하는 것이 좋습니다:

```powershell
# 1. 백엔드 서버 재시작
cd backend
node server.js

# 2. 프론트엔드 서버 재시작 (새 터미널)
cd frontend
npm run dev
```

또는 `.\start.ps1` 스크립트 실행



