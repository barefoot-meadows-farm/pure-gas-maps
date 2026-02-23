import { useMapStore } from '@/store'
import { Sheet } from '@/components/ui/Sheet'
import { StationDetail } from './StationDetail'

export function StationBottomSheet() {
  const selectedStation = useMapStore((s) => s.selectedStation)
  const isBottomSheetOpen = useMapStore((s) => s.isBottomSheetOpen)
  const bottomSheetSnapIndex = useMapStore((s) => s.bottomSheetSnapIndex)
  const setBottomSheetOpen = useMapStore((s) => s.setBottomSheetOpen)
  const setBottomSheetSnap = useMapStore((s) => s.setBottomSheetSnap)

  return (
    <Sheet
      isOpen={isBottomSheetOpen}
      snapIndex={bottomSheetSnapIndex}
      onClose={() => setBottomSheetOpen(false)}
      onSnapChange={setBottomSheetSnap}
    >
      {selectedStation && <StationDetail station={selectedStation} />}
    </Sheet>
  )
}
