# 빠른 해결 방법

## 문제: 백엔드 서버 500 에러

### 해결 방법 1: 백엔드 서버 재시작

```powershell
# 1. 기존 프로세스 종료
Get-Process -Name node | Where-Object { (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -like "*server.js*" } | Stop-Process -Force

# 2. 백엔드 서버 시작
cd backend
node server.js
```

### 해결 방법 2: 개발 모드로 시작

```powershell
.\start-dev.ps1
```

### 해결 방법 3: 수동 확인

1. 백엔드 터미널에서 에러 메시지 확인
2. 데이터베이스 연결 확인: `node backend/test-server.js`
3. `.env` 파일의 `DATABASE_URL` 확인

## 현재 상태

- ✅ 데이터베이스 연결: 정상
- ✅ 테이블 존재: 확인됨
- ⚠️ 백엔드 서버: 실행 필요

## 다음 단계

백엔드 서버를 실행하세요:
```powershell
cd backend
npm run dev
```

또는

```powershell
.\start-dev.ps1
```



