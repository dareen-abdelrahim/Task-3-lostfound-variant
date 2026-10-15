
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  title: '',
  description: '',
  category: 'other',
  status: 'lost',
  location: ''
}

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load the item when editing
  useEffect(() => {
    if (!id) {
      setForm(defaults)
      return
    }

    let cancelled = false

    async function loadItem() {
      setLoading(true)
      setError('')

      try {
        const res = await api.get(`/items/${id}`)

        if (cancelled) return

        const item = res.data.item ?? res.data

        setForm({
          title: item.title ?? '',
          description: item.description ?? '',
          category: item.category ?? 'other',
          status: item.status ?? 'lost',
          location: item.location ?? ''
        })
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            'Failed to load item. Please try again.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadItem()

    return () => {
      cancelled = true
    }
  }, [id])

  // Update the form whenever an input changes
  function onChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Create a new item or update an existing item
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        title: form.title.trim(),
        status: form.status,
        category: form.category,
        location: form.location.trim(),
        description: form.description.trim()
      }

      if (id) {
        await api.patch(`/items/${id}`, payload)
      } else {
        await api.post('/items', payload)
      }

      nav('/items')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'Report'} Item
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-medium">
          Title
          <input
            className="input w-full"
            type="text"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Black backpack"
            minLength={2}
            required
          />
        </label>

        <label className="block text-sm font-medium">
          Status
          <select
            className="input w-full"
            name="status"
            value={form.status}
            onChange={onChange}
            required
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
          </select>
        </label>

        <label className="block text-sm font-medium">
          Category
          <select
            className="input w-full"
            name="category"
            value={form.category}
            onChange={onChange}
            required
          >
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="documents">Documents</option>
            <option value="accessories">Accessories</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="block text-sm font-medium">
          Location (optional)
          <input
            className="input w-full"
            type="text"
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Library 2nd floor"
          />
        </label>

        <label className="block text-sm font-medium">
          Description (optional)
          <textarea
            className="input w-full"
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Describe the item..."
            rows={4}
          />
        </label>

        {error && (
          <div className="text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}

        <button
          className="btn"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
