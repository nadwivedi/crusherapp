const navigation = [
  { label: 'Dashboard', count: '01', active: false },
  { label: 'Users', count: '02', active: true },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p>Crusher</p>
        <h2>Admin Panel</h2>
      </div>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        {navigation.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`sidebar-link${item.active ? ' active' : ''}`}
          >
            <span>{item.label}</span>
            <small>{item.count}</small>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>Users are managed from this workspace.</span>
      </div>
    </aside>
  )
}

export default Sidebar
