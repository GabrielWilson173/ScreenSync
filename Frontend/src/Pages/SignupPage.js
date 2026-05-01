import { useState } from "react";

function SignupPage({ onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError('');
    onSignup(username, password);
  };

  return (
    <main className="signup-page">
      <h2>Sign Up</h2>
      <p className="auth-copy">Create a new ScreenSync account to start saving and viewing your synced screen time.</p>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: '#8b1a1a', margin: 0 }}>{error}</p>}
        <button className="primary-button" type="submit">
          Create Account
        </button>
      </form>
      <p className="page-switch-text">
        Already have an account? <a className="secondary-link" href="#/login">Log in</a>
      </p>
    </main>
  );
}

export default SignupPage;