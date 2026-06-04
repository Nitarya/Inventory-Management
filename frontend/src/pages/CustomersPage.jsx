import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers'

const emptyForm = { name: '', email: '', phone: '', address: '' }

function avatarColor(name) {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const load = () => getCustomers().then(r => setCustomers(r.data)).catch(() => setError('Failed to load customers'))
  useEffect(() => { load() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) { await updateCustomer(editing, form) }
      else { await createCustomer(form) }
      setShowForm(false); setEditing(null); setForm(emptyForm); load()
    } catch (err) { setError(err.response?.data?.detail || 'Operation failed') }
  }

  const handleEdit = (c) => {
    setEditing(c.id); setForm({ name: c.name, email: c.email, phone: c.phone || '', address: c.address || '' })
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer? This action cannot be undone.')) return
    try { await deleteCustomer(id); load() }
    catch (err) { setError(err.response?.data?.detail || 'Delete failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">{customers.length} customer{customers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); setError('') }}
          className={showForm ? 'btn-secondary' : 'btn-primary'}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {error && (
        <div className="toast-error">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">{editing ? 'Edit Customer' : 'New Customer'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name <span className="text-red-400">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Jane Smith" className="input-field" />
            </div>
            <div>
              <label className="label">Email <span className="text-red-400">*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jane@company.com" className="input-field" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="input-field" />
            </div>
            <div>
              <label className="label">Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Street, city, zip" className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create Customer'}</button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarColor(c.name)} flex items-center justify-center text-white text-xs font-semibold`}>
                      {initials(c.name)}
                    </div>
                    <span className="font-medium text-slate-900">{c.name}</span>
                  </div>
                </td>
                <td className="text-slate-500">{c.email}</td>
                <td className="text-slate-500">{c.phone || <span className="text-slate-300">&mdash;</span>}</td>
                <td className="text-slate-500 max-w-[200px] truncate">{c.address || <span className="text-slate-300">&mdash;</span>}</td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(c)} className="btn-ghost">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="btn-danger">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm">No customers yet</p>
                    <button onClick={() => { setShowForm(true); setForm(emptyForm) }} className="btn-primary text-xs mt-1">Add your first customer</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
