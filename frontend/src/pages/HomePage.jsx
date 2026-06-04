import { useEffect, useState } from 'react'
import { getProducts } from '../api/products'
import { getCustomers } from '../api/customers'
import { getOrders } from '../api/orders'
import { Link } from 'react-router-dom'

function MetricCard({ title, value, icon, href, subtitle }) {
  return (
    <Link to={href} className="card p-5 hover:border-blue-200 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1.5">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      getProducts().then(r => r.data),
      getCustomers().then(r => r.data),
      getOrders().then(r => r.data),
    ])
      .then(([products, customers, orders]) => {
        setStats({ products: products.length, customers: customers.length, orders: orders.length })
      })
      .catch(() => setError('Could not connect to API'))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your inventory and orders.</p>
      </div>

      {error && (
        <div className="toast-error">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard title="Products" value={stats.products} subtitle="Items in catalog" href="/products"
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        <MetricCard title="Customers" value={stats.customers} subtitle="Registered accounts" href="/customers"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        <MetricCard title="Orders" value={stats.orders} subtitle="Total placed" href="/orders"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-800">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="btn-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
            <Link to="/customers" className="btn-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </Link>
            <Link to="/orders/new" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
