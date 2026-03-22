const { Pool } = require('pg')
require('dotenv').config()

async function testServer() {
  console.log('=== 서버 상태 테스트 ===\n')
  
  // 1. 환경 변수 확인
  console.log('1. 환경 변수 확인:')
  let dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
      dbUrl = dbUrl.slice(1, -1)
    }
    if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
      dbUrl = dbUrl.slice(1, -1)
    }
    console.log('   DATABASE_URL:', dbUrl.replace(/:([^:@]+)@/, ':****@'))
  } else {
    console.log('   ❌ DATABASE_URL이 설정되지 않았습니다.')
    return
  }
  
  // 2. 데이터베이스 연결 테스트
  console.log('\n2. 데이터베이스 연결 테스트:')
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })
  
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('   ✅ 데이터베이스 연결 성공')
    console.log('   현재 시간:', result.rows[0].now)
  } catch (error) {
    console.log('   ❌ 데이터베이스 연결 실패:', error.message)
    await pool.end()
    return
  }
  
  // 3. 테이블 존재 확인
  console.log('\n3. 테이블 존재 확인:')
  const tables = ['user', 'role', 'project', 'project_member', 'wbs', 'salary']
  for (const table of tables) {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table])
      if (result.rows[0].exists) {
        console.log(`   ✅ ${table} 테이블 존재`)
      } else {
        console.log(`   ⚠️  ${table} 테이블 없음`)
      }
    } catch (error) {
      console.log(`   ❌ ${table} 테이블 확인 실패:`, error.message)
    }
  }
  
  // 4. 간단한 쿼리 테스트
  console.log('\n4. 쿼리 테스트:')
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM "user"')
    console.log(`   ✅ 사용자 수: ${userCount.rows[0].count}`)
    
    const projectCount = await pool.query('SELECT COUNT(*) FROM project')
    console.log(`   ✅ 프로젝트 수: ${projectCount.rows[0].count}`)
    
    const roleCount = await pool.query('SELECT COUNT(*) FROM role')
    console.log(`   ✅ 직급 수: ${roleCount.rows[0].count}`)
  } catch (error) {
    console.log('   ❌ 쿼리 실행 실패:', error.message)
  }
  
  await pool.end()
  console.log('\n=== 테스트 완료 ===')
}

testServer().catch(console.error)



