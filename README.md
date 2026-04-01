# ⚙️ NEXUS MES Dashboard

> 실시간 제조 실행 시스템(MES) 대시보드 — React 기반 단일 페이지 애플리케이션

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Recharts](https://img.shields.io/badge/Recharts-2.x-22b5bf?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📌 개요

NEXUS MES Dashboard는 공장 생산 현황을 실시간으로 모니터링하기 위한 웹 기반 대시보드입니다. 라인별 OEE, 생산 달성률, 불량 분포, 작업지시, 알람을 하나의 화면에서 통합 관리할 수 있습니다.

---

## ✨ 주요 기능

| 탭 | 기능 |
|---|---|
| 📊 종합현황 | OEE 추이 차트, 불량 유형 파이차트, 라인별 생산 실적 비교 |
| 🏭 라인현황 | 5개 라인 가동 상태, 달성률 프로그레스바, 온도/작업자 표시 |
| 📋 작업지시 | 작업지시 목록, 우선순위, 납기, 진행률 |
| 🔔 알람센터 | 등급별(긴급/경고/정보) 알람 목록 및 확인 처리 |

- 3초 주기 실시간 데이터 갱신 (시뮬레이션)
- 다크 테마 전용 UI
- 커스텀 SVG 아이콘 (이모티콘 없음)

---

## 🛠️ 기술 스택

- **React 18** — 컴포넌트 기반 UI
- **Recharts** — LineChart, BarChart, PieChart
- **CSS-in-JS** — 인라인 스타일 (외부 CSS 파일 없음)
- **Inter / Pretendard** — 고급 폰트 적용

---

## 🚀 시작하기

### 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/nexus-mes-dashboard.git
cd nexus-mes-dashboard

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 빌드

```bash
npm run build
```

---

## 📁 프로젝트 구조

```
nexus-mes-dashboard/
├── src/
│   ├── App.tsx          # 메인 대시보드 컴포넌트
│   ├── main.tsx         # 엔트리 포인트
│   └── index.css        # 전역 스타일 (최소)
├── public/
├── package.json
└── README.md
```

---

## ⚙️ 환경 변수

실제 MES 백엔드와 연동 시 아래 변수를 `.env` 파일에 설정하세요.

```env
VITE_API_BASE_URL=https://your-mes-api.example.com
VITE_REFRESH_INTERVAL=3000
```

---

## 📊 데이터 연동

현재 버전은 **랜덤 데이터 시뮬레이션** 모드로 동작합니다. 실제 MES 시스템 연동 시 `src/App.tsx` 내 `genOee()`, `genDefect()` 함수를 API 호출로 교체하세요.

```ts
// 예시: API 연동으로 교체
const fetchOeeData = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/oee/history`);
  return res.json();
};
```

---

## 📄 라이선스

MIT License © 2024 Factory Systems Co.
