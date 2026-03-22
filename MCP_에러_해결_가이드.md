# MCP 에러 해결 가이드

## 문제 상황
Cursor가 여전히 잘못된 패키지명으로 MCP 서버를 실행하려고 시도하고 있습니다.

## 해결 방법

### 방법 1: Cursor UI에서 서버 비활성화 (권장)

1. **Cursor 설정 열기**
   - Cursor 메뉴 → `Settings` (또는 `Ctrl + ,`)

2. **MCP 섹션으로 이동**
   - 왼쪽 메뉴에서 `Features` → `Model Context Protocol` 선택
   - 또는 검색창에 "MCP" 입력

3. **에러가 발생하는 서버 비활성화**
   다음 서버들의 토글을 **OFF**로 변경:
   - ❌ `playwright` (잘못된 패키지명)
   - ❌ `supabase` (잘못된 패키지명 - UI 설정)
   - ❌ `chrome-devtools` (패키지 없음)
   - ❌ `github` (잘못된 패키지명)
   - ❌ `sequential-thinking-tools` (잘못된 패키지명)
   - ❌ `task-master-ai` (잘못된 패키지명 - UI 설정)

4. **정상 작동하는 서버만 활성화**
   다음 서버들은 `.cursor/mcp.json`에 올바르게 설정되어 있으므로 **ON** 유지:
   - ✅ `memory`
   - ✅ `supabase` (프로젝트 설정)
   - ✅ `filesystem`
   - ✅ `task-master-ai` (프로젝트 설정)

### 방법 2: Cursor 완전 재시작

1. **모든 Cursor 창 닫기**
   - 모든 Cursor 창을 닫습니다
   - 작업 관리자에서 `Cursor` 프로세스가 완전히 종료되었는지 확인

2. **Cursor 재시작**
   - Cursor를 다시 실행합니다
   - 프로젝트를 다시 엽니다

3. **MCP 서버 상태 확인**
   - 설정 → MCP에서 서버 상태 확인
   - 에러가 사라졌는지 확인

### 방법 3: 프로젝트 설정 확인

현재 `.cursor/mcp.json` 파일은 올바르게 설정되어 있습니다:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--access-token",
        "YOUR_SUPABASE_ACCESS_TOKEN"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "ALLOWED_DIRECTORIES": "C:\\Users\\dbslg\\projects"
      }
    },
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY"
      }
    }
  }
}
```

## 문제 원인

Cursor는 두 가지 설정 소스를 사용합니다:
1. **프로젝트 설정** (`.cursor/mcp.json`) - ✅ 올바름
2. **UI 설정** (Cursor 내부 저장소) - ❌ 잘못된 패키지명 사용

UI 설정이 프로젝트 설정보다 우선순위가 높아서 에러가 발생합니다.

## 확인 사항

### 정상 작동하는 패키지명
- ✅ `@modelcontextprotocol/server-memory`
- ✅ `@modelcontextprotocol/server-filesystem`
- ✅ `@supabase/mcp-server-supabase`
- ✅ `task-master-ai`

### 존재하지 않는 패키지명 (에러 발생)
- ❌ `@modelcontextprotocol/server-playwright` → 실제: `@playwright/mcp`
- ❌ `@modelcontextprotocol/server-supabase` → 실제: `@supabase/mcp-server-supabase`
- ❌ `@modelcontextprotocol/server-chrome-devtools` → 패키지 없음
- ❌ `@modelcontextprotocol/server-task-master-ai` → 실제: `task-master-ai`
- ❌ `@smithery-ai/server-github` → 패키지 없음
- ❌ `@smithery-ai/server-sequential-thinking-tools` → 패키지 없음

## 추가 서버가 필요한 경우

필요한 서버를 추가하려면:

1. **Playwright 추가** (브라우저 자동화)
   ```json
   "playwright": {
     "command": "npx",
     "args": ["-y", "@playwright/mcp"]
   }
   ```

2. **GitHub 추가** (정확한 패키지명 확인 필요)
   - 현재 정확한 패키지명을 찾을 수 없음
   - 필요시 별도로 확인 필요

## 최종 확인

1. ✅ `.cursor/mcp.json` 파일이 올바른 형식
2. ✅ 정상 작동하는 4개 서버만 설정됨
3. ⚠️ Cursor UI에서 잘못된 서버 비활성화 필요
4. ⚠️ Cursor 완전 재시작 필요

## 문제가 지속되는 경우

1. Cursor 완전 종료 후 재시작
2. MCP 로그에서 구체적인 에러 메시지 확인
3. Cursor 설정에서 모든 MCP 서버 비활성화 후 하나씩 활성화하며 테스트





