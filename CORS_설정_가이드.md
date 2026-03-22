# 🔧 CORS 설정 가이드

## 현재 상태
✅ 프론트엔드: https://project-management-frontend-ogk2.onrender.com  
✅ 백엔드: https://project-management-backend-vn80.onrender.com  
⏳ **CORS 설정 필요**

---

## 🎯 CORS 설정 방법

### 1단계: Render Dashboard 접속

브라우저가 자동으로 열렸습니다!

또는 직접 접속:
```
https://dashboard.render.com/web/srv-d5hklgili9vc73ahbhe0/env
```

---

### 2단계: CORS_ORIGIN 환경 변수 찾기

페이지를 스크롤하여 **Environment Variables** 섹션에서 `CORS_ORIGIN` 찾기

---

### 3단계: CORS_ORIGIN 수정

#### 현재 값:
```
http://localhost:5173,http://localhost:5174
```

#### 변경할 값:
```
http://localhost:5173,http://localhost:5174,https://project-management-frontend-ogk2.onrender.com
```

또는 간단하게:
```
http://localhost:5173,https://project-management-frontend-ogk2.onrender.com
```

---

### 4단계: 저장 및 재배포

1. **"Edit"** 버튼 클릭
2. Value 입력란에 새 값 붙여넣기
3. **"Save Changes"** 클릭
4. 백엔드 자동 재배포 대기 (1-2분)

---

## 🎯 CORS가 없는 경우

만약 `CORS_ORIGIN` 환경 변수가 없다면:

1. **"Add Environment Variable"** 버튼 클릭
2. **Key**: `CORS_ORIGIN`
3. **Value**: `http://localhost:5173,https://project-management-frontend-ogk2.onrender.com`
4. **"Add"** 버튼 클릭

---

## ✅ 설정 완료 후 테스트

### 프론트엔드 접속:
```
https://project-management-frontend-ogk2.onrender.com
```

### 테스트 항목:
1. ✅ 프로젝트 목록이 표시되는지 확인
2. ✅ 새 프로젝트 생성 가능한지 확인
3. ✅ 프로젝트 상세 페이지 접속 확인
4. ✅ 관리자 페이지 접속 (코드: 1234)

---

## 🚨 문제 해결

### 여전히 CORS 오류가 발생하는 경우:

1. **백엔드 로그 확인**:
   - Render Dashboard → Logs
   - CORS 관련 에러 메시지 확인

2. **백엔드 재시작**:
   - Render Dashboard → Settings
   - "Manual Deploy" → "Clear build cache & deploy"

3. **브라우저 캐시 삭제**:
   - `Ctrl + Shift + Del`
   - 캐시 삭제 후 다시 접속

---

## 📝 참고사항

- **환경 변수 변경 시**: 백엔드가 자동으로 재배포됩니다 (1-2분 소요)
- **첫 배포**: Render 무료 플랜은 15분 비활성 시 서버가 정지되며, 첫 요청 시 50초 정도 걸립니다
- **데이터베이스**: 무료 플랜은 30일 후 자동 삭제되므로 유료 전환 또는 데이터 백업 필요

---

**설정 완료 후 배포가 끝납니다! 🎉**





