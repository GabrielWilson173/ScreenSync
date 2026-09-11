import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';

function HomePage() {
  const [screenTimeData, setScreenTimeData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch("http://127.0.0.1:8000/Screentime/Get", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        // Keep the data grouped by device for the UI: { device: [entries] }.
        let groupedByDevice = {};

        if (Array.isArray(data)) {
          groupedByDevice = data.reduce((acc, item) => {
            if (!item || typeof item !== 'object') return acc;

            const device = item.device_number ?? item.deviceNum ?? item.device ?? 'Unknown';
            if (!acc[device]) {
              acc[device] = [];
            }

            acc[device].push({
              app_name: item.app_name,
              seconds: item.seconds,
            });

            return acc;
          }, {});
        } else if (data && typeof data === 'object') {
          groupedByDevice = Object.entries(data).reduce((acc, [device, entries]) => {
            if (!Array.isArray(entries)) return acc;

            acc[device] = entries
              .filter((entry) => entry && typeof entry === 'object')
              .map((entry) => ({
                app_name: entry.app_name,
                seconds: entry.seconds,
              }));

            return acc;
          }, {});
        }

        setScreenTimeData(groupedByDevice);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const flattenedEntries = Object.values(screenTimeData).flat();

  const totalSeconds = flattenedEntries.reduce(
    (sum, item) => sum + Number(item.seconds || 0),
    0
  );

  const deviceCount = Object.keys(screenTimeData).length;

  return (
    <PageShell
      title="Your Screen Time"
      description="A quick view of what has been captured from your synced apps."
      navTitle="Quick paths"
      navLinks={[
        { label: 'Home', href: '#/home', active: true },
        { label: 'Profile', href: '#/profile' },
        { label: 'Graph', href: '#/graph' },
      ]}
    >
      <section className="content-card stats-card">
        <div className="stats-row">
          <div>
            <span className="info-label">Tracked apps</span>
            <strong>{flattenedEntries.length}</strong>
          </div>
          <div>
            <span className="info-label">Tracked devices</span>
            <strong>{deviceCount}</strong>
          </div>
          <div>
            <span className="info-label">Total time</span>
            <strong>{totalSeconds.toFixed(2)} seconds</strong>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="data-container">
          {flattenedEntries.length > 0 ? (
            <div className="screen-list">
              {Object.entries(screenTimeData).map(([device, entries]) => (
                <section key={device} className="info-tile">
                  <p className="info-label">Device {device}</p>

                  <ul className="screen-list">
                    {entries.map((item, index) => (
                      <li key={`${device}-${item.app_name}-${index}`} className="screen-list-item">
                        <span>{item.app_name}</span>
                        <strong>{Number(item.seconds || 0).toFixed(2)} seconds</strong>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <p className="empty-state">No data synced yet.</p>
          )}
        </div>
      </section>
    </PageShell>
  );
}

export default HomePage;