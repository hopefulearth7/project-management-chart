-- 확장된 테스트 데이터 삽입 스크립트
-- 프로젝트 10개, 사용자 데이터, WBS 데이터 포함

-- 사용자 데이터 (입사일 포함)
INSERT INTO "user" (email, password_hash, name, role, created_at) VALUES
('admin@example.com', 'admin123', '관리자', 'admin', '2020-01-15'),
('user@example.com', 'user123', '일반사용자', 'user', '2021-03-20'),
('kim@example.com', 'password123', '김철수', 'user', '2021-05-10'),
('lee@example.com', 'password123', '이영희', 'user', '2021-07-01'),
('park@example.com', 'password123', '박민수', 'user', '2022-01-15'),
('choi@example.com', 'password123', '최지영', 'user', '2022-03-20'),
('jung@example.com', 'password123', '정대현', 'user', '2022-06-01'),
('han@example.com', 'password123', '한소영', 'user', '2023-01-10'),
('yoon@example.com', 'password123', '윤성호', 'user', '2023-04-15'),
('shin@example.com', 'password123', '신미래', 'user', '2023-09-01')
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

-- 프로젝트 10개 생성
INSERT INTO project (name, description, start_date, end_date, status, expected_gain, created_by) VALUES
('웹사이트 리뉴얼 프로젝트', '기존 웹사이트를 모던한 디자인으로 전면 개편하여 사용자 경험을 향상시키는 프로젝트입니다. 반응형 디자인과 성능 최적화를 포함합니다.', 
 '2024-01-01', '2024-06-30', 'in-progress', 10000000, 1),
('모바일 앱 개발', 'iOS 및 Android 플랫폼을 위한 새로운 모바일 애플리케이션을 개발하여 고객 서비스를 개선하고 접근성을 높입니다.', 
 '2024-02-01', '2024-08-31', 'in-progress', 15000000, 1),
('데이터 분석 시스템 구축', '빅데이터를 활용한 분석 시스템을 구축하여 비즈니스 인사이트를 제공하고 의사결정을 지원합니다.', 
 '2024-03-01', '2024-12-31', 'in-progress', 20000000, 1),
('클라우드 마이그레이션', '기존 온프레미스 인프라를 AWS 클라우드 환경으로 전환하여 비용을 절감하고 확장성을 확보합니다.', 
 '2024-01-15', '2024-09-30', 'in-progress', 12000000, 1),
('AI 챗봇 서비스', '고객 문의를 자동으로 처리하는 AI 기반 챗봇을 개발하여 고객 서비스 효율성을 향상시킵니다.', 
 '2024-04-01', '2024-10-31', 'planning', 8000000, 1),
('전자상거래 플랫폼', '온라인 쇼핑몰 플랫폼을 구축하여 새로운 수익원을 창출하고 고객 접점을 확대합니다.', 
 '2024-05-01', '2024-11-30', 'planning', 25000000, 1),
('보안 강화 프로젝트', '기존 시스템의 보안 취약점을 개선하고 새로운 보안 프로토콜을 도입하여 데이터 보호를 강화합니다.', 
 '2024-03-15', '2024-09-15', 'in-progress', 15000000, 1),
('고객 관리 시스템(CRM)', '고객 정보를 통합 관리하고 마케팅 자동화 기능을 제공하는 CRM 시스템을 구축합니다.', 
 '2024-06-01', '2024-12-31', 'planning', 18000000, 1),
('IoT 디바이스 연동', '스마트 디바이스와 연동하여 실시간 데이터 수집 및 모니터링 기능을 제공하는 시스템을 개발합니다.', 
 '2024-07-01', '2025-01-31', 'planning', 22000000, 1),
('마이크로서비스 아키텍처 전환', '모놀리식 애플리케이션을 마이크로서비스 아키텍처로 전환하여 유지보수성과 확장성을 개선합니다.', 
 '2024-08-01', '2025-02-28', 'planning', 30000000, 1)
ON CONFLICT DO NOTHING;

-- 프로젝트별 WBS 데이터 생성
-- 프로젝트 1: 웹사이트 리뉴얼 프로젝트
WITH project1 AS (SELECT id FROM project WHERE name = '웹사이트 리뉴얼 프로젝트' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    '요구사항 분석',
    '프로젝트 요구사항 수집 및 분석',
    1,
    '2024-01-01',
    '2024-01-15',
    'completed',
    100,
    2,
    80
FROM project1 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '2.0',
    '디자인',
    'UI/UX 디자인 작업',
    1,
    '2024-01-16',
    '2024-02-28',
    'in-progress',
    60,
    3,
    200
FROM project1 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '3.0',
    '개발',
    '프론트엔드 및 백엔드 개발',
    1,
    '2024-03-01',
    '2024-05-31',
    'in-progress',
    40,
    4,
    600
FROM project1 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '4.0',
    '테스트 및 배포',
    'QA 테스트 및 프로덕션 배포',
    1,
    '2024-06-01',
    '2024-06-30',
    'not-started',
    0,
    5,
    120
FROM project1 p;

-- 프로젝트 2: 모바일 앱 개발
WITH project2 AS (SELECT id FROM project WHERE name = '모바일 앱 개발' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    '기획 및 설계',
    '앱 기획 및 기능 설계',
    1,
    '2024-02-01',
    '2024-02-28',
    'completed',
    100,
    2,
    100
FROM project2 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '2.0',
    'iOS 개발',
    'iOS 앱 개발',
    1,
    '2024-03-01',
    '2024-06-30',
    'in-progress',
    50,
    3,
    500
FROM project2 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '3.0',
    'Android 개발',
    'Android 앱 개발',
    1,
    '2024-03-01',
    '2024-06-30',
    'in-progress',
    45,
    4,
    500
FROM project2 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '4.0',
    '통합 테스트',
    '크로스 플랫폼 테스트',
    1,
    '2024-07-01',
    '2024-08-31',
    'not-started',
    0,
    5,
    200
FROM project2 p;

-- 프로젝트 3: 데이터 분석 시스템 구축
WITH project3 AS (SELECT id FROM project WHERE name = '데이터 분석 시스템 구축' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    '데이터 수집 파이프라인 구축',
    '다양한 소스에서 데이터를 수집하는 파이프라인 구축',
    1,
    '2024-03-01',
    '2024-05-31',
    'in-progress',
    70,
    6,
    400
FROM project3 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '2.0',
    '데이터 저장소 설계',
    '데이터 웨어하우스 설계 및 구축',
    1,
    '2024-04-01',
    '2024-06-30',
    'in-progress',
    50,
    7,
    300
FROM project3 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '3.0',
    '분석 모델 개발',
    '머신러닝 모델 개발 및 학습',
    1,
    '2024-07-01',
    '2024-10-31',
    'not-started',
    0,
    8,
    600
FROM project3 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '4.0',
    '대시보드 개발',
    '비즈니스 인사이트 대시보드 개발',
    1,
    '2024-11-01',
    '2024-12-31',
    'not-started',
    0,
    9,
    300
FROM project3 p;

-- 프로젝트 4: 클라우드 마이그레이션
WITH project4 AS (SELECT id FROM project WHERE name = '클라우드 마이그레이션' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    '현재 인프라 분석',
    '기존 인프라 구조 분석 및 마이그레이션 계획 수립',
    1,
    '2024-01-15',
    '2024-02-28',
    'completed',
    100,
    2,
    120
FROM project4 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '2.0',
    '클라우드 환경 구축',
    'AWS 인프라 구축 및 설정',
    1,
    '2024-03-01',
    '2024-05-31',
    'in-progress',
    60,
    3,
    400
FROM project4 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '3.0',
    '애플리케이션 마이그레이션',
    '애플리케이션을 클라우드로 이전',
    1,
    '2024-06-01',
    '2024-08-31',
    'in-progress',
    30,
    4,
    500
FROM project4 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '4.0',
    '테스트 및 최적화',
    '성능 테스트 및 비용 최적화',
    1,
    '2024-09-01',
    '2024-09-30',
    'not-started',
    0,
    5,
    150
FROM project4 p;

-- 프로젝트 5: AI 챗봇 서비스
WITH project5 AS (SELECT id FROM project WHERE name = 'AI 챗봇 서비스' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    '자연어 처리 모델 학습',
    '대화 데이터를 활용한 NLP 모델 학습',
    1,
    '2024-04-01',
    '2024-06-30',
    'not-started',
    0,
    6,
    400
FROM project5 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '2.0',
    '챗봇 엔진 개발',
    '대화 관리 및 응답 생성 엔진 개발',
    1,
    '2024-07-01',
    '2024-09-30',
    'not-started',
    0,
    7,
    500
FROM project5 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '3.0',
    '통합 및 배포',
    '기존 시스템과 통합 및 배포',
    1,
    '2024-10-01',
    '2024-10-31',
    'not-started',
    0,
    8,
    150
FROM project5 p;

-- 프로젝트 6-10도 간단한 WBS 추가
WITH project6 AS (SELECT id FROM project WHERE name = '전자상거래 플랫폼' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    '플랫폼 설계',
    '전자상거래 플랫폼 아키텍처 설계',
    1,
    '2024-05-01',
    '2024-06-30',
    'not-started',
    0,
    2,
    200
FROM project6 p;

WITH project7 AS (SELECT id FROM project WHERE name = '보안 강화 프로젝트' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    '보안 취약점 분석',
    '현재 시스템의 보안 취약점 분석',
    1,
    '2024-03-15',
    '2024-04-30',
    'in-progress',
    70,
    3,
    200
FROM project7 p
UNION ALL
SELECT 
    p.id,
    NULL,
    '2.0',
    '보안 패치 적용',
    '보안 패치 및 업데이트 적용',
    1,
    '2024-05-01',
    '2024-07-31',
    'in-progress',
    40,
    4,
    400
FROM project7 p;

WITH project8 AS (SELECT id FROM project WHERE name = '고객 관리 시스템(CRM)' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    'CRM 요구사항 정의',
    'CRM 시스템 요구사항 수집 및 정의',
    1,
    '2024-06-01',
    '2024-06-30',
    'not-started',
    0,
    2,
    100
FROM project8 p;

WITH project9 AS (SELECT id FROM project WHERE name = 'IoT 디바이스 연동' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    'IoT 프로토콜 설계',
    '디바이스 통신 프로토콜 설계',
    1,
    '2024-07-01',
    '2024-08-31',
    'not-started',
    0,
    6,
    300
FROM project9 p;

WITH project10 AS (SELECT id FROM project WHERE name = '마이크로서비스 아키텍처 전환' LIMIT 1)
INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
SELECT 
    p.id,
    NULL,
    '1.0',
    '마이크로서비스 설계',
    '서비스 분리 및 아키텍처 설계',
    1,
    '2024-08-01',
    '2024-09-30',
    'not-started',
    0,
    7,
    400
FROM project10 p;



