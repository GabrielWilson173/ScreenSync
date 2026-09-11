function PageShell({ title, description, navTitle = 'Pages', navLinks = [], children }) {
  return (
    <div className="page-layout">
      <section className="page-panel page-panel-main">
        {(title || description) && (
          <header className="page-header">
            {title && <h1 className="page-title">{title}</h1>}
            {description && <p className="page-description">{description}</p>}
          </header>
        )}

        <div className="page-body">{children}</div>
      </section>

      <aside className="page-panel page-panel-side" aria-label={navTitle}>
        <p className="nav-eyebrow">{navTitle}</p>
        <nav className="nav-links">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className={`nav-link${link.active ? ' nav-link-active' : ''}`}
              href={link.href}
            >
              <span>{link.label}</span>
              <span className="nav-link-arrow">↗</span>
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export default PageShell;