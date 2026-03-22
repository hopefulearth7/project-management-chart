// 급여 테이블 스키마 업데이트 스크립트
const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const dbUrl = process.env.DATABASE_URL?.replace(/^["']|["']$/g, '') || '';
const pool = new Pool({ connectionString: dbUrl });

async function updateSchema() {
  try {
    console.log('데이터베이스 연결 중...');
    await pool.query('SELECT NOW()');
    console.log('✅ 데이터베이스 연결 성공');

    // 스키마 업데이트 SQL 실행
    const sql = `
      ALTER TABLE salary 
      ADD COLUMN IF NOT EXISTS hourly_salary DECIMAL(12,2),
      ADD COLUMN IF NOT EXISTS daily_salary DECIMAL(12,2),
      ADD COLUMN IF NOT EXISTS annual_salary DECIMAL(12,2);

      UPDATE salary 
      SET 
        annual_salary = monthly_salary * 12,
        daily_salary = monthly_salary / 20,
        hourly_salary = (monthly_salary / 20) / 8
      WHERE annual_salary IS NULL;
    `;

    await pool.query(sql);
    console.log('✅ 급여 테이블 스키마 업데이트 완료');

    // 확인
    const result = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'salary\'');
    console.log('급여 테이블 컬럼:', result.rows.map(r => r.column_name).join(', '));

    await pool.end();
    console.log('완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error.message);
    console.error(error.stack);
    await pool.end();
    process.exit(1);
  }
}

updateSchema();



