function WelcomePage() {
  return (
    <main className="welcome-page">
      <h1 className="brand-title">ScreenSync</h1>
      <div className="button-row">
        <a className="primary-button" href="#/login">
          Go to Login
        </a>
        <a className="secondary-button" href="#/signup">
          Sign Up
        </a>
      </div>
    </main>
  );
}

export default WelcomePage;
