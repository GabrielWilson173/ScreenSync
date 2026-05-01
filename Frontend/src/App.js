import { useEffect, useState } from 'react';
import './App.css';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import ProfilePage from './Pages/ProfilePage';
import SignupPage from './Pages/SignupPage';
import WelcomePage from './Pages/WelcomePage';
import { API_URL } from "./config"

function App() {
  const [hashRoute, setHashRoute] = useState(window.location.hash || '#/welcome');
  const isDashboardRoute = hashRoute === '#/home' || hashRoute === '#/profile';

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
        localStorage.setItem('username', username);
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

  const handleSignupSubmit = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/Register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
        localStorage.setItem('username', username);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        window.location.hash = '#/home';
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.detail || "Could not create account");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Backend is offline or unreachable.");
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_URL}/Password/Change/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data?.message || 'Password updated successfully');
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.detail || 'Could not update password');
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      alert('Backend is offline or unreachable.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    window.location.hash = '#/welcome';
  };

  const renderPage = () => {
    if (hashRoute === '#/login') {
      return <LoginPage onLogin={handleLoginSubmit} />;
    }

    if (hashRoute === '#/signup') {
      return <SignupPage onSignup={handleSignupSubmit} />;
    }

    if (hashRoute === '#/home') {
      return <HomePage />;
    }

    if (hashRoute === '#/profile') {
      return <ProfilePage onPasswordChange={handlePasswordChange} onLogout={handleLogout} />;
    }

    return <WelcomePage />;
  };

  return (
    <div className={`page-shell${isDashboardRoute ? '' : ' page-shell-auth'}`}>
      {renderPage()}
    </div>
  );
}

export default App;
