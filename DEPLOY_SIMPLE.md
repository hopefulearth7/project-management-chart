# 간단한 배포 가이드 (Render 사용 - 추천)

## 사전 준비

1. GitHub 저장소 생성 및 푸시
2. Render 계정 가입 (https://render.com)

## 1단계: GitHub에 코드 푸시

```powershell
# Git 저장소가 아직 없다면
git init
git add .
git commit -m "프로젝트 관리 시스템 배포 준비"

# GitHub에 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## 2단계: Render에서 PostgreSQL 데이터베이스 생성

1. [Render](https://render.com) 접속 및 로그인
2. "New" > "PostgreSQL" 클릭
3. 설정:
   - **Name**: project-management-db
   - **Database**: project_management
   - **User**: postgres
   - **Region**: Singapore (또는 가장 가까운 지역)
4. "Create Database" 클릭
5. 생성 후 "Connections" 탭에서 "Internal Database URL" 복사 (나중에 사용)

## 3단계: 백엔드 배포

1. Render 대시보드에서 "New" > "Web Service" 클릭
2. GitHub 저장소 연결 (연결 권한 허용)
3. 저장소 선택 및 설정:
   - **Name**: project-management-backend
   - **Region**: Singapore (또는 데이터베이스와 같은 지역)
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. "Advanced" 섹션에서 Environment Variables 추가:
   ```
   PORT=3000
   DATABASE_URL=<위에서 복사한 PostgreSQL Internal Database URL>
   JWT_SECRET=<랜덤 문자열 생성, 예: openssl rand -hex 32>
   CORS_ORIGIN=https://project-management-frontend.onrender.com
   NODE_ENV=production
   ```
5. "Create Web Service" 클릭
6. 배포 완료 후 URL 확인 (예: `https://project-management-backend.onrender.com`)

## 4단계: 데이터베이스 초기화

### 방법 1: Render PostgreSQL Query 사용 (권장)
1. Render 대시보드에서 PostgreSQL > "Connect" > "psql" 클릭
2. 또는 "Query" 탭에서 직접 SQL 실행
3. `database/schema.sql` 내용 복사하여 실행
4. (선택) `database/seed.sql` 실행

### 방법 2: 로컬에서 연결
```bash
# Render PostgreSQL의 External Database URL 사용
psql <EXTERNAL_DATABASE_URL>
\i database/schema.sql
```

## 5단계: 프론트엔드 배포

1. Render 대시보드에서 "New" > "Static Site" 클릭
2. GitHub 저장소 연결
3. 설정:
   - **Name**: project-management-frontend
   - **Branch**: main
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables 추가:
   ```
   VITE_API_URL=https://project-management-backend.onrender.com
   ```
   (백엔드 URL은 3단계에서 확인한 URL 사용)
5. "Create Static Site" 클릭
6. 배포 완료 후 URL 확인 (예: `https://project-management-frontend.onrender.com`)

## 6단계: CORS 설정 업데이트

1. Render 대시보드에서 백엔드 서비스 선택
2. "Environment" 탭으로 이동
3. `CORS_ORIGIN` 변수를 프론트엔드 URL로 업데이트:
   ```
   CORS_ORIGIN=https://project-management-frontend.onrender.com
   ```
4. "Save Changes" 클릭 (자동 재배포됨)

## 7단계: 최종 확인

1. 프론트엔드 URL 접속: `https://project-management-frontend.onrender.com`
2. 브라우저 콘솔에서 에러 확인
3. 관리자 페이지 접속 및 설정 코드 입력
4. 프로젝트 생성 및 테스트

## 완료!

이제 프로젝트 관리 시스템이 배포되었습니다!

## 참고사항

### Render 무료 플랜 제한
- 15분 비활성 후 슬리프 모드로 전환 (첫 요청 시 느릴 수 있음)
- 프로덕션 환경에서는 유료 플랜 권장

### 문제 해결
- **404 에러**: 백엔드 URL이 올바른지 확인
- **CORS 에러**: CORS_ORIGIN 환경 변수 확인
- **데이터베이스 연결 에러**: DATABASE_URL 확인
- **빌드 실패**: Build Command 확인 및 로그 확인

