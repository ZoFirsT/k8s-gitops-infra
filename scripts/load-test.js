import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 150 }, // เร่งจำนวนคนเข้าเว็บไปที่ 150 คนใน 30 วิ
    { duration: '2m', target: 150 },  // แช่ไว้ที่ 150 คนต่อเนื่อง 2 นาที
    { duration: '30s', target: 0 },   // ค่อยๆ ลดคนลงจนเหลือ 0
  ],
};

export default function () {
  const payload = JSON.stringify({
    title: 'Load Test Task',
    description: 'Testing HPA auto-scaling',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // ยิงตรงไปที่ port-forward ที่เรากำลังจะเปิด
  const res = http.post('http://127.0.0.1:8888/api/v1/tasks', payload, params);

  check(res, {
    'is status 201': (r) => r.status === 201,
  });
}
