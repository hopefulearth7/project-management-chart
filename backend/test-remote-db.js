// 원격 데이터베이스 연결 테스트
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a.virginia-postgres.render.com/project_management_jgvj';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📍 Database:', DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));
    
    // 1. 연결 테스트
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful');
    console.log('Time:', result.rows[0].now);
    
    // 2. 테이블 존재 확인
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\n📋 Tables found:', tablesResult.rows.length);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 3. projects 테이블 확인
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects');
    console.log('\n📁 Projects count:', projectsCount.rows[0].count);
    
    // 4. users 테이블 확인
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log('👥 Users count:', usersCount.rows[0].count);
    
    // 5. roles 테이블 확인
    const rolesCount = await pool.query('SELECT COUNT(*) FROM roles');
    console.log('👔 Roles count:', rolesCount.rows[0].count);
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

testConnection();





