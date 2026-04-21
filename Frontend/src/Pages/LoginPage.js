function LoginPage({ onLogin }) {
  return (
    <main className="login-page">
      <h2>Login</h2>
      <form className="login-form" onSubmit={onLogin}>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
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
