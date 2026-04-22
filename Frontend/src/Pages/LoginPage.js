import { useState } from "react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password); 
  };

  return (
    <main className="login-page">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="username"
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
        <button className="primary-button" type="submit">
          Login
        </button>
      </form>
    </main>
  );
}

export default LoginPage;
