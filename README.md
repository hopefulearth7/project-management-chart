# 프로젝트 관리 웹사이트

프로젝트의 ROI(Return on Investment)를 계산하고 관리하기 위한 웹 기반 시스템입니다.

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+ 
- PostgreSQL 15+
- npm 또는 yarn

### 설치 및 실행

```bash
# 1. Backend 의존성 설치
cd backend
npm install

# 2. Database 설정
# PostgreSQL 실행 후 database/schema.sql 실행

# 3. 환경 변수 설정
cp backend/.env.example backend/.env
# .env 파일 수정

# 4. Backend 실행
npm run dev

# 5. Frontend 의존성 설치 (새 터미널)
cd frontend
npm install

# 6. Frontend 실행
npm run dev
```

Frontend는 `http://localhost:5173`에서 실행됩니다.

## 📁 프로젝트 구조

```
project_manage/
├── frontend/          # React + Tailwind CSS
├── backend/           # Node.js + Express
├── database/          # PostgreSQL 스키마
└── docs/              # 문서 (PRD, ERD, 워크플로우)
```

## 🎨 주요 기능

- ✅ 회원가입 및 로그인
- ✅ 어드민 페이지 (직급별 급여, 비용 관리, ROI 계산)
- ✅ 직급 관리 (직급 생성, 수정)
- ✅ 프론트 페이지 (투입 인원 선택, 만족도 표시)
- ✅ 실시간 ROI 계산
- ✅ 모던하고 세련된 UI 디자인

## 🚀 배포

### 변경사항 배포
```powershell
# 자동 배포 스크립트 실행
.\deploy-changes.ps1
```

또는 수동으로:
```bash
git add .
git commit -m "변경사항 커밋"
git push origin main
```

Render가 자동으로 배포합니다. 자세한 내용은 [배포 변경사항 가이드](./배포_변경사항_가이드.md) 참조.

## 📚 문서

- [PRD](./docs/PRD.md)
- [ERD](./docs/ERD.md)
- [워크플로우](./docs/workflows/)
- [MLOps 가이드](./docs/MLOps_적용_가이드.md)
- [배포 변경사항 가이드](./배포_변경사항_가이드.md)

