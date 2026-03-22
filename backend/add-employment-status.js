// 사용자 테이블에 employment_status 컬럼 추가 스크립트

require('dotenv').config();
const { Pool } = require('pg');

let dbUrl = process.env.DATABASE_URL;
if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
  dbUrl = dbUrl.slice(1, -1);
}
if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
  dbUrl = dbUrl.slice(1, -1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: false
});

async function addEmploymentStatus() {
  try {
    console.log('=== 사용자 테이블에 employment_status 컬럼 추가 ===\n');
    
    // 컬럼 존재 여부 확인
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user' AND column_name = 'employment_status'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ employment_status 컬럼이 이미 존재합니다.');
    } else {
      // 컬럼 추가
      await pool.query(`
        ALTER TABLE "user" 
        ADD COLUMN employment_status VARCHAR(20) DEFAULT 'active' 
        CHECK (employment_status IN ('active', 'resigned', 'on-leave'))
      `);
      console.log('✅ employment_status 컬럼이 추가되었습니다.');
    }
    
    // 기존 데이터 업데이트 (employment_end_date가 있으면 resigned로 설정)
    await pool.query(`
      UPDATE "user" 
      SET employment_status = CASE 
        WHEN employment_end_date IS NOT NULL AND employment_end_date < CURRENT_DATE THEN 'resigned'
        ELSE 'active'
      END
      WHERE employment_status IS NULL OR employment_status = 'active'
    `);
    console.log('✅ 기존 데이터가 업데이트되었습니다.');
    
    console.log('\n=== 완료 ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addEmploymentStatus();



