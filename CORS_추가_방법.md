# 🆕 CORS_ORIGIN 환경 변수 추가 방법

## 현재 상황
✅ CORS_ORIGIN 환경 변수가 없음  
➡️ 새로 추가 필요

---

## 📝 단계별 가이드

### 1단계: "New variable" 클릭
스크린샷에 보이는 드롭다운 메뉴에서 **"New variable"** 클릭

---

### 2단계: Key 입력
**Key** 입력란에:
```
CORS_ORIGIN
```

---

### 3단계: Value 입력
**Value** 입력란에:
```
http://localhost:5173,https://project-management-frontend-ogk2.onrender.com
```

---

### 4단계: 저장
**"Add"** 또는 **"Save"** 버튼 클릭

---

### 5단계: 재배포 대기
- 환경 변수가 추가되면 백엔드가 **자동으로 재배포**됩니다
- 재배포 시간: **약 1-2분**
- Logs 탭에서 재배포 진행 상황 확인 가능

---

## ✅ 완료 확인

재배포가 완료되면 프론트엔드에 접속하여 테스트:
```
https://project-management-frontend-ogk2.onrender.com
```

### 확인 사항:
- ✅ 프로젝트 목록이 표시됨
- ✅ CORS 에러 없음
- ✅ API 요청이 정상 작동

---

## 🔍 참고: 다른 환경 변수들

현재 백엔드에 설정된 환경 변수들:
```
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=(설정됨)
NODE_ENV=production
CORS_ORIGIN=(지금 추가 중)
```

---

## 🎯 빠른 복사용

**Key:**
```
CORS_ORIGIN
```

**Value:**
```
http://localhost:5173,https://project-management-frontend-ogk2.onrender.com
```

---

**이 작업만 완료하면 배포가 끝납니다! 🎉**





