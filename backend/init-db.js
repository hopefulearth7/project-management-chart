// Node.js를 사용한 데이터베이스 초기화 스크립트
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 프로젝트 루트의 .env 파일 로드
const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
require('dotenv').config({ path: envPath });

async function initDatabase() {
  const projectRoot = path.join(__dirname, '..');
  const databaseDir = path.join(projectRoot, 'database');
  
  console.log('=== Extended Database Initialization ===');
  console.log('Project root:', projectRoot);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    console.error('Please run .\\create-env.ps1 first and update DATABASE_URL');
    process.exit(1);
  }
  
  // DATABASE_URL에서 따옴표 제거
  let dbUrl = process.env.DATABASE_URL;
  if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
    dbUrl = dbUrl.slice(1, -1);
  }
  if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
    dbUrl = dbUrl.slice(1, -1);
  }
  
  console.log('Database URL format:', dbUrl.match(/postgresql:\/\//) ? 'Valid' : 'Invalid');
  
  // Pool 생성
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('\nDATABASE_URL (masked):', dbUrl.replace(/:([^:@]+)@/, ':****@'));
    console.error('\nTroubleshooting:');
    console.error('1. Check if PostgreSQL is running');
    console.error('2. Verify database exists: CREATE DATABASE project_management;');
    console.error('3. Verify user exists and password is correct');
    console.error('4. Check if port 5432 is accessible');
    console.error('\nTo test connection manually:');
    console.error(`  psql -h localhost -p 5432 -U hopefulearth -d project_management`);
    await pool.end();
    process.exit(1);
  }

  try {
    // Step 1: Apply schema
    console.log('\n[1/3] Applying schema...');
    const schemaFile = path.join(databaseDir, 'schema.sql');
    if (fs.existsSync(schemaFile)) {
      const schemaContent = fs.readFileSync(schemaFile, 'utf8');
      await pool.query(schemaContent);
      console.log('✅ Schema applied');
    } else {
      console.warn('⚠️  schema.sql not found, skipping...');
    }

    // Step 2: Apply basic seed data
    console.log('\n[2/3] Applying basic seed data...');
    const seedFile = path.join(databaseDir, 'seed.sql');
    if (fs.existsSync(seedFile)) {
      const seedContent = fs.readFileSync(seedFile, 'utf8');
      await pool.query(seedContent);
      console.log('✅ Basic seed data applied');
    } else {
      console.warn('⚠️  seed.sql not found, skipping...');
    }

    // Step 3: Apply extended seed data
    console.log('\n[3/3] Applying extended seed data...');
    const seedExtendedFile = path.join(databaseDir, 'seed-extended.sql');
    if (fs.existsSync(seedExtendedFile)) {
      const seedExtendedContent = fs.readFileSync(seedExtendedFile, 'utf8');
      // Split by semicolon and execute each statement
      const statements = seedExtendedContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const statement of statements) {
        if (statement.length > 0) {
          try {
            await pool.query(statement);
            successCount++;
          } catch (err) {
            // Ignore duplicate key errors (ON CONFLICT DO NOTHING)
            if (err.message.includes('duplicate key') || 
                err.message.includes('already exists') ||
                err.message.includes('ON CONFLICT')) {
              // Expected errors, ignore
            } else {
              errorCount++;
              if (errorCount <= 5) { // Show first 5 errors
                console.warn('⚠️  Statement error:', err.message.substring(0, 100));
              }
            }
          }
        }
      }
      console.log(`✅ Extended seed data applied (${successCount} statements, ${errorCount} errors)`);
    } else {
      console.error('❌ seed-extended.sql not found');
      await pool.end();
      process.exit(1);
    }

    // Verify data
    console.log('\n=== Verifying Data ===');
    const projectCount = await pool.query('SELECT COUNT(*) FROM project');
    const userCount = await pool.query('SELECT COUNT(*) FROM "user"');
    const wbsCount = await pool.query('SELECT COUNT(*) FROM wbs');
    
    console.log(`✅ Projects: ${projectCount.rows[0].count}`);
    console.log(`✅ Users: ${userCount.rows[0].count}`);
    console.log(`✅ WBS Items: ${wbsCount.rows[0].count}`);

    console.log('\n=== Database Initialization Complete ===');
    console.log('\nCreated Data:');
    console.log('  - Projects: 10');
    console.log('  - Users: 10 (with join dates)');
    console.log('  - WBS Items: Work items for each project');
    
  } catch (error) {
    console.error('❌ Error during initialization:', error.message);
    console.error(error.stack);
    await pool.end();
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
