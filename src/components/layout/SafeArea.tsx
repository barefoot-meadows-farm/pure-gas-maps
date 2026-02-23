import type { ReactNode, CSSProperties } from 'react'

interface SafeAreaProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export function SafeArea({ children, style, className }: SafeAreaProps) {
  return (
    <div
      className={className}
      style={{
        paddingTop: 'var(--safe-top)',
        paddingLeft: 'var(--safe-left)',
        paddingRight: 'var(--safe-right)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
