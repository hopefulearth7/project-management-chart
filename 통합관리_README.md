# 프로젝트 관리 시스템 - 통합 관리 가이드

## 목차
1. [시스템 개요](#시스템-개요)
2. [빠른 시작](#빠른-시작)
3. [스크립트 목록](#스크립트-목록)
4. [데이터베이스 관리](#데이터베이스-관리)
5. [API 엔드포인트](#api-엔드포인트)
6. [문제 해결](#문제-해결)

---

## 시스템 개요

이 프로젝트는 **프로젝트 관리, 인원 관리, 비용 관리, ROI 계산**을 지원하는 웹 기반 시스템입니다.

### 주요 기능
- ✅ 프로젝트 생성 및 관리
- ✅ WBS (Work Breakdown Structure) 간트 차트
- ✅ 프로젝트 멤버 및 비용 관리
- ✅ ROI (투자 수익률) 자동 계산
- ✅ 급여 및 직급 관리
- ✅ 관리자 대시보드

### 기술 스택
- **백엔드**: Node.js (Express) + PostgreSQL
- **프론트엔드**: React + Vite + TailwindCSS
- **데이터베이스**: PostgreSQL 15+

---

## 빠른 시작

### 1단계: 완전 설치 (처음 한 번만)

```powershell
# 환경 변수 생성
.\create-env.ps1

# 데이터베이스 초기화 + 의존성 설치
.\setup-complete.ps1
```

### 2단계: 개발 서버 실행

```powershell
# 백엔드 + 프론트엔드 동시 실행
.\start-dev.ps1

# 또는 개별 실행
.\start-backend.ps1   # 백엔드만
.\start-frontend.ps1  # 프론트엔드만
```

### 3단계: 브라우저 접속

```
http://localhost:5173
```

### 4단계: 관리자 페이지 접속

1. `/admin` 경로로 이동
2. 접근 코드 입력: `1234` (기본값)
3. 프로젝트 생성 및 관리

---

## 스크립트 목록

### 설치 및 설정

| 스크립트 | 설명 |
|---------|------|
| `create-env.ps1` | .env 파일 생성 (데이터베이스 연결 정보) |
| `setup-complete.ps1` | 완전 설치 (스키마 + 의존성) |
| `setup-postgres-user.ps1` | PostgreSQL 사용자 및 데이터베이스 생성 |

### 실행 및 재시작

| 스크립트 | 설명 |
|---------|------|
| `start-dev.ps1` | 백엔드 + 프론트엔드 동시 실행 |
| `start-backend.ps1` | 백엔드만 실행 (포트 3000) |
| `start-frontend.ps1` | 프론트엔드만 실행 (포트 5173) |
| `restart-backend.ps1` | 백엔드 재시작 |
| `restart-frontend.ps1` | 프론트엔드 재시작 |
| `kill-backend.ps1` | 백엔드 프로세스 종료 |

### 데이터베이스 관리

| 스크립트 | 설명 |
|---------|------|
| `check-db.ps1` | 데이터베이스 연결 및 데이터 확인 |
| `update-wbs-schema.ps1` | WBS 스키마 업데이트 (간트 차트 기능) |
| `database/schema.sql` | 전체 스키마 정의 |
| `database/update-complete-schema.sql` | 스키마 업데이트 (마이그레이션) |
| `database/seed.sql` | 초기 데이터 삽입 |

### 테스트 및 검증

| 스크립트 | 설명 |
|---------|------|
| `test-all-apis.ps1` | 모든 API 엔드포인트 테스트 |
| `check-backend.ps1` | 백엔드 상태 확인 |

---

## 데이터베이스 관리

### 스키마 구조

```
user                  -- 사용자 (직원)
├── employment_start_date
├── employment_end_date
├── actual_annual_salary
└── employment_status

role                  -- 직급 (사원, 대리, 과장 등)
salary                -- 직급별 급여

project               -- 프로젝트
├── project_member    -- 프로젝트 멤버
├── cost              -- 비용
├── satisfaction      -- 만족도
├── roi_calculation   -- ROI 계산 이력
└── wbs               -- Work Breakdown Structure
    └── original_end_date  -- 기간 연장 추적

admin_settings        -- 관리자 설정 (접근 코드 등)
```

### 스키마 업데이트

```powershell
# 방법 1: 완전 업데이트
.\setup-complete.ps1

# 방법 2: 수동 실행
psql $env:DATABASE_URL -f database/update-complete-schema.sql
```

### 초기 데이터 삽입

```powershell
# 기본 데이터 (직급, 급여)
psql $env:DATABASE_URL -f database/seed.sql

# 확장 데이터 (프로젝트 10개, 사용자)
psql $env:DATABASE_URL -f database/seed-extended.sql
```

---

## API 엔드포인트

### Health Check
```
GET /api/health
```

### 사용자 관리
```
GET    /api/users              # 전체 사용자 목록
GET    /api/users/:id          # 특정 사용자 조회
POST   /api/users              # 사용자 생성
PUT    /api/users/:id          # 사용자 수정
GET    /api/users/:id/projects # 사용자의 프로젝트 목록
```

### 관리자
```
GET    /api/admin/settings          # 관리자 설정 조회
POST   /api/admin/settings          # 관리자 설정 저장
POST   /api/admin/verify-code       # 접근 코드 검증
GET    /api/admin/summary           # 대시보드 요약
GET    /api/admin/role-salaries     # 직급별 급여 정보
GET    /api/admin/member-timeline   # 멤버 타임라인
```

### 인증
```
POST   /api/auth/register      # 회원가입
POST   /api/auth/login         # 로그인
```

### 프로젝트
```
GET    /api/projects           # 프로젝트 목록
GET    /api/projects/:id       # 프로젝트 상세
POST   /api/projects           # 프로젝트 생성
DELETE /api/projects/:id       # 프로젝트 삭제
```

### 프로젝트 세부 정보
```
GET    /api/projects/:id/costs        # 비용 목록
POST   /api/projects/:id/costs        # 비용 추가
GET    /api/projects/:id/members      # 멤버 목록
POST   /api/projects/:id/members      # 멤버 추가
PUT    /api/projects/:id/members/:memberId  # 멤버 수정
DELETE /api/projects/:id/members/:memberId  # 멤버 삭제
POST   /api/projects/:id/satisfaction # 만족도 제출
GET    /api/projects/:id/roi          # ROI 계산
```

### WBS (Work Breakdown Structure)
```
GET    /api/projects/:id/wbs   # WBS 목록
POST   /api/projects/:id/wbs   # WBS 생성
PUT    /api/wbs/:id            # WBS 수정
DELETE /api/wbs/:id            # WBS 삭제
```

### 직급 및 급여
```
GET    /api/roles              # 직급 목록
GET    /api/salaries           # 급여 목록
POST   /api/salaries           # 급여 추가
PUT    /api/salaries/:id       # 급여 수정
```

### API 테스트

```powershell
# 모든 API 자동 테스트
.\test-all-apis.ps1

# 개별 테스트 (curl 또는 Postman 사용)
curl http://localhost:3000/api/health
```

---

## 문제 해결

### 백엔드가 시작되지 않는 경우

```powershell
# 1. 데이터베이스 연결 확인
.\check-db.ps1

# 2. 환경 변수 확인
.\check-env.ps1

# 3. 포트 충돌 확인 및 종료
.\kill-backend.ps1

# 4. 백엔드 재시작
.\restart-backend.ps1
```

### 데이터베이스 오류

```powershell
# 데이터베이스 접속
psql $env:DATABASE_URL

# 테이블 확인
\dt

# 특정 테이블 조회
SELECT * FROM "user" LIMIT 5;
SELECT * FROM project LIMIT 5;

# 스키마 재생성 (주의: 데이터 삭제됨)
psql $env:DATABASE_URL -f database/schema.sql
psql $env:DATABASE_URL -f database/seed.sql
```

### 프론트엔드 빌드 오류

```powershell
cd frontend
npm install
npm run dev
```

### API가 응답하지 않는 경우

```powershell
# 1. 백엔드 상태 확인
.\check-backend.ps1

# 2. 로그 확인
# 백엔드 터미널에서 에러 메시지 확인

# 3. CORS 오류인 경우
# .env 파일에서 CORS_ORIGIN 확인
# CORS_ORIGIN=http://localhost:5173
```

### 간트 차트가 표시되지 않는 경우

```powershell
# WBS 스키마 업데이트
.\update-wbs-schema.ps1

# 백엔드 재시작
.\restart-backend.ps1

# 브라우저 캐시 삭제 (Ctrl + Shift + R)
```

---

## 배포 가이드

### Render 배포 (권장)
자세한 내용은 [`DEPLOY_SIMPLE.md`](DEPLOY_SIMPLE.md) 참조

### Vercel + Railway 배포
자세한 내용은 [`DEPLOY_VERCEL_RAILWAY.md`](DEPLOY_VERCEL_RAILWAY.md) 참조

---

## 추가 리소스

- [간트 차트 사용 가이드](docs/간트차트_사용가이드.md)
- [프로젝트 생성 워크플로우](docs/workflows/1.00_프로젝트_생성_워크플로우.md)
- [비용 관리 워크플로우](docs/workflows/2.00_비용_관리_워크플로우.md)
- [인원 관리 워크플로우](docs/workflows/3.00_인원_관리_워크플로우.md)
- [개발 가이드](DEVELOPMENT_GUIDE.md)

---

## 라이선스 및 기여

이 프로젝트는 내부 사용을 위한 프로젝트 관리 도구입니다.

**개발 팀**: AI Assistant + 사용자
**최종 업데이트**: 2026-01-11





