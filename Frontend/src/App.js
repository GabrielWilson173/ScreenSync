import { useEffect, useState } from 'react';
import './App.css';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import WelcomePage from './Pages/WelcomePage';

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

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    window.location.hash = '#/home';
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
