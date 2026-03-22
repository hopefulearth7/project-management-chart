-- 사용자 테이블에 재직 기간 및 실연봉 필드 추가
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS employment_start_date DATE,
ADD COLUMN IF NOT EXISTS employment_end_date DATE,
ADD COLUMN IF NOT EXISTS actual_annual_salary DECIMAL(15,2);



