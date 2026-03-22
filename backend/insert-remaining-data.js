// 나머지 데이터 삽입 스크립트
const { Pool } = require('pg');
require('dotenv').config();

async function insertRemainingData() {
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
    console.log('=== 나머지 데이터 삽입 시작 ===\n');

    // 나머지 사용자 8명 추가
    console.log('[1/3] 나머지 사용자 추가...');
    const usersResult = await pool.query(`
      INSERT INTO "user" (email, password_hash, name, role, created_at) VALUES
      ('kim@example.com', 'password123', '김철수', 'user', '2021-05-10'),
      ('lee@example.com', 'password123', '이영희', 'user', '2021-07-01'),
      ('park@example.com', 'password123', '박민수', 'user', '2022-01-15'),
      ('choi@example.com', 'password123', '최지영', 'user', '2022-03-20'),
      ('jung@example.com', 'password123', '정대현', 'user', '2022-06-01'),
      ('han@example.com', 'password123', '한소영', 'user', '2023-01-10'),
      ('yoon@example.com', 'password123', '윤성호', 'user', '2023-04-15'),
      ('shin@example.com', 'password123', '신미래', 'user', '2023-09-01')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name;
    `);
    console.log(`✅ 사용자 ${usersResult.rows.length}명 추가 완료`);

    // 나머지 프로젝트 5개 추가
    console.log('\n[2/3] 나머지 프로젝트 추가...');
    const projectsResult = await pool.query(`
      INSERT INTO project (name, description, start_date, end_date, status, expected_gain, created_by) VALUES
      ('전자상거래 플랫폼', '온라인 쇼핑몰 플랫폼을 구축하여 새로운 수익원을 창출하고 고객 접점을 확대합니다.', 
       '2024-05-01', '2024-11-30', 'planning', 25000000, 1),
      ('보안 강화 프로젝트', '기존 시스템의 보안 취약점을 개선하고 새로운 보안 프로토콜을 도입하여 데이터 보호를 강화합니다.', 
       '2024-03-15', '2024-09-15', 'in-progress', 15000000, 1),
      ('고객 관리 시스템(CRM)', '고객 정보를 통합 관리하고 마케팅 자동화 기능을 제공하는 CRM 시스템을 구축합니다.', 
       '2024-06-01', '2024-12-31', 'planning', 18000000, 1),
      ('IoT 디바이스 연동', '스마트 디바이스와 연동하여 실시간 데이터 수집 및 모니터링 기능을 제공하는 시스템을 개발합니다.', 
       '2024-07-01', '2025-01-31', 'planning', 22000000, 1),
      ('마이크로서비스 아키텍처 전환', '모놀리식 애플리케이션을 마이크로서비스 아키텍처로 전환하여 유지보수성과 확장성을 개선합니다.', 
       '2024-08-01', '2025-02-28', 'planning', 30000000, 1)
      RETURNING id, name;
    `);
    console.log(`✅ 프로젝트 ${projectsResult.rows.length}개 추가 완료`);

    // WBS 데이터 추가 (parent_id는 NULL로 설정)
    console.log('\n[3/3] WBS 데이터 추가...');
    
    // 프로젝트별 WBS 추가
    const projects = await pool.query('SELECT id, name FROM project ORDER BY id');
    let wbsCount = 0;

    for (const project of projects.rows) {
      const wbsItems = getWBSForProject(project.id, project.name);
      
      for (const item of wbsItems) {
        try {
          await pool.query(`
            INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `, [
            item.project_id,
            item.parent_id,
            item.code,
            item.name,
            item.description,
            item.level,
            item.start_date,
            item.end_date,
            item.status,
            item.progress,
            item.assigned_to,
            item.estimated_hours
          ]);
          wbsCount++;
        } catch (err) {
          if (!err.message.includes('duplicate')) {
            console.warn(`⚠️  WBS 추가 실패 (프로젝트 ${project.id}):`, err.message.substring(0, 50));
          }
        }
      }
    }

    console.log(`✅ WBS 항목 ${wbsCount}개 추가 완료`);

    // 최종 확인
    const finalCheck = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM project) as projects,
        (SELECT COUNT(*) FROM "user") as users,
        (SELECT COUNT(*) FROM wbs) as wbs
    `);

    console.log('\n=== 최종 상태 ===');
    console.log(`프로젝트: ${finalCheck.rows[0].projects}개`);
    console.log(`사용자: ${finalCheck.rows[0].users}개`);
    console.log(`WBS 항목: ${finalCheck.rows[0].wbs}개`);

    await pool.end();
  } catch (error) {
    console.error('❌ 오류:', error.message);
    await pool.end();
    process.exit(1);
  }
}

function getWBSForProject(projectId, projectName) {
  // 각 프로젝트별 기본 WBS 항목 생성
  const wbsTemplates = {
    '웹사이트 리뉴얼 프로젝트': [
      { code: '1.0', name: '요구사항 분석', description: '프로젝트 요구사항 수집 및 분석', level: 1, start_date: '2024-01-01', end_date: '2024-01-15', status: 'completed', progress: 100, assigned_to: 2, estimated_hours: 80 },
      { code: '2.0', name: '디자인', description: 'UI/UX 디자인 작업', level: 1, start_date: '2024-01-16', end_date: '2024-02-28', status: 'in-progress', progress: 60, assigned_to: 3, estimated_hours: 200 },
      { code: '3.0', name: '개발', description: '프론트엔드 및 백엔드 개발', level: 1, start_date: '2024-03-01', end_date: '2024-05-31', status: 'in-progress', progress: 40, assigned_to: 4, estimated_hours: 600 },
      { code: '4.0', name: '테스트 및 배포', description: 'QA 테스트 및 프로덕션 배포', level: 1, start_date: '2024-06-01', end_date: '2024-06-30', status: 'not-started', progress: 0, assigned_to: 5, estimated_hours: 120 }
    ],
    '모바일 앱 개발': [
      { code: '1.0', name: '기획 및 설계', description: '앱 기획 및 기능 설계', level: 1, start_date: '2024-02-01', end_date: '2024-02-28', status: 'completed', progress: 100, assigned_to: 2, estimated_hours: 100 },
      { code: '2.0', name: 'iOS 개발', description: 'iOS 앱 개발', level: 1, start_date: '2024-03-01', end_date: '2024-06-30', status: 'in-progress', progress: 50, assigned_to: 3, estimated_hours: 500 },
      { code: '3.0', name: 'Android 개발', description: 'Android 앱 개발', level: 1, start_date: '2024-03-01', end_date: '2024-06-30', status: 'in-progress', progress: 45, assigned_to: 4, estimated_hours: 500 },
      { code: '4.0', name: '통합 테스트', description: '크로스 플랫폼 테스트', level: 1, start_date: '2024-07-01', end_date: '2024-08-31', status: 'not-started', progress: 0, assigned_to: 5, estimated_hours: 200 }
    ],
    '데이터 분석 시스템 구축': [
      { code: '1.0', name: '데이터 수집 파이프라인 구축', description: '다양한 소스에서 데이터를 수집하는 파이프라인 구축', level: 1, start_date: '2024-03-01', end_date: '2024-05-31', status: 'in-progress', progress: 70, assigned_to: 6, estimated_hours: 400 },
      { code: '2.0', name: '데이터 저장소 설계', description: '데이터 웨어하우스 설계 및 구축', level: 1, start_date: '2024-04-01', end_date: '2024-06-30', status: 'in-progress', progress: 50, assigned_to: 7, estimated_hours: 300 },
      { code: '3.0', name: '분석 모델 개발', description: '머신러닝 모델 개발 및 학습', level: 1, start_date: '2024-07-01', end_date: '2024-10-31', status: 'not-started', progress: 0, assigned_to: 8, estimated_hours: 600 },
      { code: '4.0', name: '대시보드 개발', description: '비즈니스 인사이트 대시보드 개발', level: 1, start_date: '2024-11-01', end_date: '2024-12-31', status: 'not-started', progress: 0, assigned_to: 9, estimated_hours: 300 }
    ],
    '클라우드 마이그레이션': [
      { code: '1.0', name: '현재 인프라 분석', description: '기존 인프라 구조 분석 및 마이그레이션 계획 수립', level: 1, start_date: '2024-01-15', end_date: '2024-02-28', status: 'completed', progress: 100, assigned_to: 2, estimated_hours: 120 },
      { code: '2.0', name: '클라우드 환경 구축', description: 'AWS 인프라 구축 및 설정', level: 1, start_date: '2024-03-01', end_date: '2024-05-31', status: 'in-progress', progress: 60, assigned_to: 3, estimated_hours: 400 },
      { code: '3.0', name: '애플리케이션 마이그레이션', description: '애플리케이션을 클라우드로 이전', level: 1, start_date: '2024-06-01', end_date: '2024-08-31', status: 'in-progress', progress: 30, assigned_to: 4, estimated_hours: 500 },
      { code: '4.0', name: '테스트 및 최적화', description: '성능 테스트 및 비용 최적화', level: 1, start_date: '2024-09-01', end_date: '2024-09-30', status: 'not-started', progress: 0, assigned_to: 5, estimated_hours: 150 }
    ],
    'AI 챗봇 서비스': [
      { code: '1.0', name: '자연어 처리 모델 학습', description: '대화 데이터를 활용한 NLP 모델 학습', level: 1, start_date: '2024-04-01', end_date: '2024-06-30', status: 'not-started', progress: 0, assigned_to: 6, estimated_hours: 400 },
      { code: '2.0', name: '챗봇 엔진 개발', description: '대화 관리 및 응답 생성 엔진 개발', level: 1, start_date: '2024-07-01', end_date: '2024-09-30', status: 'not-started', progress: 0, assigned_to: 7, estimated_hours: 500 },
      { code: '3.0', name: '통합 및 배포', description: '기존 시스템과 통합 및 배포', level: 1, start_date: '2024-10-01', end_date: '2024-10-31', status: 'not-started', progress: 0, assigned_to: 8, estimated_hours: 150 }
    ],
    '전자상거래 플랫폼': [
      { code: '1.0', name: '플랫폼 설계', description: '전자상거래 플랫폼 아키텍처 설계', level: 1, start_date: '2024-05-01', end_date: '2024-06-30', status: 'not-started', progress: 0, assigned_to: 2, estimated_hours: 200 }
    ],
    '보안 강화 프로젝트': [
      { code: '1.0', name: '보안 취약점 분석', description: '현재 시스템의 보안 취약점 분석', level: 1, start_date: '2024-03-15', end_date: '2024-04-30', status: 'in-progress', progress: 70, assigned_to: 3, estimated_hours: 200 },
      { code: '2.0', name: '보안 패치 적용', description: '보안 패치 및 업데이트 적용', level: 1, start_date: '2024-05-01', end_date: '2024-07-31', status: 'in-progress', progress: 40, assigned_to: 4, estimated_hours: 400 }
    ],
    '고객 관리 시스템(CRM)': [
      { code: '1.0', name: 'CRM 요구사항 정의', description: 'CRM 시스템 요구사항 수집 및 정의', level: 1, start_date: '2024-06-01', end_date: '2024-06-30', status: 'not-started', progress: 0, assigned_to: 2, estimated_hours: 100 }
    ],
    'IoT 디바이스 연동': [
      { code: '1.0', name: 'IoT 프로토콜 설계', description: '디바이스 통신 프로토콜 설계', level: 1, start_date: '2024-07-01', end_date: '2024-08-31', status: 'not-started', progress: 0, assigned_to: 6, estimated_hours: 300 }
    ],
    '마이크로서비스 아키텍처 전환': [
      { code: '1.0', name: '마이크로서비스 설계', description: '서비스 분리 및 아키텍처 설계', level: 1, start_date: '2024-08-01', end_date: '2024-09-30', status: 'not-started', progress: 0, assigned_to: 7, estimated_hours: 400 }
    ]
  };

  const template = wbsTemplates[projectName] || [];
  return template.map(item => ({
    project_id: projectId,
    parent_id: null, // parent_id는 NULL로 설정
    ...item
  }));
}

insertRemainingData();



