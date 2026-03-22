# PostgreSQL 설치 가이드

## 방법 1: PostgreSQL 공식 설치 (권장)

### 다운로드 및 설치
1. https://www.postgresql.org/download/windows/ 접속
2. "Download the installer" 클릭
3. 설치 프로그램 다운로드 및 실행
4. 설치 중:
   - 포트: 5432 (기본값)
   - 사용자명: `postgres` (또는 원하는 사용자명)
   - 비밀번호: 설정 (기억해두세요!)
   - 데이터베이스: `postgres` (기본값)

### 설치 후 설정
1. PostgreSQL 설치 후 서비스가 자동으로 시작됩니다
2. 데이터베이스 생성:
   ```sql
   CREATE DATABASE project_management;
   CREATE USER hopefulearth WITH PASSWORD 'test316';
   GRANT ALL PRIVILEGES ON DATABASE project_management TO hopefulearth;
   ```

## 방법 2: Chocolatey 사용 (빠른 설치)

```powershell
# Chocolatey가 설치되어 있다면
choco install postgresql
```

## 방법 3: Docker 사용 (선택사항)

```powershell
docker run --name postgres -e POSTGRES_PASSWORD=test316 -e POSTGRES_USER=hopefulearth -e POSTGRES_DB=project_management -p 5432:5432 -d postgres
```

## 설치 확인

```powershell
# 서비스 확인
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# 연결 테스트
psql -h localhost -U hopefulearth -d project_management
```

## 설치 후 다음 단계

1. `.env` 파일 확인 (이미 설정되어 있음)
2. 데이터베이스 초기화:
   ```powershell
   cd backend
   node init-db.js
   ```
3. 서버 실행:
   ```powershell
   .\start.ps1
   ```



