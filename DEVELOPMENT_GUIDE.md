# 개발 가이드

## 빠른 시작

### 개발 모드 (추천) - 자동 재시작
```powershell
.\start-dev.ps1
```

**특징:**
- ✅ 백엔드 파일 변경 시 자동 재시작 (nodemon)
- ✅ 프론트엔드 Hot Module Replacement (HMR)
- ✅ 실시간 로깅 및 에러 표시
- ✅ 코드 수정 즉시 반영

### 일반 모드
```powershell
.\start.ps1
```

## 개발 워크플로우

### 1. 코드 수정 시
- **백엔드**: 파일 저장 시 자동 재시작 (nodemon)
- **프론트엔드**: 파일 저장 시 즉시 반영 (Vite HMR)

### 2. 에러 확인
- **백엔드 콘솔**: 상세한 로그 및 에러 메시지
- **브라우저 콘솔**: 프론트엔드 에러 및 네트워크 요청
- **브라우저 DevTools**: React 컴포넌트 상태 확인

### 3. API 테스트
- 브라우저에서 `http://localhost:3000/api/health` 접속
- Postman 또는 브라우저 DevTools Network 탭 사용

## 유용한 명령어

### 백엔드만 재시작
```powershell
.\restart-backend.ps1
```

### 데이터베이스 연결 테스트
```powershell
cd backend
node test-server.js
```

### 프론트엔드만 재시작
```powershell
cd frontend
npm run dev
```

## 디버깅 팁

### 1. 백엔드 로그 확인
- 백엔드 터미널에서 실시간 로그 확인
- 요청/응답 자동 로깅
- 에러 발생 시 상세 스택 트레이스

### 2. 프론트엔드 디버깅
- React DevTools 설치 권장
- 브라우저 콘솔에서 네트워크 요청 확인
- 컴포넌트 상태는 React DevTools에서 확인

### 3. 데이터베이스 확인
```powershell
cd backend
node test-server.js
```

## 문제 해결

### 포트 충돌
```powershell
# 포트 3000 사용 중인 프로세스 확인
Get-NetTCPConnection -LocalPort 3000

# 프로세스 종료
Stop-Process -Id <PID> -Force
```

### 캐시 문제
```powershell
# 프론트엔드 캐시 삭제
cd frontend
Remove-Item -Recurse -Force node_modules/.vite
npm run dev
```

### 데이터베이스 연결 실패
1. PostgreSQL 서비스 실행 확인
2. `.env` 파일의 `DATABASE_URL` 확인
3. `backend/test-server.js` 실행하여 연결 테스트

## 개발 환경 최적화

### VS Code 확장 프로그램 추천
- ESLint
- Prettier
- PostgreSQL
- REST Client (API 테스트)

### 브라우저 확장 프로그램
- React Developer Tools
- Redux DevTools (필요시)

## 성능 모니터링

### 백엔드
- 각 API 요청의 응답 시간 자동 로깅
- 에러 발생 시 상세 정보 출력

### 프론트엔드
- Vite 빌드 시간 확인
- 브라우저 DevTools Performance 탭 사용



