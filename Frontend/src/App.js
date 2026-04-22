import { useEffect, useState } from 'react';
import './App.css';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import WelcomePage from './Pages/WelcomePage';
import { API_URL } from "./config"

function App() {
  const [hashRoute, setHashRoute] = useState(window.location.hash || '#/welcome');

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#/welcome';
    }

    const handleHashChange = () => {
      setHashRoute(window.location.hash || '#/welcome');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSubmit = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        window.location.hash = '#/home';
      } else {
        alert("Username or password is not correct");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Backend is offline or unreachable.");
    }
  };

  const renderPage = () => {
    if (hashRoute === '#/login') {
      return <LoginPage onLogin={handleLoginSubmit} />;
    }

    if (hashRoute === '#/home') {
      return <HomePage />;
    }

    return <WelcomePage />;
  };

  return <div className="page-shell">{renderPage()}</div>;
}

export default App;
