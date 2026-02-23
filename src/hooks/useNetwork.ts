import { useAppStore } from '@/store'

export function useNetwork() {
  const isOnline = useAppStore((s) => s.isOnline)
  return { isOnline }
}
