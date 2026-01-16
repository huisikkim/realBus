# 🚌 실시간 어린이 셔틀버스 안전 서비스

실시간 GPS 위치 추적 기반 어린이 셔틀버스 안전 서비스 MVP

## 기술 스택

- **백엔드**: Node.js + Express + Socket.io
- **프론트엔드**: React + Vite (PWA)
- **데이터베이스**: MariaDB
- **배포**: 클라우드타입 (백엔드) + GitHub Pages (프론트엔드)

## 주요 기능

### 부모용
- 실시간 버스 위치 확인
- 아이 승하차 알림
- 비상 알림 수신/발신

### 기사용
- 운행 시작/종료
- GPS 위치 자동 전송
- 아이 승하차 처리
- 비상 알림 발신

## 로컬 개발 환경 설정

### 1. 데이터베이스 설정

```bash
# MariaDB에서 스키마 실행
mysql -u root -p < backend/database/schema.sql
```

### 2. 백엔드 실행

```bash
cd backend
cp .env.example .env
# .env 파일에서 DB 정보 수정
npm install
npm run dev
```

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

## 배포 가이드

### 백엔드 (클라우드타입)

1. 클라우드타입에서 Node.js 앱 생성
2. GitHub 레포지토리 연결 (backend 폴더)
3. 환경변수 설정:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET`
   - `FRONTEND_URL` (GitHub Pages URL)

### 프론트엔드 (GitHub Pages)

1. `frontend/vite.config.js`에서 `base` 값을 레포지토리 이름으로 수정
2. 환경변수 파일 생성:

```bash
# frontend/.env.production
VITE_API_URL=https://your-cloudtype-backend-url.com
```

3. 배포:

```bash
cd frontend
npm run deploy
```

4. GitHub 레포지토리 Settings → Pages에서 gh-pages 브랜치 선택

## 테스트 계정 생성

```sql
-- 관리자
INSERT INTO users (email, password, name, role) 
VALUES ('admin@test.com', '$2a$10$...', '관리자', 'admin');

-- 기사
INSERT INTO users (email, password, name, role) 
VALUES ('driver@test.com', '$2a$10$...', '김기사', 'driver');

-- 부모
INSERT INTO users (email, password, name, role) 
VALUES ('parent@test.com', '$2a$10$...', '이부모', 'parent');
```

## 라이선스

MIT
