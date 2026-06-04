import api from './client'

export const getProducts = () => api.get('/api/products')
export const getProduct = (id) => api.get(`/api/products/${id}`)
export const createProduct = (data) => api.post('/api/products', data)
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/api/products/${id}`)
