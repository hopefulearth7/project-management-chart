-- 급여 테이블에 시간/일/연봉 필드 추가
ALTER TABLE salary 
ADD COLUMN IF NOT EXISTS hourly_salary DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS daily_salary DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS annual_salary DECIMAL(12,2);

-- 기존 monthly_salary를 기준으로 자동 계산
UPDATE salary 
SET 
  annual_salary = monthly_salary * 12,
  daily_salary = monthly_salary / 20, -- 월 20일 기준
  hourly_salary = (monthly_salary / 20) / 8 -- 일 8시간 기준
WHERE annual_salary IS NULL;



