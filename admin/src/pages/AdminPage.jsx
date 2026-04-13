import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
const ADMIN_AUTH_ENDPOINT = `${API_BASE_URL}/api/admin/auth`
const USERS_ENDPOINT = `${API_BASE_URL}/api/admin/users`

const emptyForm = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  state: '',
  district: '',
}

const formatDateTime = (value) => {
  if (!value) return 'Never'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Invalid date'

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function AdminPage() {
  const [admin, setAdmin] = useState(null)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users

    return users.filter((user) =>
      [user.name, user.email, user.mobile, user.state, user.district]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [search, users])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await axios.get(USERS_ENDPOINT, { withCredentials: true })
      setUsers(Array.isArray(response.data?.data) ? response.data.data : [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await axios.get(`${ADMIN_AUTH_ENDPOINT}/current`, { withCredentials: true })
        setAdmin(response.data?.data || null)
        await loadUsers()
      } catch (_error) {
        setAdmin(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAdminSession()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setIsModalOpen(false)
  }

  const openCreateModal = () => {
    setError('')
    setNotice('')
    setForm(emptyForm)
    setEditingId(null)
    setIsModalOpen(true)
  }

  const handleEdit = (user) => {
    setEditingId(user.id)
    setError('')
    setNotice('')
    setForm({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      password: '',
      state: user.state || '',
      district: user.district || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')
      setNotice('')

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        state: form.state.trim(),
        district: form.district.trim(),
      }

      if (form.password.trim()) {
        payload.password = form.password.trim()
      }

      if (!editingId && !payload.password) {
        setError('Password is required for new users')
        return
      }

      if (editingId) {
        await axios.put(`${USERS_ENDPOINT}/${editingId}`, payload, { withCredentials: true })
        setNotice('User updated successfully')
      } else {
        await axios.post(USERS_ENDPOINT, payload, { withCredentials: true })
        setNotice('User created successfully')
      }

      resetForm()
      await loadUsers()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.name}?`)
    if (!confirmed) return

    try {
      setError('')
      setNotice('')
      await axios.delete(`${USERS_ENDPOINT}/${user.id}`, { withCredentials: true })
      if (editingId === user.id) {
        resetForm()
      }
      setNotice('User deleted successfully')
      await loadUsers()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleAdminLogin = async (event) => {
    event.preventDefault()

    try {
      setIsLoggingIn(true)
      setError('')

      const response = await axios.post(
        `${ADMIN_AUTH_ENDPOINT}/login`,
        {
          email: loginForm.email.trim(),
          password: loginForm.password,
        },
        { withCredentials: true }
      )

      setAdmin(response.data?.data || null)
      setLoginForm({ email: '', password: '' })
      await loadUsers()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to login admin')
    } finally {
      setIsLoggingIn(false)
      setIsCheckingAuth(false)
    }
  }

  const handleAdminLogout = async () => {
    try {
      await axios.post(`${ADMIN_AUTH_ENDPOINT}/logout`, {}, { withCredentials: true })
    } catch (_error) {
      // Ignore logout request failure and clear local state anyway.
    } finally {
      setAdmin(null)
      setUsers([])
      setForm(emptyForm)
      setEditingId(null)
      setIsModalOpen(false)
      setNotice('')
      setSearch('')
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="eyebrow">Crusher Admin</p>
          <h1>Checking admin access...</h1>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="auth-shell">
        <form className="auth-card" onSubmit={handleAdminLogin}>
          <p className="eyebrow">Crusher Admin</p>
          <h1>Admin Login</h1>
          <p className="hero-copy">Use the single admin email and password created from the backend script.</p>

          {error ? <div className="message error">{error}</div> : null}

          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              placeholder="Admin email"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              placeholder="Admin password"
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <Sidebar />

      <main className="admin-main">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Crusher Admin</p>
            <h1>User Management</h1>
            <p className="hero-copy">
              Manage application users, update their details, and track the latest login time from one place.
            </p>
          </div>

          <div className="hero-metrics">
            <article>
              <span>Admin</span>
              <strong>{admin.email}</strong>
            </article>
            <article>
              <span>Total Users</span>
              <strong>{users.length}</strong>
            </article>
            <article>
              <span>Visible</span>
              <strong>{filteredUsers.length}</strong>
            </article>
            <article>
              <span>Session</span>
              <button type="button" className="ghost-button" onClick={handleAdminLogout}>
                Logout
              </button>
            </article>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Users</h2>
                <p>See, search, edit, and delete registered users.</p>
              </div>
              <div className="toolbar-actions">
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search users"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button type="button" className="primary-button" onClick={openCreateModal}>
                  Add User
                </button>
              </div>
            </div>

            {error ? <div className="message error">{error}</div> : null}
            {notice ? <div className="message success">{notice}</div> : null}

            <div className="table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="empty-cell">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-name">{user.name}</div>
                        </td>
                        <td>{user.mobile}</td>
                        <td>{user.email || '-'}</td>
                        <td>{[user.district, user.state].filter(Boolean).join(', ') || '-'}</td>
                        <td>{formatDateTime(user.lastLoginAt)}</td>
                        <td>
                          <div className="action-row">
                            <button type="button" className="ghost-button" onClick={() => handleEdit(user)}>
                              Edit
                            </button>
                            <button type="button" className="danger-button" onClick={() => handleDelete(user)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-cell">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {isModalOpen ? (
          <div className="modal-backdrop" onClick={resetForm}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="panel-head modal-head">
                <div>
                  <h2>{editingId ? 'Edit User' : 'Add User'}</h2>
                  <p>{editingId ? 'Update an existing account.' : 'Create a new owner account.'}</p>
                </div>
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Close
                </button>
              </div>

              <form className="user-form" onSubmit={handleSubmit}>
                <label>
                  <span>Name</span>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Company or user name" required />
                </label>

                <label>
                  <span>Mobile</span>
                  <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" required />
                </label>

                <label>
                  <span>Email</span>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
                </label>

                <label>
                  <span>Password</span>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={editingId ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                  />
                </label>

                <label>
                  <span>State</span>
                  <input name="state" value={form.state} onChange={handleChange} placeholder="State" />
                </label>

                <label>
                  <span>District</span>
                  <input name="district" value={form.district} onChange={handleChange} placeholder="District" />
                </label>

                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default AdminPage
