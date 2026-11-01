export function SectionPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1 tabIndex={-1}>{title}</h1>
          <p>{description}</p>
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </header>
      <div className="page-content">{children}</div>
    </>
  );
}
