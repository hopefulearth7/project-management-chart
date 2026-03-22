# Vercel + Railway 배포 가이드

## 1단계: GitHub에 코드 푸시

```bash
git add .
git commit -m "배포 준비 완료"
git push origin main
```

## 2단계: Railway에 백엔드 배포

### PostgreSQL 데이터베이스 생성
1. [Railway](https://railway.app) 접속 및 로그인
2. "New Project" 클릭
3. "Database" > "Add PostgreSQL" 선택
4. 데이터베이스가 생성되면 "Variables" 탭에서 `DATABASE_URL` 확인

### 백엔드 서비스 배포
1. 같은 프로젝트에서 "New" > "GitHub Repo" 선택
2. 저장소 선택
3. 설정:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. "Variables" 탭에서 환경 변수 추가:
   ```
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secret-key-change-this
   CORS_ORIGIN=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
5. "Deploy" 클릭
6. 배포 완료 후 "Settings" > "Generate Domain"으로 URL 확인 (예: `https://your-backend.railway.app`)

### 데이터베이스 초기화
1. Railway PostgreSQL에 접속 (Railway 대시보드에서 "Postgres" > "Query" 클릭)
2. `database/schema.sql` 내용 실행
3. (선택) `database/seed.sql` 실행

## 3단계: Vercel에 프론트엔드 배포

1. [Vercel](https://vercel.com) 접속 및 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Environment Variables 추가:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
6. "Deploy" 클릭
7. 배포 완료 후 URL 확인 (예: `https://your-frontend.vercel.app`)

## 4단계: CORS 설정 업데이트

Railway 백엔드의 환경 변수에서:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```
로 업데이트하고 재배포

## 5단계: 프론트엔드 API URL 업데이트

Vercel 프론트엔드의 환경 변수에서:
```
VITE_API_URL=https://your-backend.railway.app
```
로 업데이트하고 재배포

## 완료!

이제 `https://your-frontend.vercel.app`에서 접속하면 정상 작동합니다.



