# ERD (Entity Relationship Diagram)
## 프로젝트 관리 웹사이트 데이터베이스 설계

**버전**: 1.0  
**작성일**: 2025-12-23  
**데이터베이스**: PostgreSQL (로컬)

---

## 1. 엔티티 관계도 개요

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│   User   │─────────│  Project │─────────│   Cost   │
└──────────┘         └──────────┘         └──────────┘
     │                    │                    │
     │                    │                    │
     │              ┌─────┴─────┐              │
     │              │           │              │
     │         ┌────▼───┐  ┌───▼────┐         │
     │         │TimeEntry│  │Satisfac│         │
     │         └────────┘  │  tion  │         │
     │                      └────────┘         │
     │                                           │
┌────▼────┐                              ┌─────▼────┐
│  Role   │──────────────────────────────│  Salary  │
└─────────┘                              └──────────┘
```

---

## 2. 엔티티 상세 설계

### 2.1 User (사용자)

**목적**: 시스템 사용자 정보 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 사용자 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| password_hash | VARCHAR(255) | NOT NULL | 암호화된 비밀번호 |
| name | VARCHAR(100) | NOT NULL | 이름 |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'user' | 역할 (user/admin) |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_user_email` ON email

---

### 2.2 Role (직급)

**목적**: 직급 정보 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 직급 ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 직급명 (사원, 대리, 과장 등) |
| level | INTEGER | NOT NULL | 직급 레벨 (1~10) |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**초기 데이터**:
- 사원 (level: 1)
- 대리 (level: 2)
- 과장 (level: 3)
- 차장 (level: 4)
- 부장 (level: 5)
- 이사 (level: 6)

---

### 2.3 Salary (급여)

**목적**: 직급별 월 급여 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 급여 ID |
| role_id | BIGINT | FOREIGN KEY → Role.id | 직급 ID |
| monthly_salary | DECIMAL(12,2) | NOT NULL | 월 급여 |
| effective_date | DATE | NOT NULL | 적용 시작일 |
| end_date | DATE | NULL | 적용 종료일 (NULL이면 현재 유효) |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_salary_role_id` ON role_id
- `idx_salary_effective_date` ON effective_date

---

### 2.4 Project (프로젝트)

**목적**: 프로젝트 기본 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 프로젝트 ID |
| name | VARCHAR(255) | NOT NULL | 프로젝트명 |
| description | TEXT | NULL | 프로젝트 설명 |
| start_date | DATE | NOT NULL | 시작일 |
| end_date | DATE | NULL | 종료일 (예상) |
| status | VARCHAR(20) | DEFAULT 'planning' | 상태 (planning/in-progress/completed/cancelled) |
| expected_gain | DECIMAL(15,2) | NULL | 예상 수익 (G) |
| created_by | BIGINT | FOREIGN KEY → User.id | 생성자 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_project_created_by` ON created_by
- `idx_project_status` ON status

---

### 2.5 ProjectMember (프로젝트 멤버)

**목적**: 프로젝트에 투입된 인원 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 멤버 ID |
| project_id | BIGINT | FOREIGN KEY → Project.id | 프로젝트 ID |
| user_id | BIGINT | FOREIGN KEY → User.id | 사용자 ID |
| role_id | BIGINT | FOREIGN KEY → Role.id | 직급 ID |
| start_date | DATE | NOT NULL | 투입 시작일 |
| end_date | DATE | NULL | 투입 종료일 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스**:
- `idx_project_member_project_id` ON project_id
- `idx_project_member_user_id` ON user_id
- UNIQUE (project_id, user_id)

---

### 2.6 TimeEntry (시간 기록)

**목적**: 프로젝트별 투입 시간 기록

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 시간 기록 ID |
| project_id | BIGINT | FOREIGN KEY → Project.id | 프로젝트 ID |
| user_id | BIGINT | FOREIGN KEY → User.id | 사용자 ID |
| entry_date | DATE | NOT NULL | 기록일 |
| hours | DECIMAL(5,2) | NOT NULL | 투입 시간 (시간 단위) |
| description | TEXT | NULL | 작업 내용 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_time_entry_project_id` ON project_id
- `idx_time_entry_user_id` ON user_id
- `idx_time_entry_entry_date` ON entry_date

---

### 2.7 Cost (비용)

**목적**: 프로젝트 비용 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 비용 ID |
| project_id | BIGINT | FOREIGN KEY → Project.id | 프로젝트 ID |
| cost_type | VARCHAR(20) | NOT NULL | 비용 유형 (one-time/recurring/long-term) |
| category | VARCHAR(100) | NOT NULL | 비용 카테고리 (인프라/라이선스/인건비 등) |
| amount | DECIMAL(15,2) | NOT NULL | 금액 |
| currency | VARCHAR(3) | DEFAULT 'USD' | 통화 |
| start_date | DATE | NULL | 적용 시작일 |
| end_date | DATE | NULL | 적용 종료일 (recurring인 경우) |
| recurrence | VARCHAR(20) | NULL | 반복 주기 (monthly/yearly) |
| description | TEXT | NULL | 비용 설명 |
| created_by | BIGINT | FOREIGN KEY → User.id | 생성자 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_cost_project_id` ON project_id
- `idx_cost_cost_type` ON cost_type
- `idx_cost_category` ON category

---

### 2.8 Satisfaction (만족도)

**목적**: 프로젝트 만족도 평가

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 만족도 ID |
| project_id | BIGINT | FOREIGN KEY → Project.id | 프로젝트 ID |
| user_id | BIGINT | FOREIGN KEY → User.id | 평가자 ID |
| rating | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | 만족도 점수 (1~5) |
| comment | TEXT | NULL | 평가 코멘트 |
| created_at | TIMESTAMP | DEFAULT NOW() | 평가일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_satisfaction_project_id` ON project_id
- `idx_satisfaction_user_id` ON user_id
- UNIQUE (project_id, user_id)

---

### 2.9 ROICalculation (ROI 계산 이력)

**목적**: ROI 계산 결과 저장

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 계산 ID |
| project_id | BIGINT | FOREIGN KEY → Project.id | 프로젝트 ID |
| total_cost | DECIMAL(15,2) | NOT NULL | 총 비용 (C) |
| expected_gain | DECIMAL(15,2) | NOT NULL | 예상 수익 (G) |
| roi_percentage | DECIMAL(8,2) | NOT NULL | ROI 퍼센트 |
| calculation_date | TIMESTAMP | DEFAULT NOW() | 계산일시 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스**:
- `idx_roi_calculation_project_id` ON project_id
- `idx_roi_calculation_date` ON calculation_date

---

## 3. 관계 (Relationships)

### 3.1 주요 관계

1. **User ↔ Project**: 다대다 (ProjectMember를 통한 중간 테이블)
2. **Role ↔ Salary**: 일대다 (한 직급에 여러 급여 이력)
3. **Project ↔ Cost**: 일대다 (한 프로젝트에 여러 비용)
4. **Project ↔ TimeEntry**: 일대다 (한 프로젝트에 여러 시간 기록)
5. **Project ↔ Satisfaction**: 일대다 (한 프로젝트에 여러 만족도 평가)
6. **User ↔ TimeEntry**: 일대다 (한 사용자가 여러 시간 기록)
7. **User ↔ Satisfaction**: 일대다 (한 사용자가 여러 만족도 평가)

---

## 4. 제약조건 (Constraints)

### 4.1 외래키 제약조건
- `Project.created_by` → `User.id` (ON DELETE SET NULL)
- `ProjectMember.project_id` → `Project.id` (ON DELETE CASCADE)
- `ProjectMember.user_id` → `User.id` (ON DELETE CASCADE)
- `ProjectMember.role_id` → `Role.id` (ON DELETE RESTRICT)
- `Salary.role_id` → `Role.id` (ON DELETE RESTRICT)
- `TimeEntry.project_id` → `Project.id` (ON DELETE CASCADE)
- `TimeEntry.user_id` → `User.id` (ON DELETE CASCADE)
- `Cost.project_id` → `Project.id` (ON DELETE CASCADE)
- `Cost.created_by` → `User.id` (ON DELETE SET NULL)
- `Satisfaction.project_id` → `Project.id` (ON DELETE CASCADE)
- `Satisfaction.user_id` → `User.id` (ON DELETE CASCADE)
- `ROICalculation.project_id` → `Project.id` (ON DELETE CASCADE)

### 4.2 체크 제약조건
- `Satisfaction.rating`: 1 이상 5 이하
- `Cost.amount`: 0 이상
- `Salary.monthly_salary`: 0 이상
- `TimeEntry.hours`: 0 이상

---

## 5. 초기 데이터 (Seed Data)

### 5.1 Role (직급)
```sql
INSERT INTO role (name, level) VALUES
('사원', 1),
('대리', 2),
('과장', 3),
('차장', 4),
('부장', 5),
('이사', 6);
```

### 5.2 Admin User (관리자)
```sql
-- 비밀번호: admin123 (실제로는 해시화 필요)
INSERT INTO user (email, password_hash, name, role) VALUES
('admin@example.com', '$2b$10$...', '관리자', 'admin');
```

---

## 6. 데이터베이스 스키마 생성 SQL

전체 스키마 생성 SQL은 `docs/sql/schema.sql` 파일에 별도로 작성됩니다.

---

**다음 단계**: 워크플로우별 MD 파일 생성



