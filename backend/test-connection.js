// 데이터베이스 연결 테스트 스크립트
require('dotenv').config();

// DATABASE_URL에서 따옴표 제거
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
  dbUrl = dbUrl.slice(1, -1);
}
if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
  dbUrl = dbUrl.slice(1, -1);
}

console.log('=== DATABASE_URL 파싱 테스트 ===');
console.log('원본:', process.env.DATABASE_URL);
console.log('파싱 후:', dbUrl);
console.log('');

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: false
});

pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ 데이터베이스 연결 성공');
    return pool.query('SELECT COUNT(*) as count FROM project');
  })
  .then((result) => {
    console.log(`✅ 프로젝트 개수: ${result.rows[0].count}개`);
    return pool.end();
  })
  .then(() => {
    console.log('\n✅ 모든 테스트 통과');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 오류:', error.message);
    console.error('Error code:', error.code);
    pool.end();
    process.exit(1);
  });



