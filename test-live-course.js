const http = require('http');

async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher@eduvirse.com', password: 'password123' })
  });
  
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;

  const res = await fetch('http://localhost:3000/api/courses/live', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "Test Course",
      description: "desc",
      subject: "Math",
      startDate: "2026-07-01",
      endDate: "2026-07-02",
      classTime: "10:00"
    })
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
