-- 프로젝트 관리 웹사이트 데이터베이스 스키마
-- PostgreSQL 15+

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS "user" (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_email ON "user"(email);

-- 직급 테이블
CREATE TABLE IF NOT EXISTS role (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    level INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 급여 테이블
CREATE TABLE IF NOT EXISTS salary (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES role(id) ON DELETE RESTRICT,
    monthly_salary DECIMAL(12,2) NOT NULL CHECK (monthly_salary >= 0),
    effective_date DATE NOT NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_salary_role_id ON salary(role_id);
CREATE INDEX idx_salary_effective_date ON salary(effective_date);

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS project (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'planning',
    expected_gain DECIMAL(15,2),
    created_by BIGINT REFERENCES "user"(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_created_by ON project(created_by);
CREATE INDEX idx_project_status ON project(status);

-- 프로젝트 멤버 테이블
CREATE TABLE IF NOT EXISTS project_member (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES role(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_member_project_id ON project_member(project_id);
CREATE INDEX idx_project_member_user_id ON project_member(user_id);

-- 시간 기록 테이블
CREATE TABLE IF NOT EXISTS time_entry (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    hours DECIMAL(5,2) NOT NULL CHECK (hours >= 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_time_entry_project_id ON time_entry(project_id);
CREATE INDEX idx_time_entry_user_id ON time_entry(user_id);
CREATE INDEX idx_time_entry_entry_date ON time_entry(entry_date);

-- 비용 테이블
CREATE TABLE IF NOT EXISTS cost (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    cost_type VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    start_date DATE,
    end_date DATE,
    recurrence VARCHAR(20),
    description TEXT,
    created_by BIGINT REFERENCES "user"(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cost_project_id ON cost(project_id);
CREATE INDEX idx_cost_cost_type ON cost(cost_type);
CREATE INDEX idx_cost_category ON cost(category);

-- 만족도 테이블
CREATE TABLE IF NOT EXISTS satisfaction (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_satisfaction_project_id ON satisfaction(project_id);
CREATE INDEX idx_satisfaction_user_id ON satisfaction(user_id);

-- ROI 계산 이력 테이블
CREATE TABLE IF NOT EXISTS roi_calculation (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    total_cost DECIMAL(15,2) NOT NULL,
    expected_gain DECIMAL(15,2) NOT NULL,
    roi_percentage DECIMAL(8,2) NOT NULL,
    calculation_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_roi_calculation_project_id ON roi_calculation(project_id);
CREATE INDEX idx_roi_calculation_date ON roi_calculation(calculation_date);

-- WBS (Work Breakdown Structure) 테이블
CREATE TABLE IF NOT EXISTS wbs (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES wbs(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'not-started',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    assigned_to BIGINT REFERENCES "user"(id) ON DELETE SET NULL,
    estimated_hours DECIMAL(10,2),
    actual_hours DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wbs_project_id ON wbs(project_id);
CREATE INDEX idx_wbs_parent_id ON wbs(parent_id);
CREATE INDEX idx_wbs_code ON wbs(code);

-- 관리자 설정 테이블
CREATE TABLE IF NOT EXISTS admin_settings (
    id BIGSERIAL PRIMARY KEY,
    admin_code VARCHAR(10) NOT NULL DEFAULT '1234',
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_settings_id ON admin_settings(id);

-- 초기 데이터: 직급
INSERT INTO role (name, level) VALUES
('사원', 1),
('대리', 2),
('과장', 3),
('차장', 4),
('부장', 5),
('이사', 6)
ON CONFLICT (name) DO NOTHING;

-- 초기 데이터: 관리자 계정 (비밀번호: admin123)
-- 실제로는 bcrypt로 해시화된 비밀번호를 사용해야 함
INSERT INTO "user" (email, password_hash, name, role) VALUES
('admin@example.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', '관리자', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 초기 데이터: 관리자 설정
INSERT INTO admin_settings (admin_code, company_name) VALUES
('1234', '기본 회사')
ON CONFLICT DO NOTHING;

