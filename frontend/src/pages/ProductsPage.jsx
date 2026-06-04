import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products'

const emptyForm = { name: '', sku: '', description: '', price: '', quantity: '', category: '' }

function StockBadge({ quantity }) {
  if (quantity === 0) return <span className="badge-stock-out">Out of stock</span>
  if (quantity < 10) return <span className="badge-stock-low">{quantity} in stock</span>
  return <span className="badge-stock-ok">{quantity} in stock</span>
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const load = () => getProducts().then(r => setProducts(r.data)).catch(() => setError('Failed to load products'))
  useEffect(() => { load() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) || 0 }
    try {
      if (editing) { await updateProduct(editing, payload) }
      else { await createProduct(payload) }
      setShowForm(false); setEditing(null); setForm(emptyForm); load()
    } catch (err) { setError(err.response?.data?.detail || 'Operation failed') }
  }

  const handleEdit = (p) => {
    setEditing(p.id); setForm({ ...p, price: p.price.toString(), quantity: p.quantity.toString() })
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This action cannot be undone.')) return
    try { await deleteProduct(id); load() }
    catch (err) { setError(err.response?.data?.detail || 'Delete failed') }
  }

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} &middot; ${totalValue.toFixed(2)} total value</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); setError('') }}
          className={showForm ? 'btn-secondary' : 'btn-primary'}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'Cancel' : 'Add Product'}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={editing ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M12 4v16m8-8H4'} />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">{editing ? 'Edit Product' : 'New Product'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Product name <span className="text-red-400">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Wireless Keyboard" className="input-field" />
            </div>
            <div>
              <label className="label">SKU <span className="text-red-400">*</span></label>
              <input name="sku" value={form.sku} onChange={handleChange} required placeholder="e.g. KB-001" className="input-field font-mono text-xs" />
            </div>
            <div>
              <label className="label">Category</label>
              <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Electronics" className="input-field" />
            </div>
            <div>
              <label className="label">Price <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                <input name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} required className="input-field pl-7" />
              </div>
            </div>
            <div>
              <label className="label">Quantity <span className="text-red-400">*</span></label>
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required className="input-field" />
            </div>
            <div className="lg:col-span-1">
              <label className="label">Description</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="Optional description" className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create Product'}</button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th className="text-right">Price</th>
              <th className="text-right">Stock</th>
              <th className="text-right">Value</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><code className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{p.sku}</code></td>
                <td className="font-medium text-slate-900">{p.name}</td>
                <td className="text-slate-500">{p.category || <span className="text-slate-300">&mdash;</span>}</td>
                <td className="text-right font-medium">${p.price.toFixed(2)}</td>
                <td className="text-right"><StockBadge quantity={p.quantity} /></td>
                <td className="text-right text-slate-500">${(p.price * p.quantity).toFixed(2)}</td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(p)} className="btn-ghost">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn-danger">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm">No products yet</p>
                    <button onClick={() => { setShowForm(true); setForm(emptyForm) }} className="btn-primary text-xs mt-1">Add your first product</button>
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
