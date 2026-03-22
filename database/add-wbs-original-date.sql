-- WBS 테이블에 original_end_date 필드 추가
-- 기간 연장 여부를 추적하기 위한 필드

-- original_end_date 컬럼 추가 (처음 설정된 종료일)
ALTER TABLE wbs 
ADD COLUMN IF NOT EXISTS original_end_date DATE;

-- 기존 데이터에 대해 현재 end_date를 original_end_date로 복사
UPDATE wbs 
SET original_end_date = end_date 
WHERE original_end_date IS NULL AND end_date IS NOT NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_wbs_original_end_date ON wbs(original_end_date);

-- 확인
SELECT 
    'wbs 테이블에 original_end_date 필드 추가 완료' as status,
    COUNT(*) as total_tasks,
    COUNT(original_end_date) as tasks_with_original_date
FROM wbs;





