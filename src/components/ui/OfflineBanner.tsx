import { SafeArea } from '@/components/layout/SafeArea'

export function OfflineBanner() {
  return (
    <SafeArea
      style={{
        backgroundColor: '#92400e',
        zIndex: 200,
      }}
    >
      <div
        style={{
          padding: '8px 16px',
          textAlign: 'center',
          color: '#fef3c7',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        No internet connection · Showing cached stations
      </div>
    </SafeArea>
  )
}
