# 🚀 빠른 시작 가이드

## 1단계: 데이터베이스 설정

### 방법 1: 자동 초기화 (권장)
```powershell
# PowerShell에서 실행
.\database\init-db.ps1
```

### 방법 2: 수동 설정
```bash
# PostgreSQL 실행 후
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE project_manage;

# 스키마 실행
\i database/schema.sql

# 테스트 데이터 삽입 (선택사항)
\i database/seed.sql
```

## 2단계: Backend 실행

```bash
cd backend
npm install
npm run dev
```

Backend는 `http://localhost:3000`에서 실행됩니다.

## 3단계: Frontend 실행

```bash
# 새 터미널에서
cd frontend
npm install
npm run dev
```

Frontend는 `http://localhost:5173`에서 실행됩니다.

## 4단계: 접속

브라우저에서 `http://localhost:5173` 접속

### 초기 테스트 계정
- **관리자**: `admin@example.com` / `admin123`
- **일반 사용자**: `user@example.com` / `user123`

> ⚠️ 주의: 실제 운영 환경에서는 비밀번호를 해시화하여 저장해야 합니다.

## 주요 기능

✅ **회원가입/로그인** - `/register`, `/login`  
✅ **어드민 대시보드** - `/admin/dashboard`  
✅ **급여 관리** - `/admin/salary`  
✅ **비용 관리** - `/admin/cost`  
✅ **프로젝트 생성** - `/admin/projects/create`  
✅ **프로젝트 목록** - `/projects`  
✅ **프로젝트 상세** - `/projects/:id`  
✅ **투입 인원 선택** - 프로젝트 상세 페이지  
✅ **만족도 평가** - 프로젝트 상세 페이지

## 디자인 특징

- 🎨 **깔끔한 UI**: Tailwind CSS 기반 모던 디자인
- 📱 **반응형**: 모바일, 태블릿, 데스크톱 지원
- 🎯 **직관적**: 사용하기 쉬운 인터페이스
- ⚡ **빠른 성능**: Vite 기반 빠른 개발 환경

