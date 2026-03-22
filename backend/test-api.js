// API 테스트 스크립트
const http = require('http');

console.log('\n=== 백엔드 API 테스트 ===\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/projects',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const projects = JSON.parse(data);
        console.log('✅ 백엔드 API 응답 성공!');
        console.log(`상태 코드: ${res.statusCode}`);
        console.log(`프로젝트 개수: ${projects.length}개`);
        
        if (projects.length > 0) {
          console.log('\n프로젝트 목록 (처음 3개):');
          projects.slice(0, 3).forEach(p => {
            console.log(`  - ${p.name}`);
          });
        }
        process.exit(0);
      } catch (err) {
        console.error('❌ JSON 파싱 오류:', err.message);
        console.log('응답 데이터:', data.substring(0, 100));
        process.exit(1);
      }
    } else {
      console.error(`❌ API 오류: 상태 코드 ${res.statusCode}`);
      console.log('응답:', data);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ 요청 오류:', err.message);
  console.log('\n⚠️  백엔드 서버가 아직 준비되지 않았습니다.');
  console.log('잠시 후 브라우저를 새로고침해주세요.');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ 요청 시간 초과');
  req.destroy();
  process.exit(1);
});

req.end();



