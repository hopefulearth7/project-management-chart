// PostgreSQL 사용자 생성 스크립트 (postgres 사용자로 실행)
const { Pool } = require('pg');
require('dotenv').config();

async function createUser() {
  console.log('=== PostgreSQL 사용자 생성 ===\n');

  // postgres 사용자로 연결
  const postgresPool = new Pool({
    user: 'postgres',
    password: '0316',
    host: 'localhost',
    port: 5432,
    database: 'postgres', // 기본 데이터베이스
    ssl: false
  });

  try {
    // 연결 테스트
    await postgresPool.query('SELECT NOW()');
    console.log('✅ postgres 사용자로 연결 성공\n');

    // 사용자 생성 (이미 존재하면 무시)
    try {
      await postgresPool.query(`CREATE USER hopefulearth WITH PASSWORD '0316';`);
      console.log('✅ 사용자 hopefulearth 생성 완료');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ️  사용자 hopefulearth가 이미 존재합니다');
      } else {
        throw err;
      }
    }

    // 데이터베이스 생성 (이미 존재하면 무시)
    try {
      await postgresPool.query(`CREATE DATABASE project_management;`);
      console.log('✅ 데이터베이스 project_management 생성 완료');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ️  데이터베이스 project_management가 이미 존재합니다');
      } else {
        throw err;
      }
    }

    // 권한 부여
    try {
      await postgresPool.query(`GRANT ALL PRIVILEGES ON DATABASE project_management TO hopefulearth;`);
      console.log('✅ 권한 부여 완료');
    } catch (err) {
      console.warn('⚠️  권한 부여 중 오류 (무시 가능):', err.message);
    }

    // project_management 데이터베이스에 연결하여 스키마 권한 부여
    const projectPool = new Pool({
      user: 'postgres',
      password: '0316',
      host: 'localhost',
      port: 5432,
      database: 'project_management',
      ssl: false
    });

    try {
      await projectPool.query('GRANT ALL ON SCHEMA public TO hopefulearth;');
      await projectPool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hopefulearth;');
      await projectPool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hopefulearth;');
      console.log('✅ 스키마 권한 부여 완료');
      await projectPool.end();
    } catch (err) {
      console.warn('⚠️  스키마 권한 부여 중 오류 (무시 가능):', err.message);
      await projectPool.end();
    }

    console.log('\n=== 사용자 생성 완료 ===');
    console.log('  - 사용자: hopefulearth');
    console.log('  - 비밀번호: 0316');
    console.log('  - 데이터베이스: project_management\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('Error code:', error.code);
    if (error.code === '28P01') {
      console.error('\npostgres 사용자 비밀번호가 틀렸습니다.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nPostgreSQL 서버가 실행 중이지 않습니다.');
      console.error('PostgreSQL 서비스를 시작해주세요.');
    }
    process.exit(1);
  } finally {
    await postgresPool.end();
  }
}

createUser();



