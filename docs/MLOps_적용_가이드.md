# MLOps 환경 적용 가이드
## 프로젝트 관리 웹사이트

**버전**: 1.0  
**작성일**: 2025-12-23  
**대상**: 로컬 환경 (PoC)

---

## 개요

프로젝트 관리 웹사이트의 각 워크플로우를 MLOps 환경에 적용하기 위한 가이드입니다. 로컬 환경에서 PoC를 진행하며, 향후 프로덕션 환경으로 확장 가능하도록 설계되었습니다.

---

## 1. MLOps 아키텍처

### 1.1 전체 구조

```
┌─────────────────┐
│   Frontend      │ (React/Vue.js)
│   (로컬 웹)      │
└────────┬────────┘
         │
┌────────▼────────┐
│   Backend API   │ (Node.js/Python)
│   (로컬 서버)    │
└────────┬────────┘
         │
┌────────▼────────┐
│   Database      │ (PostgreSQL)
│   (로컬 DB)      │
└────────┬────────┘
         │
┌────────▼────────┐
│  MLOps Pipeline │ (Airflow/Prefect)
│  (로컬 실행)     │
└─────────────────┘
```

### 1.2 컴포넌트

- **Frontend**: 사용자 인터페이스
- **Backend API**: 비즈니스 로직 및 API 서버
- **Database**: 데이터 저장소
- **MLOps Pipeline**: 데이터 파이프라인 및 자동화
- **Monitoring**: 모니터링 및 로깅

---

## 2. 워크플로우별 MLOps 적용

### 2.1 1.00 프로젝트 생성 워크플로우

#### 2.1.1 자동화 스크립트

**파일**: `mlops/workflows/1.00_project_creation.py`

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

def validate_project_data(**context):
    """프로젝트 데이터 검증"""
    # 프로젝트 정보 유효성 검증
    pass

def calculate_initial_roi(**context):
    """초기 ROI 계산"""
    # ROI 계산 로직
    pass

def send_notification(**context):
    """알림 발송"""
    # 프로젝트 생성 완료 알림
    pass

default_args = {
    'owner': 'admin',
    'depends_on_past': False,
    'start_date': datetime(2025, 12, 23),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'project_creation_workflow',
    default_args=default_args,
    description='프로젝트 생성 워크플로우',
    schedule_interval=None,  # API 트리거
    catchup=False,
)

validate_task = PythonOperator(
    task_id='validate_project_data',
    python_callable=validate_project_data,
    dag=dag,
)

calculate_roi_task = PythonOperator(
    task_id='calculate_initial_roi',
    python_callable=calculate_initial_roi,
    dag=dag,
)

notify_task = PythonOperator(
    task_id='send_notification',
    python_callable=send_notification,
    dag=dag,
)

validate_task >> calculate_roi_task >> notify_task
```

#### 2.1.2 API 통합

**엔드포인트**: `POST /api/projects`

```javascript
// 프로젝트 생성 후 MLOps 파이프라인 트리거
app.post('/api/projects', async (req, res) => {
  try {
    // 프로젝트 생성
    const project = await createProject(req.body);
    
    // MLOps 파이프라인 트리거
    await triggerMLOpsPipeline('project_creation_workflow', {
      project_id: project.id
    });
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 2.2 2.00 비용 관리 워크플로우

#### 2.2.1 자동화 스크립트

**파일**: `mlops/workflows/2.00_cost_management.py`

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

def aggregate_costs(**context):
    """비용 집계"""
    project_id = context['params']['project_id']
    # 비용 데이터 집계
    pass

def calculate_roi(**context):
    """ROI 계산"""
    project_id = context['params']['project_id']
    # ROI 계산 로직
    pass

def update_dashboard(**context):
    """대시보드 업데이트"""
    # 대시보드 데이터 갱신
    pass

dag = DAG(
    'cost_management_workflow',
    default_args=default_args,
    description='비용 관리 워크플로우',
    schedule_interval='@daily',  # 매일 자정 실행
    catchup=False,
)

aggregate_task = PythonOperator(
    task_id='aggregate_costs',
    python_callable=aggregate_costs,
    dag=dag,
)

calculate_roi_task = PythonOperator(
    task_id='calculate_roi',
    python_callable=calculate_roi,
    dag=dag,
)

update_dashboard_task = PythonOperator(
    task_id='update_dashboard',
    python_callable=update_dashboard,
    dag=dag,
)

aggregate_task >> calculate_roi_task >> update_dashboard_task
```

#### 2.2.2 실시간 트리거

```python
# 비용 추가/수정 시 즉시 ROI 재계산
@app.post('/api/projects/{project_id}/costs')
async def add_cost(project_id: int, cost_data: dict):
    # 비용 저장
    cost = await save_cost(project_id, cost_data)
    
    # ROI 재계산 트리거
    await trigger_roi_calculation(project_id)
    
    return cost
```

---

### 2.3 3.00 인원 관리 워크플로우

#### 2.3.1 자동화 스크립트

**파일**: `mlops/workflows/3.00_member_management.py`

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

def collect_time_entries(**context):
    """시간 기록 수집"""
    # 시간 기록 데이터 수집
    pass

def calculate_labor_cost(**context):
    """인건비 계산"""
    # 인건비 계산 로직
    pass

def update_project_cost(**context):
    """프로젝트 비용 업데이트"""
    # 비용 테이블 업데이트
    pass

dag = DAG(
    'member_management_workflow',
    default_args=default_args,
    description='인원 관리 워크플로우',
    schedule_interval='@daily',  # 매일 자정 실행
    catchup=False,
)

collect_task = PythonOperator(
    task_id='collect_time_entries',
    python_callable=collect_time_entries,
    dag=dag,
)

calculate_task = PythonOperator(
    task_id='calculate_labor_cost',
    python_callable=calculate_labor_cost,
    dag=dag,
)

update_task = PythonOperator(
    task_id='update_project_cost',
    python_callable=update_project_cost,
    dag=dag,
)

collect_task >> calculate_task >> update_task
```

---

## 3. 로컬 환경 설정

### 3.1 Docker Compose 설정

**파일**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: project_manage
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  airflow:
    image: apache/airflow:2.7.0
    environment:
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://admin:admin123@postgres:5432/airflow
    ports:
      - "8080:8080"
    volumes:
      - ./mlops/workflows:/opt/airflow/dags
      - airflow_data:/opt/airflow
    depends_on:
      - postgres

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://admin:admin123@postgres:5432/project_manage
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    depends_on:
      - backend

volumes:
  postgres_data:
  airflow_data:
```

### 3.2 환경 변수 설정

**파일**: `.env`

```env
# Database
DATABASE_URL=postgresql://admin:admin123@localhost:5432/project_manage

# Backend
BACKEND_PORT=3000
JWT_SECRET=your-secret-key

# Frontend
FRONTEND_PORT=3001
API_URL=http://localhost:3000

# Airflow
AIRFLOW_HOME=./mlops/airflow
```

---

## 4. 모니터링 및 로깅

### 4.1 Prometheus 설정

**파일**: `mlops/monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:3000']

  - job_name: 'airflow'
    static_configs:
      - targets: ['localhost:8080']
```

### 4.2 Grafana 대시보드

**메트릭**:
- 프로젝트 생성 수
- ROI 계산 성공률
- 비용 입력 오류율
- 인건비 계산 시간

---

## 5. 테스트 자동화

### 5.1 단위 테스트

**파일**: `tests/unit/test_roi_calculation.py`

```python
import pytest
from src.calculations import calculate_roi

def test_roi_calculation():
    total_cost = 6300
    expected_gain = 10000
    roi = calculate_roi(expected_gain, total_cost)
    assert roi == pytest.approx(58.7, rel=0.1)
```

### 5.2 통합 테스트

**파일**: `tests/integration/test_project_workflow.py`

```python
import pytest
from src.api import create_project, add_cost, calculate_roi

def test_project_creation_workflow():
    # 프로젝트 생성
    project = create_project({
        'name': 'Test Project',
        'expected_gain': 10000
    })
    
    # 비용 추가
    add_cost(project['id'], {
        'cost_type': 'one-time',
        'amount': 6000
    })
    
    # ROI 계산
    roi = calculate_roi(project['id'])
    assert roi > 0
```

---

## 6. 배포 가이드

### 6.1 로컬 실행

```bash
# 1. Docker Compose 실행
docker-compose up -d

# 2. 데이터베이스 마이그레이션
npm run migrate

# 3. 초기 데이터 시드
npm run seed

# 4. 서버 시작
npm run dev
```

### 6.2 프로덕션 배포 (향후)

- Kubernetes 클러스터
- CI/CD 파이프라인 (GitHub Actions)
- 모니터링 및 알림 설정

---

## 7. 워크플로우 실행 순서

1. **프로젝트 생성** → MLOps 파이프라인 트리거
2. **비용 입력** → ROI 자동 재계산
3. **인원 할당** → 인건비 자동 계산
4. **시간 기록** → 일일 집계 및 업데이트

---

## 8. 참고 자료

- [1.00 프로젝트 생성 워크플로우](./workflows/1.00_프로젝트_생성_워크플로우.md)
- [2.00 비용 관리 워크플로우](./workflows/2.00_비용_관리_워크플로우.md)
- [3.00 인원 관리 워크플로우](./workflows/3.00_인원_관리_워크플로우.md)
- [PRD](./PRD.md)
- [ERD](./ERD.md)

---

**다음 단계**: 로컬 환경 구축 및 테스트



