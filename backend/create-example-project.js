require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createExampleProject() {
  try {
    console.log('=== 예시 프로젝트 생성 ===\n');
    
    // 1. 프로젝트 생성
    console.log('[1/4] 프로젝트 생성 중...');
    const projectResult = await pool.query(`
      INSERT INTO project (name, description, start_date, end_date, status, expected_gain, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name
    `, [
      '웹사이트 리뉴얼 프로젝트',
      '기존 웹사이트를 모던한 디자인과 최신 기술 스택으로 전면 리뉴얼하여 사용자 경험을 개선하고 매출을 증대시킵니다.',
      '2024-01-15',
      '2024-06-30',
      'in-progress',
      50000000,
      1
    ]);
    
    const projectId = projectResult.rows[0].id;
    console.log(`✅ 프로젝트 생성 완료: ID=${projectId}, 이름="${projectResult.rows[0].name}"`);
    
    // 2. 직급 확인 및 생성 (없으면)
    console.log('\n[2/4] 직급 확인 중...');
    let roleId;
    const roleCheck = await pool.query('SELECT id FROM role WHERE name = $1', ['과장']);
    if (roleCheck.rows.length > 0) {
      roleId = roleCheck.rows[0].id;
      console.log(`✅ 기존 직급 사용: ID=${roleId}`);
    } else {
      const newRole = await pool.query('INSERT INTO role (name, level) VALUES ($1, $2) RETURNING id', ['과장', 3]);
      roleId = newRole.rows[0].id;
      console.log(`✅ 새 직급 생성: ID=${roleId}`);
    }
    
    // 3. 사용자 확인 및 생성 (없으면)
    console.log('\n[3/4] 사용자 확인 중...');
    let userId;
    const userCheck = await pool.query('SELECT id FROM "user" WHERE email = $1', ['example@company.com']);
    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      console.log(`✅ 기존 사용자 사용: ID=${userId}`);
    } else {
      const newUser = await pool.query(
        'INSERT INTO "user" (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['example@company.com', 'temp_password', '홍길동', 'user']
      );
      userId = newUser.rows[0].id;
      console.log(`✅ 새 사용자 생성: ID=${userId}`);
    }
    
    // 4. 프로젝트 멤버 추가
    console.log('\n[4/4] 프로젝트 멤버 추가 중...');
    await pool.query(`
      INSERT INTO project_member (project_id, user_id, role_id, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (project_id, user_id) DO NOTHING
    `, [projectId, userId, roleId, '2024-01-15', '2024-06-30']);
    console.log('✅ 프로젝트 멤버 추가 완료');
    
    // 5. WBS 항목 추가
    console.log('\n[5/5] WBS 항목 추가 중...');
    const wbsItems = [
      { code: '1', name: '기획 및 설계', description: '요구사항 분석 및 시스템 설계', level: 1, status: 'completed', progress: 100 },
      { code: '1.1', name: '요구사항 분석', description: '사용자 요구사항 수집 및 분석', level: 2, status: 'completed', progress: 100 },
      { code: '1.2', name: 'UI/UX 디자인', description: '사용자 인터페이스 및 경험 디자인', level: 2, status: 'completed', progress: 100 },
      { code: '2', name: '프론트엔드 개발', description: 'React 기반 프론트엔드 개발', level: 1, status: 'in-progress', progress: 60 },
      { code: '2.1', name: '컴포넌트 개발', description: '재사용 가능한 컴포넌트 개발', level: 2, status: 'in-progress', progress: 70 },
      { code: '2.2', name: '상태 관리', description: 'Redux/Zustand를 이용한 상태 관리', level: 2, status: 'in-progress', progress: 50 },
      { code: '3', name: '백엔드 개발', description: 'Node.js 기반 백엔드 API 개발', level: 1, status: 'in-progress', progress: 40 },
      { code: '3.1', name: 'API 설계', description: 'RESTful API 설계 및 문서화', level: 2, status: 'completed', progress: 100 },
      { code: '3.2', name: '데이터베이스 설계', description: 'PostgreSQL 스키마 설계', level: 2, status: 'completed', progress: 100 },
      { code: '4', name: '테스트 및 배포', description: '통합 테스트 및 프로덕션 배포', level: 1, status: 'not-started', progress: 0 }
    ];
    
    for (const item of wbsItems) {
      const parentCode = item.code.includes('.') ? item.code.split('.')[0] : null;
      let parentId = null;
      
      if (parentCode) {
        const parentResult = await pool.query(
          'SELECT id FROM wbs WHERE project_id = $1 AND code = $2',
          [projectId, parentCode]
        );
        if (parentResult.rows.length > 0) {
          parentId = parentResult.rows[0].id;
        }
      }
      
      await pool.query(`
        INSERT INTO wbs (project_id, parent_id, code, name, description, level, status, progress, assigned_to)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        projectId,
        parentId,
        item.code,
        item.name,
        item.description,
        item.level,
        item.status,
        item.progress,
        userId
      ]);
    }
    console.log(`✅ WBS 항목 ${wbsItems.length}개 추가 완료`);
    
    // 6. 비용 항목 추가
    console.log('\n[6/6] 비용 항목 추가 중...');
    const costs = [
      { cost_type: 'one-time', category: '디자인', amount: 5000000, description: 'UI/UX 디자인 비용' },
      { cost_type: 'one-time', category: '개발 도구', amount: 2000000, description: '소프트웨어 라이선스' },
      { cost_type: 'recurring', category: '인프라', amount: 500000, recurrence: 'monthly', description: '클라우드 서버 비용' }
    ];
    
    for (const cost of costs) {
      await pool.query(`
        INSERT INTO cost (project_id, cost_type, category, amount, currency, recurrence, description, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        projectId,
        cost.cost_type,
        cost.category,
        cost.amount,
        'KRW',
        cost.recurrence || null,
        cost.description,
        1
      ]);
    }
    console.log(`✅ 비용 항목 ${costs.length}개 추가 완료`);
    
    console.log('\n=== 예시 프로젝트 생성 완료 ===');
    console.log(`프로젝트 ID: ${projectId}`);
    console.log(`프로젝트명: 웹사이트 리뉴얼 프로젝트`);
    console.log(`멤버: 1명`);
    console.log(`WBS 항목: ${wbsItems.length}개`);
    console.log(`비용 항목: ${costs.length}개`);
    
  } catch (error) {
    console.error('예시 프로젝트 생성 실패:', error);
    console.error('에러 상세:', error.message, error.code);
  } finally {
    await pool.end();
  }
}

createExampleProject();

