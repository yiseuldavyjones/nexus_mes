import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const genOee = () => Array.from({ length: 12 }, (_, i) => ({ h: `${String(i * 2).padStart(2, "0")}:00`, OEE: rand(72, 96),가용률: rand(85, 99), 성능률: rand(80, 97) }));
const genDefect = () => [
  { name: "치수불량", value: rand(8, 18) }, { name: "표면결함", value: rand(5, 14) },
  { name: "용접불량", value: rand(3, 10) }, { name: "조립오류", value: rand(2, 8) }, { name: "기타", value: rand(1, 5) }
];

const PIE_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6"];

const LINES = [
  { id: "L01", name: "라인 A", product: "엔진블록 V6", status: "running", target: 240, actual: 218, oee: 91, temp: 71, workers: 8 },
  { id: "L02", name: "라인 B", product: "트랜스미션 AT8", status: "running", target: 180, actual: 163, oee: 87, temp: 74, workers: 6 },
  { id: "L03", name: "라인 C", product: "서스펜션 암", status: "warning", target: 320, actual: 261, oee: 76, temp: 83, workers: 5 },
  { id: "L04", name: "라인 D", product: "브레이크 디스크", status: "stopped", target: 400, actual: 198, oee: 57, temp: 58, workers: 0 },
  { id: "L05", name: "라인 E", product: "조향 컬럼", status: "running", target: 160, actual: 153, oee: 94, temp: 68, workers: 7 },
];

const ALARMS = [
  { id: "A001", time: "14:32", line: "라인 C", level: "error", msg: "온도 임계값 초과 (82.3°C)" },
  { id: "A002", time: "14:18", line: "라인 D", level: "error", msg: "설비 비상정지 — 과부하 감지" },
  { id: "A003", time: "13:55", line: "라인 B", level: "warning", msg: "금형 교체 예정 (잔여 200개)" },
  { id: "A004", time: "13:41", line: "라인 A", level: "info", msg: "PM 작업 완료 — 정상 재가동" },
  { id: "A005", time: "12:20", line: "라인 C", level: "warning", msg: "불량률 목표치 초과 (4.2%)" },
];

const ORDERS = [
  { id: "WO-2024-0891", product: "엔진블록 V6", qty: 500, done: 412, due: "오늘 18:00", priority: "high" },
  { id: "WO-2024-0892", product: "트랜스미션 AT8", qty: 300, done: 198, due: "내일 09:00", priority: "medium" },
  { id: "WO-2024-0893", product: "서스펜션 암 L", qty: 800, done: 322, due: "04/03 16:00", priority: "low" },
  { id: "WO-2024-0894", product: "브레이크 디스크", qty: 1200, done: 541, due: "04/02 12:00", priority: "high" },
];

// SVG 3D-style Icons
const Icon = ({ name, size = 28 }) => {
  const icons = {
    oee: <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" fill="#6366f122" stroke="#6366f1" strokeWidth="1.5"/><path d="M16 8v8l5 3" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/><circle cx="16" cy="16" r="2" fill="#6366f1"/></svg>,
    production: <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><rect x="4" y="18" width="6" height="10" rx="1.5" fill="#06b6d422" stroke="#06b6d4" strokeWidth="1.5"/><rect x="13" y="12" width="6" height="16" rx="1.5" fill="#06b6d433" stroke="#06b6d4" strokeWidth="1.5"/><rect x="22" y="6" width="6" height="22" rx="1.5" fill="#06b6d455" stroke="#06b6d4" strokeWidth="1.5"/></svg>,
    achieve: <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" fill="#f59e0b11" stroke="#f59e0b" strokeWidth="1.5"/><path d="M10 16l4 4 8-8" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    defect: <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path d="M16 4l12.7 22H3.3L16 4z" fill="#ef444411" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/><line x1="16" y1="13" x2="16" y2="19" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/><circle cx="16" cy="23" r="1.2" fill="#ef4444"/></svg>,
    line: <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><rect x="3" y="20" width="26" height="6" rx="2" fill="#22c55e22" stroke="#22c55e" strokeWidth="1.5"/><rect x="8" y="10" width="5" height="10" rx="1" fill="#22c55e33" stroke="#22c55e" strokeWidth="1.2"/><rect x="19" y="10" width="5" height="10" rx="1" fill="#22c55e33" stroke="#22c55e" strokeWidth="1.2"/><circle cx="16" cy="10" r="3" fill="#22c55e44" stroke="#22c55e" strokeWidth="1.2"/></svg>,
    alarm: <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path d="M16 5c-5 0-9 4-9 9v5l-2 2v1h22v-1l-2-2v-5c0-5-4-9-9-9z" fill="#f59e0b22" stroke="#f59e0b" strokeWidth="1.5"/><path d="M13 22a3 3 0 006 0" stroke="#f59e0b" strokeWidth="1.5"/><circle cx="22" cy="9" r="4" fill="#ef4444" stroke="#111827" strokeWidth="1.5"/></svg>,
    gear: <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="4" fill="#818cf822" stroke="#818cf8" strokeWidth="1.5"/><path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.5 6.5l2.1 2.1M23.4 23.4l2.1 2.1M6.5 25.5l2.1-2.1M23.4 8.6l2.1-2.1" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    running: <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg>,
    warning: <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#f59e0b"/></svg>,
    stopped: <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#ef4444"/></svg>,
    worker: <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6" r="4" fill="#94a3b8"/><path d="M2 18c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    temp: <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="8" y="2" width="4" height="11" rx="2" stroke="#94a3b8" strokeWidth="1.2"/><circle cx="10" cy="14" r="3.5" fill="#94a3b8" fillOpacity=".3" stroke="#94a3b8" strokeWidth="1.2"/><line x1="10" y1="4" x2="10" y2="13" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  };
  return icons[name] || null;
};

const StatusDot = ({ status }) => <Icon name={status} />;

const KpiCard = ({ label, value, unit, sub, positive, iconName }) => (
  <div style={{ background: "#161b27", border: "1px solid #1e2740", borderRadius: 14, padding: "20px 22px", flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <Icon name={iconName} size={30} />
    </div>
    <div style={{ color: "#f1f5f9", fontSize: 32, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
      {value}<span style={{ fontSize: 15, color: "#475569", marginLeft: 3, fontWeight: 400 }}>{unit}</span>
    </div>
    {sub && <div style={{ fontSize: 12, color: positive ? "#22c55e" : "#ef4444" }}>{sub}</div>}
  </div>
);

const ttStyle = { background: "#1e2535", border: "1px solid #2a3a55", borderRadius: 8, fontSize: 12, color: "#cbd5e1" };

export default function App() {
  const [tab, setTab] = useState("overview");
  const [oeeData, setOeeData] = useState(genOee);
  const [defectData, setDefectData] = useState(genDefect);
  const [now, setNow] = useState(new Date());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => { setNow(new Date()); setTick(p => p + 1); }, 3000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (tick % 5 === 0) setOeeData(genOee());
    if (tick % 8 === 0) setDefectData(genDefect());
  }, [tick]);

  const totalTarget = LINES.reduce((a, l) => a + l.target, 0);
  const totalActual = LINES.reduce((a, l) => a + l.actual, 0);
  const avgOee = Math.round(LINES.reduce((a, l) => a + l.oee, 0) / LINES.length);
  const running = LINES.filter(l => l.status === "running").length;

  const tabs = [
    { id: "overview", label: "종합현황", icon: "oee" },
    { id: "lines", label: "라인현황", icon: "line" },
    { id: "orders", label: "작업지시", icon: "production" },
    { id: "alarms", label: "알람센터", icon: "alarm" },
  ];

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", color: "#f1f5f9", fontFamily: "'Inter', 'Pretendard', 'Noto Sans KR', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:.2} }
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:#161b27} ::-webkit-scrollbar-thumb{background:#2a3a55;border-radius:2px}
        .tab:hover { background: #161b27 !important; }
        .row:hover { background: #161b27 !important; }
        .alarm-row:hover { background: #1a2033 !important; }
        .ack-btn:hover { background: #2a3a55 !important; }
      `}</style>

      {/* Header */}
      <header style={{ background: "#111827", borderBottom: "1px solid #1a2233", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="gear" size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px", background: "linear-gradient(90deg,#a5b4fc,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NEXUS MES</div>
            <div style={{ color: "#475569", fontSize: 11, letterSpacing: 1 }}>MANUFACTURING EXECUTION SYSTEM</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 20 }}>
            {[["running", `${running}`, "가동"], ["warning", "1", "경고"], ["stopped", "1", "정지"]].map(([s, n, l]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <StatusDot status={s} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{l}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "right", borderLeft: "1px solid #1e2740", paddingLeft: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#06b6d4", letterSpacing: "-0.5px" }}>
              {now.toLocaleTimeString("ko-KR", { hour12: false })}
            </div>
            <div style={{ fontSize: 11, color: "#475569" }}>{now.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric", weekday: "short" })}</div>
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <nav style={{ background: "#111827", borderBottom: "1px solid #1a2233", padding: "0 24px", display: "flex", alignItems: "center" }}>
        {tabs.map(t => (
          <button key={t.id} className="tab" onClick={() => setTab(t.id)}
            style={{ background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #6366f1" : "2px solid transparent", color: tab === t.id ? "#a5b4fc" : "#475569", padding: "12px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 7, transition: "all .15s" }}>
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#334155" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "blink 2s infinite" }} />
          실시간 연동중 · 갱신 3s
        </div>
      </nav>

      <main style={{ padding: "20px 24px" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <KpiCard label="종합 OEE" value={avgOee} unit="%" sub={avgOee >= 85 ? "▲ 목표 달성" : "▼ 목표 미달"} positive={avgOee >= 85} iconName="oee" />
              <KpiCard label="금일 생산량" value={totalActual.toLocaleString()} unit="EA" sub={`목표 ${totalTarget.toLocaleString()} EA`} positive iconName="production" />
              <KpiCard label="달성률" value={Math.round(totalActual / totalTarget * 100)} unit="%" sub={`미달 ${(totalTarget - totalActual).toLocaleString()} EA`} positive={false} iconName="achieve" />
              <KpiCard label="불량률" value="2.4" unit="%" sub="▼ 전일 대비 -0.3%" positive iconName="defect" />
              <KpiCard label="가동 라인" value={`${running}/${LINES.length}`} unit="" sub="1개 라인 정지중" positive={false} iconName="line" />
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ flex: 2, background: "#161b27", border: "1px solid #1e2740", borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="oee" size={18} /> 시간대별 OEE 추이
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={oeeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2740" />
                    <XAxis dataKey="h" tick={{ fill: "#475569", fontSize: 11 }} />
                    <YAxis domain={[60, 100]} tick={{ fill: "#475569", fontSize: 11 }} />
                    <Tooltip contentStyle={ttStyle} />
                    <Line type="monotone" dataKey="OEE" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="가용률" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                    <Line type="monotone" dataKey="성능률" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, background: "#161b27", border: "1px solid #1e2740", borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="defect" size={18} /> 불량 유형 분포
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={defectData} cx="50%" cy="50%" outerRadius={72} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: "#2a3a55" }} fontSize={10}>
                      {defectData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % 5]} />)}
                    </Pie>
                    <Tooltip contentStyle={ttStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ flex: 2, background: "#161b27", border: "1px solid #1e2740", borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="production" size={18} /> 라인별 생산 실적 vs 목표
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={LINES.map(l => ({ name: l.name, 목표: l.target, 실적: l.actual }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2740" />
                    <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#475569", fontSize: 11 }} />
                    <Tooltip contentStyle={ttStyle} />
                    <Bar dataKey="목표" fill="#1e2740" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="실적" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, background: "#161b27", border: "1px solid #1e2740", borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="alarm" size={18} /> 최근 알람
                </div>
                {ALARMS.slice(0, 4).map(a => (
                  <div key={a.id} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                    <div style={{ marginTop: 2, flexShrink: 0 }}>
                      {a.level === "error" ? <Icon name="defect" size={16} /> : a.level === "warning" ? <Icon name="alarm" size={16} /> : <Icon name="achieve" size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{a.time} · {a.line}</div>
                      <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 2 }}>{a.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LINES ── */}
        {tab === "lines" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LINES.map(l => {
              const pct = Math.round(l.actual / l.target * 100);
              const sc = l.status === "running" ? "#22c55e" : l.status === "warning" ? "#f59e0b" : "#ef4444";
              return (
                <div key={l.id} style={{ background: "#161b27", border: `1px solid ${sc}33`, borderLeft: `3px solid ${sc}`, borderRadius: 12, padding: "18px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 110 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{l.name}</div>
                      <div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>{l.id}</div>
                    </div>
                    <span style={{ background: sc + "22", color: sc, border: `1px solid ${sc}55`, borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                      <StatusDot status={l.status} />
                      {{ running: "가동중", warning: "경고", stopped: "정지" }[l.status]}
                    </span>
                    <div style={{ flex: 1, color: "#64748b", fontSize: 13 }}>📦 {l.product}</div>
                    <div style={{ minWidth: 200 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>생산 달성률</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{l.actual.toLocaleString()} / {l.target.toLocaleString()} EA</span>
                      </div>
                      <div style={{ background: "#1e2740", borderRadius: 5, height: 7 }}>
                        <div style={{ background: sc, width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 5, transition: "width .6s" }} />
                      </div>
                      <div style={{ textAlign: "right", fontSize: 11, color: "#475569", marginTop: 3 }}>{pct}%</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 64 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: l.oee >= 85 ? "#22c55e" : l.oee >= 75 ? "#f59e0b" : "#ef4444" }}>{l.oee}%</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>OEE</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="temp" /><span style={{ fontSize: 16, fontWeight: 600, color: l.temp > 80 ? "#ef4444" : "#94a3b8" }}>{l.temp}°C</span></div>
                      <div style={{ fontSize: 11, color: "#475569" }}>온도</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="worker" /><span style={{ fontSize: 16, fontWeight: 600, color: "#94a3b8" }}>{l.workers}명</span></div>
                      <div style={{ fontSize: 11, color: "#475569" }}>작업자</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div style={{ background: "#161b27", border: "1px solid #1e2740", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid #1e2740", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="production" size={18} /><span style={{ fontWeight: 700, fontSize: 15 }}>작업지시 목록</span>
              <span style={{ marginLeft: "auto", background: "#6366f122", color: "#a5b4fc", border: "1px solid #6366f133", borderRadius: 5, padding: "2px 10px", fontSize: 12 }}>{ORDERS.length}건</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#111827" }}>
                  {["작업지시번호", "품목명", "수량", "진행률", "납기", "우선순위"].map(h => (
                    <th key={h} style={{ padding: "13px 18px", textAlign: "left", color: "#475569", fontWeight: 600, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #1e2740" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS.map(o => {
                  const pct = Math.round(o.done / o.qty * 100);
                  const pc = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" }[o.priority];
                  return (
                    <tr key={o.id} className="row" style={{ borderBottom: "1px solid #1a2233", transition: "background .15s", cursor: "default" }}>
                      <td style={{ padding: "15px 18px", color: "#818cf8", fontWeight: 600, fontFamily: "monospace", fontSize: 13 }}>{o.id}</td>
                      <td style={{ padding: "15px 18px", color: "#f1f5f9", fontWeight: 500 }}>{o.product}</td>
                      <td style={{ padding: "15px 18px", color: "#94a3b8" }}>{o.qty.toLocaleString()} EA</td>
                      <td style={{ padding: "15px 18px", minWidth: 170 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, background: "#1e2740", borderRadius: 4, height: 6 }}>
                            <div style={{ background: pct >= 80 ? "#22c55e" : pct >= 50 ? "#6366f1" : "#f59e0b", width: `${pct}%`, height: "100%", borderRadius: 4 }} />
                          </div>
                          <span style={{ color: "#94a3b8", fontSize: 12, minWidth: 34, fontWeight: 600 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "15px 18px", color: o.due.startsWith("오늘") ? "#ef4444" : "#94a3b8", fontWeight: o.due.startsWith("오늘") ? 600 : 400 }}>{o.due}</td>
                      <td style={{ padding: "15px 18px" }}>
                        <span style={{ background: pc + "22", color: pc, border: `1px solid ${pc}55`, borderRadius: 5, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                          {{ high: "긴급", medium: "보통", low: "여유" }[o.priority]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ALARMS ── */}
        {tab === "alarms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
              {[["error", "#ef4444", "긴급", 2], ["warning", "#f59e0b", "경고", 2], ["info", "#06b6d4", "정보", 1]].map(([lvl, c, label, n]) => (
                <div key={lvl} style={{ background: c + "11", border: `1px solid ${c}33`, borderRadius: 10, padding: "10px 18px", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: c }}>{n}</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
                </div>
              ))}
            </div>
            {ALARMS.map(a => {
              const lc = { error: "#ef4444", warning: "#f59e0b", info: "#06b6d4" }[a.level];
              const icon = a.level === "error" ? "defect" : a.level === "warning" ? "alarm" : "achieve";
              return (
                <div key={a.id} className="alarm-row" style={{ background: "#161b27", border: `1px solid ${lc}33`, borderLeft: `3px solid ${lc}`, borderRadius: 10, padding: "15px 20px", display: "flex", alignItems: "center", gap: 14, transition: "background .15s" }}>
                  <Icon name={icon} size={26} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{a.msg}</span>
                      <span style={{ background: "#1e2740", color: "#64748b", borderRadius: 4, padding: "1px 8px", fontSize: 11 }}>{a.line}</span>
                    </div>
                    <div style={{ color: "#475569", fontSize: 12 }}>알람 ID: {a.id} · 발생: {a.time}</div>
                  </div>
                  <button className="ack-btn" style={{ background: "#1e2740", border: "1px solid #2a3a55", color: "#94a3b8", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "background .15s" }}>확인</button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #1a2233", padding: "11px 28px", display: "flex", justifyContent: "space-between", color: "#334155", fontSize: 11, marginTop: 8 }}>
        <span>NEXUS MES v3.2.1 · © 2024 Factory Systems Co.</span>
        <span>마지막 갱신: {now.toLocaleTimeString("ko-KR", { hour12: false })}</span>
      </footer>
    </div>
  );
}