// Render 데이터베이스 원격 초기화 스크립트
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://project_management_jgvj_user:vklP809yzc2VHWvkRXfksbXYTvrQlvL5@dpg-d5hkg924d50c7394v05g-a.virginia-postgres.render.com/project_management_jgvj';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  try {
    console.log('🔧 Starting database initialization...');
    console.log('📍 Database:', DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));

    // 1. 테이블 생성
    console.log('\n📋 Creating tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role_id BIGINT,
        employment_status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS roles (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS salaries (
        id BIGSERIAL PRIMARY KEY,
        role_id BIGINT REFERENCES roles(id),
        hourly_salary DECIMAL(15, 2),
        daily_salary DECIMAL(15, 2),
        monthly_salary DECIMAL(15, 2),
        annual_salary DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'planned',
        project_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS costs (
        id BIGSERIAL PRIMARY KEY,
        project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
        type VARCHAR(50),
        amount DECIMAL(15, 2),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS project_members (
        id BIGSERIAL PRIMARY KEY,
        project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id),
        role_name VARCHAR(255),
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS wbs (
        id BIGSERIAL PRIMARY KEY,
        project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
        parent_id BIGINT REFERENCES wbs(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'not-started',
        progress INTEGER DEFAULT 0,
        assignee_id BIGINT REFERENCES users(id),
        estimated_hours DECIMAL(10, 2),
        actual_hours DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admin_settings (
        id BIGSERIAL PRIMARY KEY,
        admin_code VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tables created');

    // 2. 기본 관리자 설정
    console.log('\n👤 Adding admin settings...');
    await pool.query(`
      INSERT INTO admin_settings (admin_code, company_name)
      SELECT '1234', '행복한 지구'
      WHERE NOT EXISTS (SELECT 1 FROM admin_settings LIMIT 1);
    `);
    console.log('✅ Admin settings added');

    // 3. 직급 추가
    console.log('\n👔 Adding roles...');
    await pool.query(`
      INSERT INTO roles (name) VALUES
      ('사원'), ('대리'), ('과장'), ('차장'), ('부장'), ('임원')
      ON CONFLICT (name) DO NOTHING;
    `);
    const rolesResult = await pool.query('SELECT id, name FROM roles ORDER BY id');
    console.log(`✅ Roles added: ${rolesResult.rows.length}`);

    // 4. 급여 데이터
    console.log('\n💰 Adding salaries...');
    for (const role of rolesResult.rows) {
      const baseSalary = role.name === '사원' ? 35000000 :
                        role.name === '대리' ? 45000000 :
                        role.name === '과장' ? 55000000 :
                        role.name === '차장' ? 70000000 :
                        role.name === '부장' ? 90000000 : 120000000;
      
      await pool.query(`
        INSERT INTO salaries (role_id, hourly_salary, daily_salary, monthly_salary, annual_salary)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [
        role.id,
        Math.round(baseSalary / 2080), // 연 근무시간
        Math.round(baseSalary / 260),  // 연 근무일
        Math.round(baseSalary / 12),   // 월급
        baseSalary
      ]);
    }
    console.log('✅ Salaries added');

    // 5. 테스트 사용자
    console.log('\n👥 Adding users...');
    const users = [
      { name: '김철수', email: 'kim@company.com', role: '사원' },
      { name: '이영희', email: 'lee@company.com', role: '대리' },
      { name: '박민수', email: 'park@company.com', role: '과장' },
      { name: '정수진', email: 'jung@company.com', role: '차장' },
      { name: '최지훈', email: 'choi@company.com', role: '부장' },
      { name: '강민지', email: 'kang@company.com', role: '사원' },
      { name: '윤서연', email: 'yoon@company.com', role: '대리' },
      { name: '임동현', email: 'lim@company.com', role: '과장' },
      { name: '한소희', email: 'han@company.com', role: '차장' },
      { name: '오준석', email: 'oh@company.com', role: '임원' }
    ];

    for (const user of users) {
      const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [user.role]);
      if (roleResult.rows.length > 0) {
        await pool.query(`
          INSERT INTO users (name, email, role_id, employment_status)
          VALUES ($1, $2, $3, 'active')
          ON CONFLICT (email) DO NOTHING
        `, [user.name, user.email, roleResult.rows[0].id]);
      }
    }
    console.log(`✅ Users added: ${users.length}`);

    // 6. 테스트 프로젝트
    console.log('\n📁 Adding projects...');
    const projectResult = await pool.query(`
      INSERT INTO projects (name, description, start_date, end_date, status, project_type)
      VALUES 
        ('모바일 앱 개발', '신규 모바일 앱 런칭 프로젝트', '2024-01-01', '2024-06-30', 'in-progress', '모바일 앱 런칭'),
        ('웹사이트 리뉴얼', '회사 웹사이트 전면 리뉴얼', '2024-02-01', '2024-05-31', 'in-progress', '웹사이트'),
        ('전시회 준비', '2024 박람회 참가 준비', '2024-03-01', '2024-04-15', 'planned', '전시'),
        ('마케팅 캠페인', 'Q1 마케팅 캠페인 기획 및 실행', '2024-01-15', '2024-03-31', 'in-progress', '마케팅'),
        ('시스템 고도화', '내부 시스템 성능 개선', '2024-02-15', '2024-07-31', 'planned', '시스템'),
        ('신제품 출시', '신제품 런칭 프로젝트', '2024-04-01', '2024-09-30', 'planned', '제품 출시'),
        ('고객 서비스 개선', 'CS 시스템 개선 프로젝트', '2024-01-10', '2024-04-30', 'in-progress', '서비스'),
        ('데이터 분석', 'BI 시스템 구축', '2024-03-01', '2024-08-31', 'planned', '데이터'),
        ('보안 강화', '보안 시스템 업그레이드', '2024-02-01', '2024-05-31', 'in-progress', '보안'),
        ('교육 프로그램', '직원 교육 프로그램 운영', '2024-01-01', '2024-12-31', 'in-progress', '교육')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    console.log(`✅ Projects added: ${projectResult.rows.length}`);

    // 7. WBS 항목
    if (projectResult.rows.length > 0) {
      console.log('\n📊 Adding WBS items...');
      const projectId = projectResult.rows[0].id;
      
      // 부모 WBS 추가
      const parentWbsResult = await pool.query(`
        INSERT INTO wbs (project_id, name, description, start_date, end_date, status, estimated_hours)
        VALUES 
          ($1, '기획', '프로젝트 기획 및 요구사항 분석', '2024-01-01', '2024-01-15', 'completed', 80),
          ($1, '디자인', 'UI/UX 디자인', '2024-01-16', '2024-02-15', 'completed', 120),
          ($1, '개발', '개발 단계', '2024-02-16', '2024-05-31', 'in-progress', 400),
          ($1, '테스트', 'QA 및 테스트', '2024-06-01', '2024-06-20', 'not-started', 60),
          ($1, '배포', '서비스 배포', '2024-06-21', '2024-06-30', 'not-started', 20)
        RETURNING id
      `, [projectId]);

      // 하위 WBS 추가
      if (parentWbsResult.rows.length >= 3) {
        const devParentId = parentWbsResult.rows[2].id;
        await pool.query(`
          INSERT INTO wbs (project_id, parent_id, name, description, start_date, end_date, status, estimated_hours)
          VALUES 
            ($1, $2, '프론트엔드 개발', 'React 프론트엔드 개발', '2024-02-16', '2024-04-30', 'in-progress', 150),
            ($1, $2, '백엔드 개발', 'Node.js 백엔드 개발', '2024-02-16', '2024-04-30', 'in-progress', 150),
            ($1, $2, 'API 연동', 'API 통합 및 테스트', '2024-05-01', '2024-05-31', 'not-started', 100)
        `, [projectId, devParentId]);
      }

      console.log('✅ WBS items added');
    }

    // 8. 프로젝트 멤버 추가
    if (projectResult.rows.length > 0) {
      console.log('\n👥 Adding project members...');
      const usersResult = await pool.query('SELECT id, name FROM users LIMIT 5');
      const projectId = projectResult.rows[0].id;

      for (let i = 0; i < usersResult.rows.length; i++) {
        await pool.query(`
          INSERT INTO project_members (project_id, user_id, role_name, start_date, end_date)
          VALUES ($1, $2, $3, '2024-01-01', '2024-06-30')
          ON CONFLICT DO NOTHING
        `, [projectId, usersResult.rows[i].id, i === 0 ? 'PM' : i === 1 ? '개발자' : i === 2 ? '디자이너' : '개발자']);
      }
      console.log('✅ Project members added');
    }

    // 9. 비용 데이터 추가
    if (projectResult.rows.length > 0) {
      console.log('\n💸 Adding costs...');
      const projectId = projectResult.rows[0].id;
      await pool.query(`
        INSERT INTO costs (project_id, type, amount, description)
        VALUES 
          ($1, 'initial', 10000000, '초기 개발 비용'),
          ($1, 'ongoing', 2000000, '월간 운영 비용'),
          ($1, 'initial', 5000000, '디자인 비용')
      `, [projectId]);
      console.log('✅ Costs added');
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Roles: ${rolesResult.rows.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Projects: ${projectResult.rows.length}`);
    console.log(`   - Admin code: 1234`);
    console.log(`   - Company: 행복한 지구`);

  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    throw error;
  } finally {
    await pool.end();
  }
}

// 실행
initDatabase()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });





