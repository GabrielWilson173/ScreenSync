import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';

function HomePage() {
  const [screenTimeData, setScreenTimeData] = useState([]);
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
        setScreenTimeData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const totalSeconds = screenTimeData.reduce(
    (sum, item) => sum + Number(item.seconds || 0),
    0
  );

  return (
    <PageShell
      title="Your Screen Time"
      description="A quick view of what has been captured from your synced apps."
      navTitle="Quick paths"
      navLinks={[
        { label: 'Profile', href: '#/profile' },
      ]}
    >
      <section className="content-card stats-card">
        <div className="stats-row">
          <div>
            <span className="info-label">Tracked apps</span>
            <strong>{screenTimeData.length}</strong>
          </div>
          <div>
            <span className="info-label">Total time</span>
            <strong>{totalSeconds.toFixed(2)} seconds</strong>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="data-container">
          {screenTimeData.length > 0 ? (
            <ul className="screen-list">
              {screenTimeData.map((item, index) => (
                <li key={index} className="screen-list-item">
                  <span>{item.app_name}</span>
                  <strong>{Number(item.seconds || 0).toFixed(2)} seconds</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No data synced yet.</p>
          )}
        </div>
      </section>
    </PageShell>
  );
}

export default HomePage;