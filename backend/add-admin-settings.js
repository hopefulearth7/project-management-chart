// 관리자 설정 테이블 추가 스크립트
const { Pool } = require('pg');
require('dotenv').config();

async function addAdminSettings() {
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

  try {
    console.log('=== 관리자 설정 테이블 추가 ===\n');

    // 관리자 설정 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id BIGSERIAL PRIMARY KEY,
        admin_code VARCHAR(10) NOT NULL DEFAULT '1234',
        company_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ admin_settings 테이블이 생성되었습니다.');

    // 초기 데이터 삽입 (없는 경우만)
    const checkResult = await pool.query('SELECT COUNT(*) as count FROM admin_settings');
    if (parseInt(checkResult.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO admin_settings (admin_code, company_name)
        VALUES ('1234', '기본 회사')
      `);
      console.log('✅ 초기 관리자 코드가 설정되었습니다. (기본값: 1234)');
    } else {
      console.log('✅ 관리자 설정이 이미 존재합니다.');
    }

    console.log('\n=== 완료 ===');
  } catch (error) {
    console.error('❌ 오류:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

addAdminSettings();



