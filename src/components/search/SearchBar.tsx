import { useRef } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onClear: () => void
  onSubmit?: () => void
  loading?: boolean
  placeholder?: string
  floating?: boolean
}

export function SearchBar({
  value,
  onChange,
  onClear,
  onSubmit,
  loading = false,
  placeholder = 'Search city, state, or station…',
  floating = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-full)',
        boxShadow: floating ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
        padding: '0 14px',
        height: 44,
        gap: 8,
      }}
    >
      <span style={{ fontSize: 16, color: 'var(--text-tertiary)', flexShrink: 0 }}>🔍</span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            inputRef.current?.blur()
            onSubmit?.()
          }
        }}
        placeholder={placeholder}
        style={{
          flex: 1,
          outline: 'none',
          border: 'none',
          backgroundColor: 'transparent',
          fontSize: 15,
          color: 'var(--text-primary)',
        }}
      />
      {loading && <LoadingSpinner size={16} />}
      {!loading && value && (
        <button
          onClick={() => {
            onClear()
            inputRef.current?.focus()
          }}
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'var(--text-tertiary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            flexShrink: 0,
          }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}
