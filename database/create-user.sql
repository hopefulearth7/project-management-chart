-- PostgreSQL 사용자 생성 스크립트
-- postgres 사용자로 접속한 후 실행하세요

-- 사용자 생성 (비밀번호: test316)
CREATE USER hopefulearth WITH PASSWORD 'test316';

-- 데이터베이스 생성 (없는 경우)
CREATE DATABASE project_management;

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE project_management TO hopefulearth;

-- 데이터베이스에 연결하여 스키마 권한 부여
\c project_management
GRANT ALL ON SCHEMA public TO hopefulearth;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hopefulearth;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hopefulearth;



