-- 테스트 데이터 삽입 스크립트

-- 사용자 데이터 (이미 존재하면 무시)
INSERT INTO "user" (email, password_hash, name, role) VALUES
('admin@example.com', 'admin123', '관리자', 'admin'),
('user@example.com', 'user123', '일반사용자', 'user')
ON CONFLICT (email) DO NOTHING;

-- 직급 데이터 (이미 존재하면 무시)
INSERT INTO role (name, level) VALUES
('사원', 1),
('대리', 2),
('과장', 3),
('차장', 4),
('부장', 5),
('이사', 6)
ON CONFLICT (name) DO NOTHING;

-- 급여 데이터 (각 직급별 월 급여)
INSERT INTO salary (role_id, monthly_salary, effective_date) 
SELECT 
    r.id,
    CASE r.level
        WHEN 1 THEN 3000000  -- 사원: 300만원
        WHEN 2 THEN 3500000  -- 대리: 350만원
        WHEN 3 THEN 4000000  -- 과장: 400만원
        WHEN 4 THEN 4500000  -- 차장: 450만원
        WHEN 5 THEN 5000000  -- 부장: 500만원
        WHEN 6 THEN 6000000  -- 이사: 600만원
    END,
    CURRENT_DATE
FROM role r
WHERE NOT EXISTS (
    SELECT 1 FROM salary s WHERE s.role_id = r.id AND s.effective_date <= CURRENT_DATE AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
);

-- 테스트 프로젝트 데이터
INSERT INTO project (name, description, start_date, end_date, status, expected_gain, created_by) VALUES
('웹사이트 리뉴얼 프로젝트', '기존 웹사이트를 모던한 디자인으로 전면 개편하는 프로젝트입니다.', 
 '2024-01-01', '2024-06-30', 'in-progress', 10000000, 1),
('모바일 앱 개발', '새로운 모바일 애플리케이션을 개발하여 고객 서비스를 개선합니다.', 
 '2024-02-01', '2024-08-31', 'planning', 15000000, 1),
('데이터 분석 시스템 구축', '빅데이터를 활용한 분석 시스템을 구축하여 비즈니스 인사이트를 제공합니다.', 
 '2024-03-01', '2024-12-31', 'in-progress', 20000000, 1),
('클라우드 마이그레이션', '기존 인프라를 클라우드 환경으로 전환하여 비용을 절감하고 확장성을 확보합니다.', 
 '2024-01-15', '2024-09-30', 'in-progress', 12000000, 1),
('AI 챗봇 서비스', '고객 문의를 자동으로 처리하는 AI 챗봇을 개발합니다.', 
 '2024-04-01', '2024-10-31', 'planning', 8000000, 1)
ON CONFLICT DO NOTHING;

-- 프로젝트 비용 데이터 (예시)
INSERT INTO cost (project_id, cost_type, category, amount, currency, start_date, description, created_by)
SELECT 
    p.id,
    'one-time',
    '개발 도구',
    500000,
    'USD',
    p.start_date,
    '초기 개발 도구 구매 비용',
    1
FROM project p
WHERE p.name = '웹사이트 리뉴얼 프로젝트'
LIMIT 1;

INSERT INTO cost (project_id, cost_type, category, amount, currency, start_date, end_date, recurrence, description, created_by)
SELECT 
    p.id,
    'recurring',
    '클라우드 서버',
    25000,
    'USD',
    p.start_date,
    p.end_date,
    'monthly',
    '월간 클라우드 서버 비용',
    1
FROM project p
WHERE p.name = '웹사이트 리뉴얼 프로젝트'
LIMIT 1;



