-- 프로젝트 예산 항목 관리 테이블
-- PostgreSQL 15+

-- 프로젝트 예산 항목 테이블
CREATE TABLE IF NOT EXISTS project_budget_item (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    labor_hours DECIMAL(10,2) DEFAULT 0 CHECK (labor_hours >= 0),
    labor_rate DECIMAL(12,2) DEFAULT 0 CHECK (labor_rate >= 0),
    materials_units DECIMAL(10,2) DEFAULT 0 CHECK (materials_units >= 0),
    materials_unit_price DECIMAL(12,2) DEFAULT 0 CHECK (materials_unit_price >= 0),
    fixed_cost DECIMAL(15,2) DEFAULT 0 CHECK (fixed_cost >= 0),
    actual_budget DECIMAL(15,2) DEFAULT 0 CHECK (actual_budget >= 0),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_budget_item_project_id ON project_budget_item(project_id);
CREATE INDEX idx_project_budget_item_category ON project_budget_item(category);
CREATE INDEX idx_project_budget_item_display_order ON project_budget_item(display_order);

-- target_budget은 계산된 값이므로 컬럼에 저장하지 않고 뷰 또는 계산으로 처리
-- target_budget = (labor_hours * labor_rate) + (materials_units * materials_unit_price) + fixed_cost





