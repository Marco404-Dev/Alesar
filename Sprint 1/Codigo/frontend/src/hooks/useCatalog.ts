import { useCallback, useEffect, useState } from 'react'
import { clientApi, type CatalogItem, type SiteCode } from '../api/client'
export function useCatalog(site: SiteCode | null) {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reload = useCallback(async () => {
    if (!site) return
    setLoading(true); setError(null)
    try { setItems((await clientApi.catalog(site)).items) }
    catch (cause) { setItems([]); setError(cause instanceof Error ? cause.message : 'No se pudo cargar el menú.') }
    finally { setLoading(false) }
  }, [site])
  useEffect(() => {
    const timer = window.setTimeout(() => { void reload() }, 0)
    return () => window.clearTimeout(timer)
  }, [reload])
  return { items, loading, error, reload }
}
