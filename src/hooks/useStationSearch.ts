import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store'
import { searchStations } from '@/services/station-service'
import type { GasStation } from '@/types/station'

const DEBOUNCE_MS = 300

export function useStationSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GasStation[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gradeFilter = useAppStore((s) => s.gradeFilter)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const found = await searchStations(query, 30, gradeFilter)
      setResults(found)
      setLoading(false)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, gradeFilter])

  function clearSearch() {
    setQuery('')
    setResults([])
  }

  return { query, setQuery, results, loading, clearSearch }
}
