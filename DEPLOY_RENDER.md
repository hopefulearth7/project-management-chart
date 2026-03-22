# Render 배포 가이드 (가장 간단)

## 1단계: GitHub에 코드 푸시

```bash
git add .
git commit -m "배포 준비 완료"
git push origin main
```

## 2단계: PostgreSQL 데이터베이스 생성

1. [Render](https://render.com) 접속 및 로그인
2. "New" > "PostgreSQL" 클릭
3. 설정:
   - **Name**: project-management-db
   - **Database**: project_management
   - **User**: postgres (또는 원하는 이름)
   - **Region**: 가장 가까운 지역 선택
4. "Create Database" 클릭
5. 생성 후 "Connections" 탭에서 "Internal Database URL" 복사

## 3단계: 백엔드 배포

1. "New" > "Web Service" 클릭
2. GitHub 저장소 연결
3. 설정:
   - **Name**: project-management-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Environment Variables 추가:
   ```
   PORT=3000
   DATABASE_URL=<PostgreSQL Internal Database URL>
   JWT_SECRET=your-secret-key-change-this
   CORS_ORIGIN=https://your-frontend.onrender.com
   NODE_ENV=production
   ```
5. "Create Web Service" 클릭
6. 배포 완료 후 URL 확인 (예: `https://project-management-backend.onrender.com`)

## 4단계: 데이터베이스 초기화

1. Render PostgreSQL에 접속 (Render 대시보드에서 "Postgres" > "Connect" > "psql" 사용)
2. 또는 Render Shell 사용:
   - "Postgres" > "Connect" > "Shell" 클릭
   - `psql <DATABASE_URL>` 실행
3. `database/schema.sql` 내용 실행
4. (선택) `database/seed.sql` 실행

## 5단계: 프론트엔드 배포

1. "New" > "Static Site" 클릭
2. GitHub 저장소 연결
3. 설정:
   - **Name**: project-management-frontend
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables 추가:
   ```
   VITE_API_URL=https://project-management-backend.onrender.com
   ```
5. "Create Static Site" 클릭
6. 배포 완료 후 URL 확인 (예: `https://project-management-frontend.onrender.com`)

## 6단계: CORS 설정 업데이트

백엔드 환경 변수에서:
```
CORS_ORIGIN=https://project-management-frontend.onrender.com
```
로 업데이트하고 재배포

## 완료!

이제 `https://project-management-frontend.onrender.com`에서 접속하면 정상 작동합니다.

## 참고사항

- Render 무료 플랜은 15분 비활성 후 슬리프 모드로 전환됩니다 (첫 요청 시 느릴 수 있음)
- 프로덕션 환경에서는 유료 플랜 사용 권장



