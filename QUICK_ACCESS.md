# 🚀 빠른 접속 가이드

## 📍 배포된 사이트 바로 접속하기

### 방법 1: 스크립트 실행 (권장)

```powershell
.\open-deployed-site.ps1
```

이 스크립트는 배포된 사이트를 자동으로 열어줍니다.

### 방법 2: 직접 브라우저에서 접속

**프론트엔드 URL:**
```
https://project-management-frontend-ogk2.onrender.com
```

**백엔드 API:**
```
https://project-management-backend-vn80.onrender.com
```

---

## 🔄 로컬 개발 서버 자동 시작

### Windows 부팅 시 자동 시작 설정

관리자 권한으로 PowerShell을 실행한 후:

```powershell
.\setup-auto-start.ps1
```

이 스크립트는 Windows 로그인 시 자동으로 개발 서버를 시작합니다.

### 수동 시작

```powershell
.\start.ps1
```

---

## ⚠️ Render 무료 플랜 주의사항

### 자동 정지
- **15분 동안 요청이 없으면 서버가 자동으로 정지됩니다**
- 첫 접속 시 **최대 50초** 정도 걸릴 수 있습니다 (Cold Start)

### 해결 방법

1. **UptimeRobot 설정 (권장)**
   - https://uptimerobot.com 접속
   - 백엔드 URL에 5분마다 ping 설정
   - 예: `https://project-management-backend-vn80.onrender.com/api/health`

2. **수동 접속**
   - 첫 접속 시 조금만 기다리면 자동으로 깨어납니다

---

## 📊 서버 상태 확인

### 백엔드 Health Check
```powershell
curl https://project-management-backend-vn80.onrender.com/api/health
```

### 브라우저에서 확인
```
https://project-management-backend-vn80.onrender.com/api/health
```

정상 응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🎯 빠른 시작 요약

### 배포된 사이트 접속
```powershell
.\open-deployed-site.ps1
```

### 로컬 개발 서버 시작
```powershell
.\start.ps1
```

### 자동 시작 설정 (한 번만 실행)
```powershell
# 관리자 권한 필요
.\setup-auto-start.ps1
```

---

## 💡 팁

1. **배포 사이트 바로가기 만들기**
   - `open-deployed-site.ps1`를 우클릭
   - "바로가기 만들기" 선택
   - 바로가기를 데스크톱으로 이동
   - 원하는 아이콘으로 변경

2. **브라우저 북마크 추가**
   - 배포 URL을 브라우저 북마크에 추가
   - 빠른 접속 가능

3. **Render 서버 항상 깨어있게 하기**
   - UptimeRobot 설정 (무료)
   - 또는 Render 유료 플랜 사용

---

**질문이나 문제가 있으면 알려주세요!** 😊


