// Stands in for the workspace while it opens: the sidebar and the page's shapes, softly
// pulsing, so the console appears in place instead of behind a spinner. No hooks, so the
// route's Suspense fallback can use it too.
export function WorkspaceSkeleton({
  label = "Opening your workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="console-page">
      <div className="console-frame workspace-skeleton" role="status" aria-live="polite">
        <span className="sr-only">{label}</span>
        <aside className="console-sidebar" aria-hidden="true">
          <span className="sk sk-mark" />
          <span className="sk-rail">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} className="sk sk-dot" />
            ))}
          </span>
          <span className="sk-rail sk-account">
            <span className="sk sk-dot" />
            <span className="sk sk-dot" />
          </span>
        </aside>
        <div className="console-main" aria-hidden="true">
          <div className="sk-heading">
            <span className="sk sk-title" />
            <span className="sk sk-line" />
          </div>
          <div className="stat-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="sk-card sk-stat">
                <span className="sk sk-line short" />
                <span className="sk sk-number" />
                <span className="sk sk-line" />
              </div>
            ))}
          </div>
          <div className="dashboard-chart-row">
            <div className="sk-card sk-chart">
              <span className="sk sk-line short" />
              <span className="sk sk-block" />
            </div>
            <div className="sk-card sk-chart">
              <span className="sk sk-line short" />
              <span className="sk sk-block" />
            </div>
          </div>
          <div className="sk-card">
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className="sk sk-row" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
