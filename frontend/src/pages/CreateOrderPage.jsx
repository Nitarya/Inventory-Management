import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../api/products'
import { getCustomers } from '../api/customers'
import { createOrder } from '../api/orders'

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getProducts().then(r => setProducts(r.data)).catch(() => setError('Failed to load products'))
    getCustomers().then(r => setCustomers(r.data)).catch(() => setError('Failed to load customers'))
  }, [])

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }])

  const removeItem = (idx) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx, field, value) => {
    setItems(items.map((item, i) =>
      i === idx ? { ...item, [field]: field === 'quantity' ? parseInt(value) || 0 : value } : item
    ))
  }

  const getProduct = (productId) => products.find(p => p.id === parseInt(productId))
  const getProductPrice = (productId) => getProduct(productId)?.price ?? 0
  const total = items.reduce((sum, item) => sum + getProductPrice(item.product_id) * (item.quantity || 0), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!customerId) { setError('Please select a customer'); return }
    const orderItems = items.filter(i => i.product_id).map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) || 1 }))
    if (orderItems.length === 0) { setError('Please add at least one product'); return }
    setSubmitting(true)
    try {
      await createOrder({ customer_id: parseInt(customerId), items: orderItems })
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/orders')} className="btn-ghost -ml-2 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to orders
        </button>
        <h1 className="text-2xl font-bold text-slate-900">New Order</h1>
        <p className="text-sm text-slate-500 mt-1">Select a customer and add items to create an order.</p>
      </div>

      {error && (
        <div className="toast-error">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">Customer</span>
          </div>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required className="select-field max-w-md">
            <option value="">&mdash; Select a customer &mdash;</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} &mdash; {c.email}</option>
            ))}
          </select>
          {customers.length === 0 && <p className="text-xs text-amber-600 mt-2">No customers available. Create one first.</p>}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">Items</span>
            </div>
            <button type="button" onClick={addItem} className="btn-secondary text-xs !px-3 !py-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Add item
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => {
              const prod = getProduct(item.product_id)
              const lineTotal = prod ? prod.price * (item.quantity || 0) : 0
              return (
                <div key={idx} className="flex items-end gap-3 bg-slate-50/70 rounded-lg p-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Product</label>
                    <select value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)} required className="select-field text-sm">
                      <option value="">&mdash; Select product &mdash;</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                          {p.name} &middot; ${p.price.toFixed(2)} &middot; Stock: {p.quantity}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Qty</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} required className="input-field text-sm text-center" />
                  </div>
                  <div className="w-24 text-right">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Total</label>
                    <div className="text-sm font-medium text-slate-700 py-2">${lineTotal.toFixed(2)}</div>
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} className="mb-0.5 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Remove item">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Order total</p>
              <p className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/orders')} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
