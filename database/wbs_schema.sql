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



