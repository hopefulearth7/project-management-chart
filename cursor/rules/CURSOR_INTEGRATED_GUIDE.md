# 🚀 Cursor 통합 활용 가이드

## 📋 개요
이 가이드는 Cursor에서 MCP(Model Context Protocol) 서버와 @agent/ 시스템을 효과적으로 활용하는 방법을 통합적으로 설명합니다.

---

## 🎯 MCP 서버 활용 가이드

### 1. 주요 MCP 서버별 활용 전략

#### 🌐 웹 자동화 및 테스트
- **playwright**: 웹 테스트, 브라우저 자동화, 스크린샷, 웹 스크래핑
- **chrome-devtools**: 성능 분석, 디버깅, 네트워크 모니터링, 개발자 도구

**호출 키워드**: `웹테스트`, `브라우저`, `자동화`, `성능분석`, `디버깅`

#### 💾 데이터 및 저장소
- **memory**: 지식 그래프 관리, 정보 기억, 컨텍스트 관리
- **supabase**: 데이터베이스 관리, SQL 쿼리, 데이터 마이그레이션
- **filesystem**: 파일 시스템 작업, 디렉토리 관리, 파일 읽기/쓰기

**호출 키워드**: `기억`, `저장`, `데이터베이스`, `SQL`, `파일`, `폴더`

#### 🔧 개발 및 협업
- **github**: 리포지토리 관리, 이슈/PR 생성, 코드 리뷰
- **sequential-thinking-tools**: 단계별 분석, 논리적 사고, 문제 해결
- **task-master-ai**: 작업 관리, 할 일 목록, 프로젝트 일정 관리

**호출 키워드**: `리포지토리`, `이슈`, `분석`, `단계별`, `작업관리`, `할일`

#### 🎨 디자인 및 UI/UX
- **figma-api**: UI/UX 디자인, 프로토타입, 디자인 시스템
- **Figma**: 피그마 파일 관리, 와이어프레임
- **figma-desktop**: 로컬 피그마 연동

**호출 키워드**: `디자인`, `UI`, `UX`, `프로토타입`, `피그마`

### 2. MCP 호출 패턴

#### 기본 호출 형식
```
[키워드] + [구체적 요청사항] + [MCP 서버명]
```

#### 실전 호출 예시
```markdown
# 웹 개발
"playwright로 로그인 기능을 자동화 테스트해줘"
"chrome-devtools로 페이지 성능을 분석해줘"

# 데이터 관리
"supabase로 사용자 테이블 구조를 확인해줘"
"memory에 이 프로젝트 설정을 저장해줘"

# 파일 작업
"filesystem으로 프로젝트 구조를 확인해줘"
"github로 새로운 이슈를 생성해줘"

# 분석 및 계획
"sequential-thinking-tools로 이 문제를 단계별로 분석해줘"
"task-master-ai로 프로젝트 작업을 관리해줘"
```

### 3. 워크플로우별 MCP 조합

#### 웹 개발 워크플로우
```
filesystem → playwright → chrome-devtools → memory
(코드 확인 → 테스트 → 성능 분석 → 결과 저장)
```

#### 데이터 분석 워크플로우
```
supabase → sequential-thinking-tools → task-master-ai → memory
(데이터 조회 → 논리적 분석 → 작업 계획 → 지식 저장)
```

#### 디자인 개발 워크플로우
```
figma → filesystem → github → memory
(디자인 → 코드 구현 → 버전 관리 → 문서화)
```

---

## 🤖 @agent/ 시스템 활용 가이드

### 1. 주요 에이전트별 역할

#### 📋 요구사항 및 분석
- **@requirements-analyst**: 요구사항 분석, 핵심 기능 추출
- **@system-architect**: 시스템 구조 및 아키텍처 설계
- **@solution-research-agent**: 솔루션 연구 및 기술 조사

#### 💻 개발 및 구현
- **@backend-code-generator**: 백엔드 API 및 서비스 로직 생성
- **@frontend-scaffold-generator**: 프론트엔드 초기 스캐폴딩
- **@python-expert**: 파이썬 기반 구현 및 코드 작성
- **@database-architect**: 데이터베이스 구조 설계 및 ERD 제안

#### 🔍 품질 보증 및 검증
- **@verification-agent**: 테스트 케이스 및 코드 검증
- **@senior-code-reviewer**: 코드 품질 검토 및 리팩토링
- **@test-automation-agent**: 자동화 테스트 구현
- **@debugging-agent**: 디버깅 및 문제 해결

#### 🎨 UI/UX 및 디자인
- **@ui-ux-validator-agent**: UI/UX 검증 및 개선
- **@component-finder-agent**: 컴포넌트 탐색 및 재사용

#### 🔧 도구 및 환경
- **@environment-setup-agent**: 개발 환경 설정
- **@tool-configuration-agent**: 도구 설정 및 구성
- **@port-conflict-resolution-agent**: 포트 충돌 해결

### 2. @agent/ 호출 방법

#### 기본 호출 형식
```
@agent-name [구체적 요청사항]
```

#### 실전 호출 예시
```markdown
# 요구사항 분석
@requirements-analyst 사용자 관리 시스템의 요구사항을 분석해줘

# 시스템 설계
@system-architect 마이크로서비스 아키텍처를 설계해줘

# 코드 생성
@backend-code-generator REST API 엔드포인트를 생성해줘
@frontend-scaffold-generator React 컴포넌트를 스캐폴딩해줘

# 품질 보증
@verification-agent 이 코드의 테스트 케이스를 작성해줘
@senior-code-reviewer 코드 리뷰를 진행해줘

# 문제 해결
@debugging-agent 이 오류를 디버깅해줘
@port-conflict-resolution-agent 포트 충돌을 해결해줘
```

### 3. 에이전트 조합 활용

#### 전체 개발 사이클
```
@requirements-analyst → @system-architect → @database-architect 
→ @backend-code-generator → @frontend-scaffold-generator 
→ @verification-agent → @senior-code-reviewer
```

#### 문제 해결 사이클
```
@debugging-agent → @solution-research-agent → @tool-configuration-agent
```

---

## 🔄 MCP + @agent/ 통합 활용

### 1. 통합 워크플로우 예시

#### 웹 애플리케이션 개발
```markdown
1. @requirements-analyst로 요구사항 분석
2. @system-architect로 시스템 설계
3. @database-architect로 DB 설계
4. supabase로 데이터베이스 구현
5. @backend-code-generator로 API 생성
6. @frontend-scaffold-generator로 UI 생성
7. playwright로 자동화 테스트
8. chrome-devtools로 성능 분석
9. memory에 개발 과정 저장
```

#### 문제 해결 및 디버깅
```markdown
1. @debugging-agent로 문제 분석
2. chrome-devtools로 성능/네트워크 확인
3. @solution-research-agent로 해결책 연구
4. filesystem으로 코드 수정
5. playwright로 수정사항 테스트
6. memory에 해결 과정 저장
```

### 2. 상황별 최적 조합

#### 🚀 새 프로젝트 시작
```
@requirements-analyst + @system-architect + @database-architect 
+ task-master-ai + memory
```

#### 🐛 버그 수정
```
@debugging-agent + chrome-devtools + @solution-research-agent 
+ filesystem + playwright
```

#### 🎨 UI/UX 개선
```
@ui-ux-validator-agent + figma + @frontend-scaffold-generator 
+ playwright + chrome-devtools
```

#### 📊 성능 최적화
```
chrome-devtools + playwright + @senior-code-reviewer 
+ filesystem + memory
```

---

## ⚡ 빠른 참조 가이드

### 자주 사용하는 MCP 조합
- **웹테스트**: playwright + chrome-devtools
- **데이터분석**: supabase + sequential-thinking-tools
- **파일관리**: filesystem + memory
- **프로젝트관리**: task-master-ai + github
- **디자인개발**: figma + filesystem

### 자주 사용하는 @agent/ 조합
- **개발시작**: @requirements-analyst + @system-architect
- **코드생성**: @backend-code-generator + @frontend-scaffold-generator
- **품질보증**: @verification-agent + @senior-code-reviewer
- **문제해결**: @debugging-agent + @solution-research-agent

### 긴급 상황 대응
- **오류 발생**: @debugging-agent + chrome-devtools
- **성능 문제**: playwright + chrome-devtools + @senior-code-reviewer
- **데이터 문제**: supabase + @database-architect
- **환경 문제**: @environment-setup-agent + @tool-configuration-agent

---

## 📈 활용 효과 극대화 팁

### 1. 연속성 있는 워크플로우 구축
- 각 도구의 결과를 다음 단계의 입력으로 활용
- 중간 결과를 memory에 저장하여 컨텍스트 유지

### 2. 반복 작업 자동화
- 자주 사용하는 조합을 패턴으로 정리
- 표준 워크플로우를 문서화하여 재사용

### 3. 지식 축적 및 활용
- 모든 중요한 결과를 memory에 저장
- 이전 경험을 바탕으로 더 나은 의사결정

### 4. 품질 보증 체계
- 개발 → 테스트 → 분석 → 개선의 사이클 구축
- 각 단계에서 적절한 도구 활용

---

## ⚠️ 주의사항

### 보안
- supabase, github 등은 개인키가 필요하므로 보안에 주의
- 민감한 정보는 memory에 저장하지 않기

### 권한
- filesystem은 지정된 디렉토리만 접근 가능
- figma-desktop은 로컬 서버가 실행 중이어야 함

### 네트워크
- 일부 MCP 서버는 인터넷 연결이 필요
- 오프라인 환경에서는 제한적 활용

---

이 통합 가이드를 참고하여 Cursor의 MCP와 @agent/ 시스템을 효과적으로 활용하세요! 🚀
