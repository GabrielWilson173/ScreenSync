import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { API_URL } from '../config';

function ProfilePage({ onPasswordChange, onLogout }) {
  const isSignedIn = Boolean(localStorage.getItem('access_token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const token = localStorage.getItem('access_token');

      if (!token || username) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/User/Get`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.username) {
            setUsername(data.username);
            localStorage.setItem('username', data.username);
          }
        }
      } catch (fetchError) {
        console.error('Error loading username:', fetchError);
      }
    };

    fetchUsername();
  }, [username]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setError('');
    onPasswordChange(currentPassword, newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
  };

  return (
    <PageShell
      title="Profile"
      description="A simple profile space for your ScreenSync account."
      navTitle="Quick paths"
      navLinks={[
        { label: 'Home', href: '#/home' },
      ]}
    >
      <section className="content-card profile-card">
        <div className="profile-header">
          <div>
            <div className="profile-badge">Account</div>
            <h2>{username || (isSignedIn ? 'Loading user...' : 'Guest')}</h2>
          </div>
          <span className={`profile-status${isSignedIn ? '' : ' profile-status-offline'}`}>
            {isSignedIn ? 'Connected' : 'Offline'}
          </span>
        </div>
        <p>
          {isSignedIn
            ? 'Your login token is saved locally, so you can move between pages without signing in again.'
            : 'Log in first to attach a session and manage your account here.'}
        </p>

        <div className="info-grid">
          <div className="info-tile">
            <span className="info-label">Status</span>
            <strong>{isSignedIn ? 'Ready' : 'Offline'}</strong>
          </div>
          <div className="info-tile">
            <span className="info-label">Saved data</span>
            <strong>{isSignedIn ? 'Token stored' : 'None yet'}</strong>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="secondary-button profile-action-button"
            type="button"
            onClick={() => setShowPasswordForm((current) => !current)}
          >
            {showPasswordForm ? 'Hide password form' : 'Change password'}
          </button>

          <button
            className="secondary-button profile-action-button profile-logout-button"
            type="button"
            onClick={onLogout}
          >
            Log out
          </button>
        </div>

        {showPasswordForm && (
          <form className="password-form" onSubmit={handleSubmit}>
            <h3>Update your password</h3>
            <input
              className="login-input"
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              className="login-input"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              className="login-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button className="primary-button" type="submit">
              Save password
            </button>
          </form>
        )}
      </section>
    </PageShell>
  );
}

export default ProfilePage;