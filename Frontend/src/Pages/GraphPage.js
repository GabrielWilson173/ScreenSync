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
  const [deviceTotals, setDeviceTotals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No token found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/Screentime/Get`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();

        // Data is already grouped by device_num
        // data = { "1": [...apps], "2": [...apps], ... }
        // Aggregate seconds per app_name
        let flattened = [];
        if (Array.isArray(data)) flattened = data;
        else if (data && typeof data === 'object') {
          // Extract all apps from all devices
          flattened = Object.values(data).flat();
        }

        // Aggregate seconds per app_name
        const totals = flattened.reduce((acc, entry) => {
          const name = entry.app_name || 'Unknown';
          acc[name] = (acc[name] || 0) + Number(entry.seconds || 0);
          return acc;
        }, {});

        const arr = Object.entries(totals)
          .map(([app_name, seconds]) => ({ app_name, seconds }))
          .sort((a, b) => b.seconds - a.seconds);

        // Keep top 6 apps, group rest as MISC
        let finalAppTotals = arr;
        if (arr.length > 6) {
          const topSix = arr.slice(0, 6);
          const miscSeconds = arr.slice(6).reduce((sum, app) => sum + app.seconds, 0);
          topSix.push({ app_name: 'MISC', seconds: miscSeconds });
          finalAppTotals = topSix;
        }

        setAppTotals(finalAppTotals);

        // Aggregate seconds per device
        const deviceTotalsObj = {};
        if (Array.isArray(data)) {
          // If data is an array, aggregate by device_number property
          data.forEach((entry) => {
            const deviceNum = entry.device_number || 'Unknown';
            deviceTotalsObj[deviceNum] = (deviceTotalsObj[deviceNum] || 0) + Number(entry.seconds || 0);
          });
        } else if (data && typeof data === 'object') {
          // If data is an object keyed by device_num
          Object.entries(data).forEach(([deviceNum, apps]) => {
            if (Array.isArray(apps)) {
              const deviceSeconds = apps.reduce((sum, app) => sum + Number(app.seconds || 0), 0);
              deviceTotalsObj[deviceNum] = deviceSeconds;
            }
          });
        }

        const deviceArr = Object.entries(deviceTotalsObj)
          .map(([device_num, seconds]) => ({ device_num, seconds }))
          .sort((a, b) => b.seconds - a.seconds);

        setDeviceTotals(deviceArr);
        setError(null);
      } catch (e) {
        console.error('GraphPage fetch error:', e);
        setError(e.message);
      }
      setLoading(false);
    };

    fetchData();
  };

  const total = appTotals.reduce((s, it) => s + it.seconds, 0) || 0;
  const deviceTotal = deviceTotals.reduce((s, it) => s + it.seconds, 0) || 0;

  const colors = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7'];

  // Pre-calculate angles for app slices
  const appSlices = appTotals.map((slice, i) => {
    let startAngle = 0;
    for (let j = 0; j < i; j++) {
      startAngle += (appTotals[j].seconds / total) * 360;
    }
    const endAngle = startAngle + (slice.seconds / total) * 360;
    return { ...slice, startAngle, endAngle, color: colors[i % colors.length] };
  });

  // Pre-calculate angles for device slices
  const deviceSlices = deviceTotals.map((slice, i) => {
    let startAngle = 0;
    for (let j = 0; j < i; j++) {
      startAngle += (deviceTotals[j].seconds / deviceTotal) * 360;
    }
    const endAngle = startAngle + (slice.seconds / deviceTotal) * 360;
    return { ...slice, startAngle, endAngle, color: colors[i % colors.length] };
  });

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
        {loading && <p style={{ color: '#666' }}>Loading chart data...</p>}
        <button
          className="secondary-button"
          style={{ marginBottom: '16px', marginTop: 0 }}
          onClick={refreshData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>

        {appTotals.length === 0 ? (
          <p className="empty-state">No data available to show.</p>
        ) : (
          <div className="graph-grid">
            <div className="graph-wrap">
              <h3>By App</h3>
              <svg viewBox="0 0 200 200" width="300" height="300" className="pie-chart">
                {appSlices.map((slice) => {
                  const path = describeArc(100, 100, 90, slice.startAngle, slice.endAngle);
                  return <path key={slice.app_name} d={path} fill={slice.color} />;
                })}
              </svg>

              <p className="graph-key-title">Color key</p>
              <ul className="legend">
                {appSlices.map((slice) => (
                  <li key={slice.app_name}>
                    <span className="legend-swatch" style={{ background: slice.color }} />
                    <span className="legend-label">{slice.app_name}</span>
                    <strong className="legend-value">{((slice.seconds / total) * 100).toFixed(1)}% ({formatDuration(slice.seconds)})</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="graph-wrap">
              <h3>By Device</h3>
              <svg viewBox="0 0 200 200" width="300" height="300" className="pie-chart">
                {deviceSlices.map((slice) => {
                  const path = describeArc(100, 100, 90, slice.startAngle, slice.endAngle);
                  return <path key={`device-${slice.device_num}`} d={path} fill={slice.color} />;
                })}
              </svg>

              <p className="graph-key-title">Color key</p>
              <ul className="legend">
                {deviceSlices.map((slice) => (
                  <li key={`device-${slice.device_num}`}>
                    <span className="legend-swatch" style={{ background: slice.color }} />
                    <span className="legend-label">Device {slice.device_num}</span>
                    <strong className="legend-value">
                      {deviceTotal === 0 ? '0.0' : ((slice.seconds / deviceTotal) * 100).toFixed(1)}% ({formatDuration(slice.seconds)})
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
