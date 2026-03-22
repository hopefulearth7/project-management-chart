# 🚀 프로젝트 설정 가이드

## 1단계: .env 파일 생성

```powershell
.\create-env.ps1
```

생성된 `.env` 파일에서 `DATABASE_URL`을 실제 PostgreSQL 설정에 맞게 수정하세요:

```env
DATABASE_URL="postgresql://사용자명:비밀번호@localhost:5432/데이터베이스명"
```

## 2단계: 데이터베이스 초기화

프로젝트 10개, 사용자 10명, WBS 데이터를 포함한 확장된 데이터를 삽입합니다:

```powershell
.\database\init-extended-db.ps1
```

## 3단계: 서버 실행

### Backend 서버
```powershell
cd backend
npm install
npm run dev
```

### Frontend 서버 (새 터미널)
```powershell
cd frontend
npm install
npm run dev
```

또는 자동 실행 스크립트 사용:
```powershell
.\start.ps1
```

## 4단계: 접속

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## 생성되는 데이터

### 프로젝트 10개
1. 웹사이트 리뉴얼 프로젝트
2. 모바일 앱 개발
3. 데이터 분석 시스템 구축
4. 클라우드 마이그레이션
5. AI 챗봇 서비스
6. 전자상거래 플랫폼
7. 보안 강화 프로젝트
8. 고객 관리 시스템(CRM)
9. IoT 디바이스 연동
10. 마이크로서비스 아키텍처 전환

### 사용자 10명 (입사일 포함)
- 관리자 (2020-01-15)
- 일반 사용자 9명 (2021-2023)

### WBS 항목
각 프로젝트별로 작업 항목이 생성됩니다.

## 기능 확인

### 메인 화면
- 프로젝트 목록 표시
- 프로젝트 생성 버튼
- 프로젝트 클릭 시 상세 페이지 이동

### 프로젝트 상세 페이지
- 프로젝트 정보
- **WBS (Work Breakdown Structure)** 섹션
  - 계층적 작업 구조 표시
  - 작업 추가/수정/삭제
  - 진행률 표시
- ROI 계산
- 투입 인원 관리
- 만족도 평가

### 어드민 대시보드 (`/admin/dashboard`)
- **프로젝트 일정 및 상태**
  - 프로젝트명, 설명
  - 상태 (진행중/완료/계획중)
  - 시작일/종료일
  - 남은 일수 계산
  - 진행률 (WBS 기반)
  - 예상 수익
- **입사자 정보**
  - 전체 직원 수
  - 최근 1년 입사자 수
  - 이름, 이메일, 역할
  - 입사일
  - 근무 기간

## 테스트 계정

- **관리자**: `admin@example.com` / `admin123`
- **일반 사용자**: `user@example.com` / `user123`

## 문제 해결

### 데이터베이스 연결 오류
- `.env` 파일의 `DATABASE_URL` 확인
- PostgreSQL 서버가 실행 중인지 확인
- 데이터베이스가 생성되었는지 확인

### 백엔드 500 오류
- 백엔드 서버 로그 확인
- 데이터베이스 테이블이 생성되었는지 확인
- `.\database\init-extended-db.ps1` 재실행

### 프론트엔드 빈 화면
- 브라우저 새로고침 (`Ctrl + Shift + R`)
- 브라우저 콘솔에서 에러 확인
- Vite 개발 서버 재시작



