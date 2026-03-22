// 데이터베이스 연결 확인 스크립트
require('dotenv').config();

let dbUrl = process.env.DATABASE_URL || '';
console.log('원본 DATABASE_URL:', dbUrl);

if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
  dbUrl = dbUrl.slice(1, -1);
}
if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
  dbUrl = dbUrl.slice(1, -1);
}

console.log('파싱 후 DATABASE_URL:', dbUrl.replace(/:([^:@]+)@/, ':****@'));

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
    console.error('\n문제 해결 방법:');
    console.error('1. PostgreSQL 서버가 실행 중인지 확인');
    console.error('2. DATABASE_URL이 올바른지 확인');
    console.error('3. 사용자 hopefulearth가 존재하는지 확인');
    pool.end();
    process.exit(1);
  });



