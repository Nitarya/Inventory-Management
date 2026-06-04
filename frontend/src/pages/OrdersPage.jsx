import { useEffect, useState } from 'react'
import { getOrders } from '../api/orders'
import { Link } from 'react-router-dom'

const statusConfig = {
  pending: { class: 'badge-pending', label: 'Pending' },
  confirmed: { class: 'badge-confirmed', label: 'Confirmed' },
  shipped: { class: 'badge-shipped', label: 'Shipped' },
  delivered: { class: 'badge-delivered', label: 'Delivered' },
  cancelled: { class: 'badge-cancelled', label: 'Cancelled' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  const load = () => getOrders().then(r => setOrders(r.data)).catch(() => setError('Failed to load orders'))
  useEffect(() => { load() }, [])

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
            {orders.length > 0 && ` · $${totalRevenue.toFixed(2)} total revenue`}
          </p>
        </div>
        <Link to="/orders/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          New Order
        </Link>
      </div>

      {error && (
        <div className="toast-error">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th className="text-right">Items</th>
              <th className="text-right">Total</th>
              <th className="text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const cfg = statusConfig[o.status] || { class: 'badge bg-slate-100 text-slate-700', label: o.status }
              return (
                <tr key={o.id}>
                  <td>
                    <code className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      #{String(o.id).padStart(4, '0')}
                    </code>
                  </td>
                  <td className="font-medium text-slate-900">{o.customer_name || `Customer #${o.customer_id}`}</td>
                  <td><span className={cfg.class}>{cfg.label}</span></td>
                  <td className="text-right text-slate-500">{o.items.length}</td>
                  <td className="text-right font-medium">${o.total_amount.toFixed(2)}</td>
                  <td className="text-right text-slate-400 text-xs">
                    {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No orders yet</p>
                    <Link to="/orders/new" className="btn-primary text-xs mt-1">Create your first order</Link>
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
