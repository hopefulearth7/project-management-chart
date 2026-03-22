const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware — CORS_ORIGIN에 쉼표로 여러 출처 허용 (예: 로컬 + Netlify)
const allowedCorsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedCorsOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;
    
    // TODO: 비밀번호 해시화 및 유효성 검증
    // TODO: 이메일 중복 확인
    
    const result = await pool.query(
      'INSERT INTO "user" (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, password, name, role]
    );
    
    res.status(201).json({ 
      message: '회원가입 성공',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '회원가입 실패' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // TODO: 비밀번호 검증
    // TODO: JWT 토큰 발급
    
    const result = await pool.query(
      'SELECT id, email, name, role FROM "user" WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }
    
    res.json({
      message: '로그인 성공',
      user: result.rows[0],
      token: 'temp-token' // TODO: 실제 JWT 토큰 발급
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '로그인 실패' });
  }
});

// Projects routes
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM project ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    console.error('Error code:', error.code);
    // 테이블이 없거나 에러 발생 시 빈 배열 반환
    if (error.code === '42P01' || error.code === '3D000' || error.message?.includes('does not exist')) {
      return res.json([]);
    }
    // 기타 에러도 일단 빈 배열 반환 (안정성 우선)
    return res.json([]);
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM project WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: '프로젝트 조회 실패' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, start_date, end_date, expected_gain, project_type, status, created_by = 1 } = req.body;
    
    console.log('프로젝트 생성 요청:', { name, description, start_date, end_date, expected_gain, project_type, status });
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '프로젝트명은 필수입니다.' });
    }
    
    if (!start_date) {
      return res.status(400).json({ error: '시작일은 필수입니다.' });
    }
    
    // 테이블 존재 여부 확인
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'project'
      )`
    );
    
    if (!tableCheck.rows[0].exists) {
      console.error('project 테이블이 존재하지 않습니다.');
      return res.status(500).json({ error: '데이터베이스 테이블이 존재하지 않습니다.' });
    }
    
    // status 기본값 설정
    const projectStatus = status || 'planning';
    
    const result = await pool.query(
      `INSERT INTO project (name, description, start_date, end_date, status, expected_gain, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name.trim(), description || null, start_date, end_date || null, projectStatus, expected_gain || null, created_by]
    );
    
    console.log('프로젝트 생성 성공:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    console.error('Error details:', error.message, error.code);
    res.status(500).json({ error: error.message || '프로젝트 생성 실패' });
  }
});

// Roles routes
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM role ORDER BY level');
    res.json(result.rows);
  } catch (error) {
    console.error('Get roles error:', error);
    console.error('Error code:', error.code);
    // 테이블이 없거나 에러 발생 시 빈 배열 반환
    if (error.code === '42P01' || error.code === '3D000' || error.message?.includes('does not exist')) {
      return res.json([]);
    }
    // 기타 에러도 일단 빈 배열 반환 (안정성 우선)
    return res.json([]);
  }
});

app.post('/api/roles', async (req, res) => {
  try {
    const { name, level } = req.body;
    
    console.log('직급 등록 요청:', { name, level });
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '직급명은 필수입니다.' });
    }
    
    if (level === undefined || level === null || level === '') {
      return res.status(400).json({ error: '직급 레벨은 필수입니다.' });
    }
    
    const levelNum = parseInt(level);
    if (isNaN(levelNum) || levelNum < 1) {
      return res.status(400).json({ error: '직급 레벨은 1 이상의 숫자여야 합니다.' });
    }
    
    // 테이블 존재 여부 확인
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'role'
      )`
    );
    
    if (!tableCheck.rows[0].exists) {
      console.error('role 테이블이 존재하지 않습니다.');
      return res.status(500).json({ error: '데이터베이스 테이블이 존재하지 않습니다.' });
    }
    
    // 중복 확인
    const existing = await pool.query('SELECT id FROM role WHERE name = $1', [name.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 직급명입니다.' });
    }
    
    const result = await pool.query(
      'INSERT INTO role (name, level) VALUES ($1, $2) RETURNING *',
      [name.trim(), levelNum]
    );
    
    console.log('직급 등록 성공:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create role error:', error);
    console.error('Error details:', error.message, error.code);
    res.status(500).json({ error: error.message || '직급 등록 실패' });
  }
});

// Salaries routes
app.get('/api/salaries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, r.name as role_name 
       FROM salary s 
       JOIN role r ON s.role_id = r.id 
       WHERE s.end_date IS NULL 
       ORDER BY r.level`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get salaries error:', error);
    console.error('Error code:', error.code);
    // 테이블이 없거나 에러 발생 시 빈 배열 반환
    if (error.code === '42P01' || error.code === '3D000' || error.message?.includes('does not exist')) {
      return res.json([]);
    }
    // 기타 에러도 일단 빈 배열 반환 (안정성 우선)
    return res.json([]);
  }
});

// Costs routes
app.get('/api/projects/:id/costs', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM cost WHERE project_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get costs error:', error);
    res.status(500).json({ error: '비용 조회 실패' });
  }
});

app.post('/api/projects/:id/costs', async (req, res) => {
  try {
    const { id } = req.params;
    const { cost_type, category, amount, currency, start_date, end_date, recurrence, description, created_by = 1 } = req.body;
    
    const result = await pool.query(
      `INSERT INTO cost (project_id, cost_type, category, amount, currency, start_date, end_date, recurrence, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, cost_type, category, amount, currency, start_date, end_date, recurrence, description, created_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create cost error:', error);
    res.status(500).json({ error: '비용 등록 실패' });
  }
});

// Project members routes
app.get('/api/projects/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT pm.*, u.name as user_name, r.name as role_name
       FROM project_member pm
       JOIN "user" u ON pm.user_id = u.id
       JOIN role r ON pm.role_id = r.id
       WHERE pm.project_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: '멤버 조회 실패' });
  }
});

app.post('/api/projects/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role_id, start_date, end_date } = req.body;
    
    const result = await pool.query(
      `INSERT INTO project_member (project_id, user_id, role_id, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, user_id, role_id, start_date, end_date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: '멤버 추가 실패' });
  }
});

// Satisfaction routes
app.post('/api/projects/:id/satisfaction', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, rating, comment } = req.body;
    
    const result = await pool.query(
      `INSERT INTO satisfaction (project_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (project_id, user_id) 
       DO UPDATE SET rating = $3, comment = $4, updated_at = NOW()
       RETURNING *`,
      [id, user_id, rating, comment]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Save satisfaction error:', error);
    res.status(500).json({ error: '만족도 저장 실패' });
  }
});

// ROI calculation
app.get('/api/projects/:id/roi', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 프로젝트 정보
    const project = await pool.query('SELECT * FROM project WHERE id = $1', [id]);
    if (project.rows.length === 0) {
      return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다' });
    }
    
    // 총 비용 계산
    const costs = await pool.query(
      `SELECT 
        SUM(CASE WHEN cost_type = 'one-time' THEN amount ELSE 0 END) as one_time_cost,
        SUM(CASE WHEN cost_type = 'recurring' AND recurrence = 'monthly' 
            THEN amount * EXTRACT(MONTH FROM AGE(COALESCE(end_date, CURRENT_DATE), start_date))
            ELSE 0 END) as recurring_monthly_cost
       FROM cost 
       WHERE project_id = $1`,
      [id]
    );
    
    const totalCost = parseFloat(costs.rows[0].one_time_cost || 0) + 
                     parseFloat(costs.rows[0].recurring_monthly_cost || 0);
    const expectedGain = parseFloat(project.rows[0].expected_gain || 0);
    
    // ROI 계산
    const roi = totalCost > 0 ? ((expectedGain - totalCost) / totalCost) * 100 : 0;
    
    // ROI 이력 저장
    await pool.query(
      `INSERT INTO roi_calculation (project_id, total_cost, expected_gain, roi_percentage)
       VALUES ($1, $2, $3, $4)`,
      [id, totalCost, expectedGain, roi]
    );
    
    res.json({
      total_cost: totalCost,
      expected_gain: expectedGain,
      roi_percentage: parseFloat(roi.toFixed(2))
    });
  } catch (error) {
    console.error('Calculate ROI error:', error);
    res.status(500).json({ error: 'ROI 계산 실패' });
  }
});

// WBS routes
app.get('/api/projects/:id/wbs', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT w.*, u.name as assigned_to_name
       FROM wbs w
       LEFT JOIN "user" u ON w.assigned_to = u.id
       WHERE w.project_id = $1
       ORDER BY w.code, w.level, w.id`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get WBS error:', error);
    res.status(500).json({ error: 'WBS 조회 실패' });
  }
});

app.post('/api/projects/:id/wbs', async (req, res) => {
  try {
    const { id } = req.params;
    const { parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours } = req.body;
    
    const result = await pool.query(
      `INSERT INTO wbs (project_id, parent_id, code, name, description, level, start_date, end_date, status, progress, assigned_to, estimated_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [id, parent_id || null, code, name, description || null, level || 1, start_date || null, end_date || null, status || 'not-started', progress || 0, assigned_to || null, estimated_hours || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create WBS error:', error);
    res.status(500).json({ error: 'WBS 생성 실패' });
  }
});

app.put('/api/wbs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, start_date, end_date, status, progress, assigned_to, estimated_hours, actual_hours } = req.body;
    
    const result = await pool.query(
      `UPDATE wbs 
       SET code = COALESCE($1, code),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           status = COALESCE($6, status),
           progress = COALESCE($7, progress),
           assigned_to = COALESCE($8, assigned_to),
           estimated_hours = COALESCE($9, estimated_hours),
           actual_hours = COALESCE($10, actual_hours),
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [code, name, description, start_date, end_date, status, progress, assigned_to, estimated_hours, actual_hours, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'WBS 항목을 찾을 수 없습니다' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update WBS error:', error);
    res.status(500).json({ error: 'WBS 수정 실패' });
  }
});

app.delete('/api/wbs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM wbs WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'WBS 항목을 찾을 수 없습니다' });
    }
    
    res.json({ message: 'WBS 항목이 삭제되었습니다' });
  } catch (error) {
    console.error('Delete WBS error:', error);
    res.status(500).json({ error: 'WBS 삭제 실패' });
  }
});

// Users routes
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, employment_start_date, employment_end_date, actual_annual_salary, employment_status FROM "user" ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    console.error('Error code:', error.code);
    // 테이블이 없거나 에러 발생 시 빈 배열 반환
    if (error.code === '42P01' || error.code === '3D000' || error.message?.includes('does not exist')) {
      return res.json([]);
    }
    // 기타 에러도 일단 빈 배열 반환 (안정성 우선)
    return res.json([]);
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employment_start_date, employment_end_date, actual_annual_salary, employment_status } = req.body;
    
    const result = await pool.query(
      `UPDATE "user" 
       SET employment_start_date = $1, 
           employment_end_date = $2, 
           actual_annual_salary = $3, 
           employment_status = $4
       WHERE id = $5
       RETURNING id, email, name, role, employment_start_date, employment_end_date, actual_annual_salary, employment_status`,
      [employment_start_date || null, employment_end_date || null, actual_annual_salary || null, employment_status || 'active', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: '사용자 수정 실패' });
  }
});

app.get('/api/users/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.id, p.name, p.start_date, p.end_date, p.status, 
              pm.member_start_date, pm.member_end_date, r.name as role_name
       FROM project_member pm
       JOIN project p ON pm.project_id = p.id
       LEFT JOIN role r ON pm.role_id = r.id
       WHERE pm.user_id = $1
       ORDER BY pm.member_start_date DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ error: '프로젝트 이력 조회 실패' });
  }
});

// Admin routes
app.get('/api/admin/settings', async (req, res) => {
  try {
    // 테이블 존재 여부 확인
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_settings'
      )`
    );
    
    if (!tableCheck.rows[0].exists) {
      // 테이블이 없으면 기본값 반환
      return res.json({ admin_code: '1234', company_name: null });
    }
    
    const result = await pool.query(
      'SELECT admin_code, company_name FROM admin_settings LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.json({ admin_code: '1234', company_name: null });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get admin settings error:', error);
    // 에러 발생 시 기본값 반환
    res.json({ admin_code: '1234', company_name: null });
  }
});

app.post('/api/admin/settings', async (req, res) => {
  try {
    const { admin_code, company_name } = req.body;
    
    // 기존 설정 확인
    const existing = await pool.query('SELECT id FROM admin_settings LIMIT 1');
    
    if (existing.rows.length === 0) {
      // 새로 생성
      await pool.query(
        'INSERT INTO admin_settings (admin_code, company_name) VALUES ($1, $2)',
        [admin_code, company_name]
      );
    } else {
      // 업데이트
      await pool.query(
        'UPDATE admin_settings SET admin_code = $1, company_name = $2, updated_at = NOW()',
        [admin_code, company_name]
      );
    }
    
    res.json({ admin_code, company_name });
  } catch (error) {
    console.error('Save admin settings error:', error);
    res.status(500).json({ error: '관리자 설정 저장 실패' });
  }
});

app.post('/api/admin/verify-code', async (req, res) => {
  try {
    const { code, company_name } = req.body;
    
    // 테이블 존재 여부 확인
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_settings'
      )`
    );
    
    if (!tableCheck.rows[0].exists) {
      // 테이블이 없으면 기본값으로 확인
      if (code === '1234' && (!company_name || company_name.trim() === '')) {
        return res.json({ valid: true });
      }
      return res.json({ valid: false });
    }
    
    const result = await pool.query(
      'SELECT admin_code, company_name FROM admin_settings LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      // 기본값으로 확인
      if (code === '1234' && (!company_name || company_name.trim() === '')) {
        return res.json({ valid: true });
      }
      return res.json({ valid: false });
    }
    
    const settings = result.rows[0];
    const codeMatch = settings.admin_code === code;
    
    // company_name 검증: 설정에 company_name이 있으면 반드시 일치해야 함
    let companyMatch = true;
    if (settings.company_name && settings.company_name.trim()) {
      // 설정에 company_name이 있으면 입력값과 일치해야 함
      companyMatch = company_name && 
                     settings.company_name.trim().toLowerCase() === company_name.trim().toLowerCase();
    } else {
      // 설정에 company_name이 없으면 입력값도 없어야 함 (또는 무시)
      companyMatch = !company_name || company_name.trim() === '';
    }
    
    if (codeMatch && companyMatch) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: '코드 검증 실패' });
  }
});

app.get('/api/admin/role-salaries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, r.name as role_name 
       FROM salary s 
       JOIN role r ON s.role_id = r.id 
       WHERE s.end_date IS NULL 
       ORDER BY r.level`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get role salaries error:', error);
    console.error('Error code:', error.code);
    // 테이블이 없거나 에러 발생 시 빈 배열 반환
    if (error.code === '42P01' || error.code === '3D000' || error.message?.includes('does not exist')) {
      return res.json([]);
    }
    // 기타 에러도 일단 빈 배열 반환 (안정성 우선)
    return res.json([]);
  }
});

app.get('/api/admin/member-timeline', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pm.user_id, u.name as user_name, p.name as project_name, 
              pm.member_start_date as start_date, pm.member_end_date as end_date,
              r.name as role_name
       FROM project_member pm
       JOIN "user" u ON pm.user_id = u.id
       JOIN project p ON pm.project_id = p.id
       LEFT JOIN role r ON pm.role_id = r.id
       ORDER BY pm.member_start_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get member timeline error:', error);
    console.error('Error code:', error.code);
    // 테이블이 없거나 에러 발생 시 빈 배열 반환
    if (error.code === '42P01' || error.code === '3D000' || error.message?.includes('does not exist')) {
      return res.json([]);
    }
    // 기타 에러도 일단 빈 배열 반환 (안정성 우선)
    return res.json([]);
  }
});

app.post('/api/salaries', async (req, res) => {
  try {
    const { role_id, annual_salary, monthly_salary, daily_salary, hourly_salary, effective_date } = req.body;
    
    // 기존 급여 종료 처리
    if (role_id) {
      await pool.query(
        'UPDATE salary SET end_date = $1 WHERE role_id = $2 AND end_date IS NULL',
        [effective_date, role_id]
      );
    }
    
    // 새 급여 등록
    const result = await pool.query(
      `INSERT INTO salary (role_id, annual_salary, monthly_salary, daily_salary, hourly_salary, effective_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [role_id, annual_salary || null, monthly_salary || null, daily_salary || null, hourly_salary || null, effective_date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create salary error:', error);
    res.status(500).json({ error: '급여 등록 실패' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

