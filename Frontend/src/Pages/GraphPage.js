import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { API_URL } from '../config';

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = (angleDeg - 90) * (Math.PI / 180.0);
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function GraphPage() {
  const [appTotals, setAppTotals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const res = await fetch(`${API_URL}/Screentime/Get`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();

        // Flatten grouped response
        let flattened = [];
        if (Array.isArray(data)) flattened = data;
        else if (data && typeof data === 'object') flattened = Object.values(data).flat();

        // Aggregate seconds per app_name
        const totals = flattened.reduce((acc, entry) => {
          const name = entry.app_name || 'Unknown';
          acc[name] = (acc[name] || 0) + Number(entry.seconds || 0);
          return acc;
        }, {});

        const arr = Object.entries(totals)
          .map(([app_name, seconds]) => ({ app_name, seconds }))
          .sort((a, b) => b.seconds - a.seconds);

        setAppTotals(arr);
      } catch (e) {
        setError(e.message);
      }
    };

    fetchData();
  }, []);

  const total = appTotals.reduce((s, it) => s + it.seconds, 0) || 0;
  const dailyBudgetSeconds = 24 * 60 * 60;
  const usedSeconds = total;
  const remainingSeconds = Math.max(0, dailyBudgetSeconds - usedSeconds);
  const usedForPie = Math.min(usedSeconds, dailyBudgetSeconds);
  const usedRemainingSlices = [
    { label: 'Time used', seconds: usedForPie, color: '#E15759' },
    { label: 'Time remaining', seconds: remainingSeconds, color: '#59A14F' },
  ];
  const usedRemainingTotal = usedForPie + remainingSeconds;

  const colors = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7'];

  let cumulative = 0;
  let usedRemainingCumulative = 0;

  return (
    <PageShell
      title="App Usage"
      description="Which apps use the most of your screen time."
      navTitle="Quick paths"
      navLinks={[
        { label: 'Home', href: '#/home' },
        { label: 'Profile', href: '#/profile' },
        { label: 'Graph', href: '#/graph', active: true },
      ]}
    >
      <section className="content-card graph-card">
        {error && <p className="error-text">{error}</p>}

        {appTotals.length === 0 ? (
          <p className="empty-state">No data available to show.</p>
        ) : (
          <div className="graph-grid">
            <div className="graph-wrap">
              <h3>By App</h3>
              <svg viewBox="0 0 200 200" width="300" height="300" className="pie-chart">
                {appTotals.map((slice, i) => {
                  const value = slice.seconds;
                  const startAngle = (cumulative / total) * 360;
                  cumulative += value;
                  const endAngle = (cumulative / total) * 360;
                  const path = describeArc(100, 100, 90, startAngle, endAngle);
                  const color = colors[i % colors.length];
                  return <path key={slice.app_name} d={path} fill={color} />;
                })}
              </svg>

              <p className="graph-key-title">Color key</p>
              <ul className="legend">
                {appTotals.map((slice, i) => (
                  <li key={slice.app_name}>
                    <span className="legend-swatch" style={{ background: colors[i % colors.length] }} />
                    <span className="legend-label">{slice.app_name}</span>
                    <strong className="legend-value">{((slice.seconds / total) * 100).toFixed(1)}% ({formatDuration(slice.seconds)})</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="graph-wrap">
              <h3>Used vs Remaining (24h)</h3>
              <svg viewBox="0 0 200 200" width="300" height="300" className="pie-chart">
                {usedRemainingSlices.map((slice) => {
                  const value = slice.seconds;
                  const startAngle = usedRemainingTotal === 0 ? 0 : (usedRemainingCumulative / usedRemainingTotal) * 360;
                  usedRemainingCumulative += value;
                  const endAngle = usedRemainingTotal === 0 ? 360 : (usedRemainingCumulative / usedRemainingTotal) * 360;
                  const path = describeArc(100, 100, 90, startAngle, endAngle);
                  return <path key={slice.label} d={path} fill={slice.color} />;
                })}
              </svg>

              <p className="graph-key-title">Color key</p>
              <ul className="legend">
                {usedRemainingSlices.map((slice) => (
                  <li key={slice.label}>
                    <span className="legend-swatch" style={{ background: slice.color }} />
                    <span className="legend-label">{slice.label}</span>
                    <strong className="legend-value">
                      {usedRemainingTotal === 0 ? '0.0' : ((slice.seconds / usedRemainingTotal) * 100).toFixed(1)}% ({formatDuration(slice.seconds)})
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}

export default GraphPage;
