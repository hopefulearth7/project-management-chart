# 빠른 배포 가이드

## 현재 문제
404 에러는 백엔드 서버가 실행되지 않아서 발생합니다. 배포 전에 로컬에서 해결하거나, 바로 배포할 수 있습니다.

## 옵션 1: 로컬에서 빠르게 수정 (권장)

### 백엔드 서버 재시작
```powershell
# 방법 1: 스크립트 사용
.\quick-fix-backend.ps1

# 방법 2: 수동 실행
cd backend
node server.js
```

### 프론트엔드 서버 재시작 (새 터미널)
```powershell
cd frontend
npm run dev
```

## 옵션 2: 배포하기

### Vercel (프론트엔드) + Railway (백엔드)

#### 1. GitHub에 코드 푸시
```bash
git add .
git commit -m "프로젝트 관리 시스템 배포 준비"
git push origin main
```

#### 2. Vercel 배포 (프론트엔드)
1. [Vercel](https://vercel.com) 접속 및 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 설정:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
6. Deploy 클릭

#### 3. Railway 배포 (백엔드 + DB)
1. [Railway](https://railway.app) 접속 및 로그인
2. "New Project" > "Deploy from GitHub repo"
3. 저장소 선택
4. PostgreSQL 추가:
   - "New" > "Database" > "PostgreSQL"
5. 백엔드 서비스 추가:
   - "New" > "GitHub Repo"
   - 저장소 선택
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Environment Variables 설정:
   ```
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secret-key-here
   CORS_ORIGIN=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
7. Deploy 클릭

#### 4. 데이터베이스 초기화
Railway PostgreSQL에 접속하여:
```sql
-- schema.sql 실행
-- seed.sql 실행 (선택)
```

### Render (전체 스택 - 더 간단)

#### 1. 백엔드 배포
1. [Render](https://render.com) 접속 및 로그인
2. "New" > "Web Service"
3. GitHub 저장소 연결
4. 설정:
   - **Name**: project-manage-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Environment Variables:
   ```
   PORT=3000
   DATABASE_URL=<Render PostgreSQL URL>
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=https://your-frontend.onrender.com
   NODE_ENV=production
   ```

#### 2. PostgreSQL 데이터베이스
1. "New" > "PostgreSQL"
2. 데이터베이스 생성
3. DATABASE_URL을 백엔드 환경 변수에 추가

#### 3. 프론트엔드 배포
1. "New" > "Static Site"
2. GitHub 저장소 연결
3. 설정:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

## 배포 후 확인사항

1. ✅ 백엔드 API 엔드포인트 테스트
   - `https://your-backend-url/api/health`
   - `https://your-backend-url/api/admin/role-salaries`

2. ✅ 프론트엔드에서 백엔드 연결 확인
   - 브라우저 콘솔에서 404 에러가 사라졌는지 확인

3. ✅ 데이터베이스 초기화
   - schema.sql 실행
   - 필요한 경우 seed.sql 실행

## 빠른 해결 (로컬)

지금 바로 로컬에서 해결하려면:

```powershell
# 터미널 1: 백엔드
cd backend
node server.js

# 터미널 2: 프론트엔드  
cd frontend
npm run dev
```

또는 `.\start.ps1` 실행



