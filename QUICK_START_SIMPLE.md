# 빠른 시작 가이드

## 서버 실행 방법

### 방법 1: 자동 실행 (권장)
```powershell
.\start.ps1
```
이 스크립트가 백엔드와 프론트엔드를 자동으로 시작합니다.

### 방법 2: 수동 실행

#### Backend 서버
```powershell
cd backend
npm install
npm run dev
```

#### Frontend 서버 (새 터미널)
```powershell
cd frontend
npm install
npm run dev
```

## 중요 사항

⚠️ **프로젝트 루트에서 `npm run dev`를 실행하면 안 됩니다!**

프로젝트 루트에는 `package.json`이 없습니다.
- Backend: `backend/package.json`
- Frontend: `frontend/package.json`

각각의 디렉토리로 이동한 후 실행해야 합니다.



