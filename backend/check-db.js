// 데이터베이스 상태 확인 스크립트
const { Pool } = require('pg');
require('dotenv').config();

async function checkDatabase() {
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
    const projects = await pool.query('SELECT COUNT(*) as count FROM project');
    const users = await pool.query('SELECT COUNT(*) as count FROM "user"');
    const wbs = await pool.query('SELECT COUNT(*) as count FROM wbs');
    
    console.log('\n=== 데이터베이스 상태 ===');
    console.log(`프로젝트: ${projects.rows[0].count}개`);
    console.log(`사용자: ${users.rows[0].count}개`);
    console.log(`WBS 항목: ${wbs.rows[0].count}개`);

    // 프로젝트 목록
    const projectList = await pool.query('SELECT id, name FROM project ORDER BY id');
    console.log('\n프로젝트 목록:');
    projectList.rows.forEach(p => {
      console.log(`  ${p.id}. ${p.name}`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ 오류:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkDatabase();



