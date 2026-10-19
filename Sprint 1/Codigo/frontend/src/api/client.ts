export type SiteCode = 'SMP' | 'LM'
export type CatalogItem = { productId: string; name: string; description: string; imageUrl: string | null; unitPrice: string; available: boolean; updatedAt: string | null }
export type QuoteItem = { productId: string; name: string; quantity: number; unitPrice: string; lineTotal: string }
export type Quote = { quoteId: string; site: SiteCode; items: QuoteItem[]; total: string }
export type PaymentMethod = 'YAPE' | 'CARD'
export type Customer = { dni: string; name: string; whatsapp: string }
export type OrderConfirmation = { orderId: string; pickupCode: string; state: 'PREPARANDO'; confirmedAt: string }

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'AllInstant', ...init?.headers },
    ...init,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(body.error?.message ?? 'No se pudo completar la solicitud. Inténtalo nuevamente.')
  }
  return response.json() as Promise<T>
}
export const clientApi = {
  catalog: (site: SiteCode) => request<{ site: SiteCode; items: CatalogItem[] }>(`/api/client/catalog?site=${site}`),
  quote: (site: SiteCode, items: Array<{ productId: string; quantity: number }>) => request<Quote>('/api/client/checkout/quote', { method: 'POST', body: JSON.stringify({ site, items }) }),
  simulatePayment: (quoteId: string, method: PaymentMethod) => request<{ paymentId: string; status: 'approved' | 'rejected' }>('/api/client/payments/simulate', { method: 'POST', body: JSON.stringify({ quoteId, method, outcome: 'approved' }) }),
  createOrder: (paymentId: string, customer: Customer) => request<OrderConfirmation>('/api/client/orders', { method: 'POST', body: JSON.stringify({ paymentId, customer }) }),
}
