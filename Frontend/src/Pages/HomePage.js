import { useState, useEffect } from 'react';

function HomePage() {
  // 1. Create state to hold the data and loading status
  const [screenTimeData, setScreenTimeData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get the token you saved during Login (usually in localStorage)
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
        setScreenTimeData(data); // 2. Save the list of dicts to state
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []); // Empty array means this runs once when the component mounts

  return (
    <main className="home-page">
      <h1 className="home-title">Your Screen Time</h1>

      {/* 3. Handle the UI based on state */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="data-container">
        {screenTimeData.length > 0 ? (
          <ul>
            {screenTimeData.map((item, index) => (
              <li key={index}>
                <strong>{item.app_name}</strong>: {item.seconds.toFixed(2)} seconds
              </li>
            ))}
          </ul>
        ) : (
          <p>No data synced yet.</p>
        )}
      </div>
    </main>
  );
}

export default HomePage;