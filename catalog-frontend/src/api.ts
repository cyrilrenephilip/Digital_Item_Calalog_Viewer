import type { Item, SubmissionRequest, SubmissionResponse } from './types'

const BASE_URL = 'http://localhost:8001'

export type FetchItemsParams = { page?: number; perPage?: number; q?: string; category?: string }
export type ItemsResponse = { items: Item[]; total: number; page: number; per_page: number }

export async function fetchItems(params: FetchItemsParams = {}): Promise<ItemsResponse> {
  const qp = new URLSearchParams()
  if (params.page) qp.set('page', String(params.page))
  if (params.perPage) qp.set('per_page', String(params.perPage))
  if (params.q) qp.set('q', params.q)
  if (params.category) qp.set('category', params.category)
  const url = `${BASE_URL}/items${qp.toString() ? `?${qp.toString()}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch items')
  return res.json()
}

export async function fetchItem(id: number): Promise<Item> {
  const res = await fetch(`${BASE_URL}/items/${id}`)
  if (!res.ok) throw new Error('Item not found')
  return res.json()
}

export async function submitItem(id: number, data: SubmissionRequest): Promise<SubmissionResponse> {
  const res = await fetch(`${BASE_URL}/items/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Submission failed')
  return res.json()
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/categories`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export type CheckoutPayload = { items: { id: number; quantity: number; option?: string }[]; customer: { name: string; email: string; message?: string } }
export type CheckoutResponse = { status: string; total: number; count: number }

export async function checkoutCart(data: CheckoutPayload): Promise<CheckoutResponse> {
  const res = await fetch(`${BASE_URL}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Checkout failed')
  return res.json()
}
