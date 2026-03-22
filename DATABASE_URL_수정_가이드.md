# 🔧 DATABASE_URL 수정 가이드

## 🚨 문제 발견

백엔드 로그에서 `ECONNREFUSED` 에러 발생
→ 데이터베이스 연결 실패

**원인**: DATABASE_URL이 **Internal URL**로 설정되어 있음
→ Render Web Service는 **External URL**을 사용해야 함

---

## ✅ 해결 방법

### 1. 현재 DATABASE_URL 확인

Render Dashboard → Environment 탭에서 확인

**Internal URL (잘못된 예)**:
```
postgresql://project_management_jgvj_user:password@dpg-d5hkg924d50c7394v05g-a/project_management_jgvj
```

### 2. 올바른 External URL

**External URL (정답)**:
```
postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a.virginia-postgres.render.com/project_management_jgvj
```

**차이점**: `.virginia-postgres.render.com` 추가됨

---

## 📝 수정 단계

### 1. Render Dashboard 접속
```
https://dashboard.render.com/web/srv-d5hklgili9vc73ahbhe0/env
```

### 2. DATABASE_URL 찾기
- Environment Variables 섹션에서 `DATABASE_URL` 찾기
- 현재 값 확인

### 3. Edit 클릭

### 4. 값 변경
**새 값 입력**:
```
postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a.virginia-postgres.render.com/project_management_jgvj
```

### 5. Save Changes 클릭

### 6. 재배포 대기 (2-3분)
- 환경 변수 변경 시 자동 재배포됨
- Logs에서 진행 상황 확인

---

## 🧪 수정 후 확인

### 1. Logs 확인
```
https://dashboard.render.com/web/srv-d5hklgili9vc73ahbhe0/logs
```

**확인할 메시지**:
- ✅ "Database connected successfully"
- ✅ "Server running on port 3000"
- ❌ "ECONNREFUSED" (이 에러가 사라져야 함)

### 2. API 테스트
```bash
curl https://project-management-backend-vn80.onrender.com/api/projects
```

**예상 결과**: 10개 프로젝트의 JSON 배열

### 3. 프론트엔드 확인
```
https://project-management-frontend-ogk2.onrender.com
```

**예상 결과**: 10개 프로젝트 목록 표시

---

## 🎯 빠른 복사용

**External Database URL**:
```
postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a.virginia-postgres.render.com/project_management_jgvj
```

---

## 💡 참고

### Internal vs External URL

| 타입 | 사용처 | 형식 |
|------|--------|------|
| **Internal** | 같은 Render 계정 내부 서비스 | `@dpg-xxx-a` |
| **External** | 외부 또는 Web Service | `@dpg-xxx-a.region.render.com` |

### Render Web Service는 External URL 사용!
- ✅ Web Service → Database: **External URL**
- ✅ Background Worker → Database: **Internal URL** (같은 계정 내부)
- ✅ 로컬 개발 → Database: **External URL**

---

**이 수정만 하면 모든 것이 작동합니다!** 🎉





