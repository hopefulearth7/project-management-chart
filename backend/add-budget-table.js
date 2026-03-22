// 프로젝트 예산 항목 테이블 생성 스크립트
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a.virginia-postgres.render.com/project_management_jgvj';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addBudgetTable() {
  try {
    console.log('🔧 프로젝트 예산 항목 테이블 생성 중...');
    console.log('📍 Database:', DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));

    // 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_budget_item (
        id BIGSERIAL PRIMARY KEY,
        project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        task_name VARCHAR(255) NOT NULL,
        labor_hours DECIMAL(10,2) DEFAULT 0 CHECK (labor_hours >= 0),
        labor_rate DECIMAL(12,2) DEFAULT 0 CHECK (labor_rate >= 0),
        materials_units DECIMAL(10,2) DEFAULT 0 CHECK (materials_units >= 0),
        materials_unit_price DECIMAL(12,2) DEFAULT 0 CHECK (materials_unit_price >= 0),
        fixed_cost DECIMAL(15,2) DEFAULT 0 CHECK (fixed_cost >= 0),
        actual_budget DECIMAL(15,2) DEFAULT 0 CHECK (actual_budget >= 0),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ 테이블 생성 완료');

    // 인덱스 생성
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_project_budget_item_project_id ON project_budget_item(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_budget_item_category ON project_budget_item(category);
      CREATE INDEX IF NOT EXISTS idx_project_budget_item_display_order ON project_budget_item(display_order);
    `);
    console.log('✅ 인덱스 생성 완료');

    // 테이블 확인
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'project_budget_item'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ project_budget_item 테이블이 성공적으로 생성되었습니다!');
    }

    console.log('\n🎉 완료!');

  } catch (error) {
    console.error('\n❌ 테이블 생성 실패:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    throw error;
  } finally {
    await pool.end();
  }
}

// 실행
addBudgetTable()
  .then(() => {
    console.log('\n✅ 스크립트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실패:', error.message);
    process.exit(1);
  });





