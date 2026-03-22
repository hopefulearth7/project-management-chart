# 🎉 프로젝트 관리 웹사이트 - 최종 배포 가이드

## ✅ 완료된 작업

### 1. GitHub 저장소 생성 및 코드 푸시
- ✅ Git 저장소 초기화
- ✅ 코드 커밋 및 GitHub 푸시
- ✅ 저장소: `mogrow24/project-management-chart`

### 2. Render.com 배포 설정

#### 백엔드 Web Service 배포 완료
- ✅ **서비스 이름**: project-management-backend
- ✅ **URL**: `https://project-management-backend-vn80.onrender.com`
- ✅ **배포 상태**: 실행 중

#### PostgreSQL 데이터베이스 생성 완료
- ✅ **데이터베이스 이름**: project_management_jgvj
- ✅ **Internal URL**: 
  ```
  postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a/project_management_jgvj
  ```

---

## 🔧 남은 단계 (수동 완료 필요)

### 단계 1: 프론트엔드 Static Site 배포

1. **Render Dashboard**로 이동: `https://dashboard.render.com/`
2. **"New +"** → **"Static Site"** 클릭
3. **저장소 선택**: `mogrow24/project-management-chart`
4. **다음 정보 입력**:
   ```
   Name: project-management-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm run build
   Publish Directory: dist
   ```

5. **환경 변수 추가**:
   ```
   VITE_API_URL=https://project-management-backend-vn80.onrender.com
   ```

6. **"Deploy Static Site"** 버튼 클릭

### 단계 2: 데이터베이스 스키마 초기화

프론트엔드 배포가 완료되면:

1. **Render Dashboard** → **project-management-backend** → **Shell** (유료 플랜) 또는:
2. 백엔드 서비스에 **초기화 스크립트 실행 API** 추가 필요

**임시 해결책**: 로컬에서 테스트 데이터 생성 후 수동으로 운영 DB에 입력

### 단계 3: CORS 설정 업데이트

1. **Render Dashboard** → **project-management-backend** → **Environment**
2. **CORS_ORIGIN** 환경 변수에 프론트엔드 URL 추가:
   ```
   http://localhost:5173,https://project-management-frontend-[랜덤].onrender.com
   ```
3. **Save Changes** 클릭

---

## 📋 환경 변수 정리

### 백엔드 (project-management-backend)
```bash
PORT=3000
DATABASE_URL=postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a/project_management_jgvj
CORS_ORIGIN=http://localhost:5173,https://[frontend-url].onrender.com
NODE_ENV=production
```

### 프론트엔드 (project-management-frontend)
```bash
VITE_API_URL=https://project-management-backend-vn80.onrender.com
```

---

## 🔑 중요 정보

### 데이터베이스 접속 정보
```
Host: dpg-d5hkg924d50c7394v05g-a
Database: project_management_jgvj
User: project_management_jgvj_user
Password: vklP809yzc2VHWvkRXfksbXYTvrQlvL5
```

### 기본 관리자 코드
- **관리자 코드**: `1234`
- **회사명**: 행복한 지구

---

## 🛠️ 로컬 개발 환경

### 백엔드 실행
```powershell
cd backend
npm install
npm run dev
```

### 프론트엔드 실행
```powershell
cd frontend
npm install
npm run dev
```

### 전체 프로젝트 실행
```powershell
.\start.ps1
```

---

## 📝 배포 체크리스트

- [x] Git 저장소 생성
- [x] 코드 GitHub 푸시
- [x] PostgreSQL 데이터베이스 생성
- [x] 백엔드 Web Service 배포
- [ ] 프론트엔드 Static Site 배포
- [ ] 데이터베이스 스키마 초기화
- [ ] CORS 설정 업데이트
- [ ] 배포 테스트

---

## 🎯 배포 후 확인

### 백엔드 API 테스트
```bash
curl https://project-management-backend-vn80.onrender.com/api/projects
```

### 프론트엔드 접속
- URL: `https://[your-frontend-url].onrender.com`
- 로그인 없이 바로 프로젝트 목록 확인 가능
- 관리자 페이지: 관리자 코드 (`1234`) 입력

---

## ⚠️ 알려진 제한 사항

### Render 무료 플랜
1. **백엔드**: 비활성 시 자동 정지 (50초 지연 발생)
2. **데이터베이스**: 30일 후 만료 (유료 전환 필요)
3. **Shell 접근**: 무료 플랜에서 불가능

### 대안
- **Vercel** + **Railway**: 프론트엔드 Vercel, 백엔드/DB Railway
- **Docker 로컬 배포**: `docker-compose up`

---

## 📞 지원

문제가 발생하면:
1. **백엔드 로그 확인**: Render Dashboard → Logs
2. **프론트엔드 빌드 오류**: 빌드 로그 확인
3. **데이터베이스 연결 오류**: DATABASE_URL 환경 변수 확인

---

**배포 날짜**: 2026-01-11  
**마지막 업데이트**: 2026-01-11 16:16 KST  
**버전**: 1.0.0  

**다음 단계**: 위의 "남은 단계"를 순서대로 완료하세요.





