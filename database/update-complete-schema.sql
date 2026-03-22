-- 전체 스키마 업데이트 스크립트
-- 누락된 필드 및 테이블을 추가하는 통합 마이그레이션

-- 1. user 테이블에 인사 정보 필드 추가
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS employment_start_date DATE,
ADD COLUMN IF NOT EXISTS employment_end_date DATE,
ADD COLUMN IF NOT EXISTS actual_annual_salary DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20) DEFAULT 'active';

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_employment_status ON "user"(employment_status);
CREATE INDEX IF NOT EXISTS idx_user_employment_dates ON "user"(employment_start_date, employment_end_date);

-- 2. admin_settings 테이블 생성
CREATE TABLE IF NOT EXISTS admin_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- 초기 admin_settings 데이터 (접근 코드)
INSERT INTO admin_settings (key, value, description) VALUES
('admin_access_code', '1234', '관리자 페이지 접근 코드 (변경 가능)')
ON CONFLICT (key) DO NOTHING;

-- 3. wbs 테이블에 original_end_date 필드 추가 (기간 연장 추적)
ALTER TABLE wbs 
ADD COLUMN IF NOT EXISTS original_end_date DATE;

-- 기존 데이터에 대해 현재 end_date를 original_end_date로 복사
UPDATE wbs 
SET original_end_date = end_date 
WHERE original_end_date IS NULL AND end_date IS NOT NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_wbs_original_end_date ON wbs(original_end_date);

-- 4. 확인 쿼리
SELECT 
    'user 테이블 필드 확인' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user' 
AND column_name IN ('employment_start_date', 'employment_end_date', 'actual_annual_salary', 'employment_status')
ORDER BY column_name;

SELECT 
    'admin_settings 테이블 확인' as check_type,
    COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_name = 'admin_settings';

SELECT 
    'wbs original_end_date 확인' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'wbs' 
AND column_name = 'original_end_date';

-- 완료 메시지
SELECT '✅ 스키마 업데이트 완료!' as status;





