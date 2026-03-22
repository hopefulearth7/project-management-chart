# 🚀 프로젝트 관리 웹사이트 배포 완료 가이드

## ✅ 완료된 작업

### 1. 백엔드 Web Service 배포 완료
- **서비스 이름**: project-management-backend
- **URL**: `https://project-management-backend-vn80.onrender.com`
- **상태**: 배포 완료 및 실행 중

### 2. PostgreSQL 데이터베이스 생성 완료
- **데이터베이스 이름**: project_management_jgvj
- **Internal URL**: 
  ```
  postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a/project_management_jgvj
  ```

---

## 🔧 수동으로 완료해야 하는 단계

### 단계 1: 데이터베이스 스키마 초기화

로컬 PowerShell에서 다음 명령어를 실행하세요:

```powershell
cd C:\Users\dbslg\Desktop\project_manage\backend
$env:DATABASE_URL="postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a/project_management_jgvj"
node init-db.js
```

### 단계 2: 프론트엔드 Static Site 배포

1. **Render 페이지로 이동**: `https://dashboard.render.com/static/new`

2. **다음 정보 입력**:
   - **Name**: `project-management-frontend`
   - **Repository**: `mogrow24/project-management-chart` (이미 선택됨)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

3. **환경 변수 추가**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://project-management-backend-vn80.onrender.com`

4. **"Deploy Static Site"** 버튼 클릭

### 단계 3: CORS 설정 업데이트

프론트엔드 배포가 완료된 후:

1. **Render Dashboard** → **project-management-backend** → **Environment**로 이동
2. **CORS_ORIGIN** 환경 변수 찾기
3. 프론트엔드 URL 추가:
   ```
   http://localhost:5173,https://[your-frontend-url].onrender.com
   ```
4. **Save Changes** 클릭
5. 백엔드 자동 재배포 대기

---

## 📋 배포 후 확인 사항

### 백엔드 확인
```bash
curl https://project-management-backend-vn80.onrender.com/api/projects
```

### 프론트엔드 확인
- 브라우저에서 프론트엔드 URL 접속
- 프로젝트 목록이 정상적으로 표시되는지 확인

---

## 🔑 중요 정보

### 데이터베이스 접속 정보
- **Host**: `dpg-d5hkg924d50c7394v05g-a`
- **Database**: `project_management_jgvj`
- **User**: `project_management_jgvj_user`
- **Password**: `vklP809yzc2VHWvkRXfksbXYTvrQlvL5`

### 백엔드 환경 변수
```
PORT=3000
DATABASE_URL=postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a/project_management_jgvj
CORS_ORIGIN=http://localhost:5173,https://[frontend-url].onrender.com
NODE_ENV=production
```

### 프론트엔드 환경 변수
```
VITE_API_URL=https://project-management-backend-vn80.onrender.com
```

---

## 🛠️ 문제 해결

### 데이터베이스 연결 오류
```powershell
# 연결 테스트
cd backend
node test-connection.js
```

### 백엔드 로그 확인
- Render Dashboard → project-management-backend → Logs

### 프론트엔드 빌드 오류
- Render Dashboard → project-management-frontend → Logs

---

## 📝 다음 단계

1. ✅ 데이터베이스 초기화 (단계 1)
2. ✅ 프론트엔드 배포 (단계 2)
3. ✅ CORS 설정 업데이트 (단계 3)
4. ✅ 배포 확인
5. ✅ 관리자 코드 설정 (기본값: 1234)

---

## 🎉 완료!

모든 단계가 완료되면 프로젝트 관리 웹사이트가 다음 URL에서 접근 가능합니다:
- **프론트엔드**: `https://[your-frontend-url].onrender.com`
- **백엔드 API**: `https://project-management-backend-vn80.onrender.com`

---

**배포 날짜**: 2026-01-11  
**배포 환경**: Render.com  
**프로젝트 버전**: 1.0.0





