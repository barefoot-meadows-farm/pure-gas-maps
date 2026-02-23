import { type ReactNode, useRef, useState, useCallback } from 'react'

interface SheetProps {
  isOpen: boolean
  snapIndex: 0 | 1
  onClose: () => void
  onSnapChange: (index: 0 | 1) => void
  children: ReactNode
}

// Snap points as percentages of screen height (from bottom)
const SNAP_HEIGHTS = ['45%', '92%'] as const

export function Sheet({ isOpen, snapIndex, onClose, onSnapChange, children }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    dragStartY.current = e.touches[0].clientY
    dragStartHeight.current = sheetRef.current?.offsetHeight ?? 0
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setIsDragging(false)
    const deltaY = e.changedTouches[0].clientY - dragStartY.current

    if (deltaY > 80) {
      // Dragged down significantly
      if (snapIndex === 1) {
        onSnapChange(0)
      } else {
        onClose()
      }
    } else if (deltaY < -60 && snapIndex === 0) {
      onSnapChange(1)
    }
  }, [snapIndex, onClose, onSnapChange])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop — only dim when fully expanded */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: snapIndex === 1 ? 'rgba(0,0,0,0.4)' : 'transparent',
          transition: 'background-color var(--transition-sheet)',
          zIndex: 150,
          bottom: 'var(--tab-bar-total)',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 'var(--tab-bar-total)',
          height: SNAP_HEIGHTS[snapIndex],
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          boxShadow: 'var(--shadow-sheet)',
          zIndex: 160,
          display: 'flex',
          flexDirection: 'column',
          transition: isDragging ? 'none' : 'height var(--transition-sheet)',
          animation: 'sheet-slide-up var(--transition-sheet)',
          overflow: 'hidden',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div
          style={{
            width: '100%',
            height: 'var(--sheet-handle-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'grab',
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--border-color)',
            }}
          />
        </div>

        {/* Content */}
        <div
          className="scroll-area"
          style={{
            flex: 1,
            paddingBottom: 'var(--safe-bottom)',
            overflow: snapIndex === 1 ? 'auto' : 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
