# API 키 및 토큰 발급 가이드

이 문서는 Cursor MCP 서버 설정에 필요한 API 키와 토큰을 발급받는 방법을 안내합니다.

---

## 1. Supabase Personal Access Token 발급

### 단계별 가이드

1. **Supabase 계정 생성 및 로그인**
   - [Supabase 공식 웹사이트](https://supabase.com/) 접속
   - 계정이 없다면 회원가입, 있다면 로그인

2. **프로젝트 생성 (이미 있다면 생략)**
   - 대시보드에서 "New Project" 클릭
   - 프로젝트 이름, 데이터베이스 비밀번호 설정
   - 프로젝트 생성 완료 대기 (약 2분)

3. **Personal Access Token 발급**
   - 우측 상단 프로필 아이콘 클릭 → **Account Settings** 선택
   - 왼쪽 메뉴에서 **Access Tokens** 선택
   - **Generate new token** 버튼 클릭
   - 토큰 이름 입력 (예: "Cursor MCP")
   - **Generate token** 클릭
   - ⚠️ **중요**: 생성된 토큰을 즉시 복사하세요! (한 번만 표시됩니다)

4. **토큰 사용**
   - `.cursor/mcp.json` 파일의 `YOUR_SUPABASE_ACCESS_TOKEN` 부분에 복사한 토큰 붙여넣기

---

## 2. GitHub Personal Access Token 발급

### 단계별 가이드

1. **GitHub 계정 로그인**
   - [GitHub](https://github.com) 접속 및 로그인

2. **개발자 설정 접근**
   - 우측 상단 프로필 아이콘 클릭 → **Settings** 선택
   - 왼쪽 하단 **Developer settings** 클릭

3. **Personal Access Token 생성**
   - **Personal access tokens** → **Tokens (classic)** 선택
   - 또는 **Fine-grained tokens** 선택 (더 세밀한 권한 제어 가능)
   - **Generate new token** (또는 **Generate new token (classic)**) 클릭

4. **토큰 설정**
   - **Note**: 토큰 용도 입력 (예: "Cursor MCP")
   - **Expiration**: 만료 기간 선택 (30일, 60일, 90일, 또는 No expiration)
   - **Select scopes**: 필요한 권한 선택
     - 최소 권한: `repo` (전체 저장소 접근)
     - 또는 필요한 권한만 선택 (예: `read:org`, `read:user`)

5. **토큰 생성 및 복사**
   - **Generate token** 클릭
   - ⚠️ **중요**: 생성된 토큰을 즉시 복사하세요! (한 번만 표시됩니다)

6. **토큰 사용**
   - `.cursor/mcp.json` 파일의 `YOUR_GITHUB_TOKEN` 부분에 복사한 토큰 붙여넣기

### 참고
- **Fine-grained tokens** 사용 시:
  - 특정 저장소만 선택 가능
  - 더 세밀한 권한 제어 가능
  - 권장: 보안을 위해 필요한 최소 권한만 부여

---

## 3. Anthropic API Key 발급

### 단계별 가이드

1. **Anthropic 계정 생성**
   - [Anthropic 공식 웹사이트](https://www.anthropic.com/) 접속
   - **Sign up** 또는 **Log in** 클릭
   - 이메일 주소로 계정 생성

2. **API Keys 페이지 접근**
   - 로그인 후 대시보드에서 **API Keys** 메뉴 선택
   - 또는 직접 [API Keys 페이지](https://console.anthropic.com/settings/keys) 접속

3. **API Key 생성**
   - **Create Key** 버튼 클릭
   - Key 이름 입력 (예: "Cursor MCP")
   - **Create Key** 클릭
   - ⚠️ **중요**: 생성된 API 키를 즉시 복사하세요! (한 번만 표시됩니다)

4. **API Key 사용**
   - `.cursor/mcp.json` 파일의 `YOUR_ANTHROPIC_API_KEY` 부분에 복사한 키 붙여넣기

### 참고
- Anthropic API는 유료 서비스입니다
- 사용량에 따라 비용이 발생할 수 있으니 [가격 정책](https://www.anthropic.com/pricing) 확인 권장
- 무료 크레딧이 제공될 수 있습니다

---

## 4. 설정 파일 업데이트 방법

1. `.cursor/mcp.json` 파일 열기
2. 다음 부분을 실제 발급받은 값으로 교체:
   ```json
   "YOUR_SUPABASE_ACCESS_TOKEN"  → Supabase 토큰
   "YOUR_GITHUB_TOKEN"            → GitHub 토큰 (선택사항)
   "YOUR_ANTHROPIC_API_KEY"       → Anthropic API 키
   ```
3. 파일 저장
4. Cursor 재시작

---

## 5. 보안 주의사항

⚠️ **중요한 보안 팁:**

1. **토큰/키는 절대 공유하지 마세요**
   - GitHub에 커밋하지 마세요
   - `.cursor/mcp.json` 파일을 `.gitignore`에 추가 권장

2. **환경 변수 사용 고려**
   - 민감한 정보는 환경 변수로 관리하는 것이 더 안전합니다
   - 예: `$env:SUPABASE_TOKEN` (PowerShell)

3. **정기적인 토큰 갱신**
   - 주기적으로 토큰을 재생성하여 보안 강화

4. **최소 권한 원칙**
   - 필요한 최소한의 권한만 부여

---

## 6. 문제 해결

### 토큰이 작동하지 않는 경우

1. **토큰 형식 확인**
   - 공백이나 줄바꿈이 포함되지 않았는지 확인
   - 따옴표 제거 확인

2. **권한 확인**
   - GitHub: 필요한 권한이 모두 선택되었는지 확인
   - Supabase: 프로젝트에 대한 접근 권한 확인

3. **만료 확인**
   - 토큰이 만료되지 않았는지 확인
   - 필요시 새 토큰 생성

4. **Cursor 재시작**
   - 설정 변경 후 반드시 Cursor를 완전히 종료 후 재시작

---

## 7. 빠른 링크

- [Supabase 대시보드](https://app.supabase.com/)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [Anthropic API Keys](https://console.anthropic.com/settings/keys)
- [Cursor MCP 문서](https://docs.cursor.com/ko/context/mcp)

---

**문의사항이나 문제가 있으시면 각 서비스의 공식 문서를 참고하시기 바랍니다.**









