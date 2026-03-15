import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { UpdateDialog } from '../UpdateDialog'
import { ChampionDataUpdateDialog } from '../ChampionDataUpdateDialog'
import { SettingsDialog } from '../SettingsDialog'
import { showUpdateDialogAtom } from '../../store/atoms/game.atoms'
import { showChampionDataUpdateAtom } from '../../store/atoms/champion.atoms'
import { showSettingsDialogAtom } from '../../store/atoms/ui.atoms'
import { useChampionData } from '../../hooks/useChampionData'
export function DialogsContainer() {
  const [hideSkinFeatures, setHideSkinFeatures] = useState(true)
  useEffect(() => {
    const load = async () => {
      try {
        const settings = await window.api.getSettings()
        setHideSkinFeatures(settings.hideSkinFeatures !== false)
      } catch {
        setHideSkinFeatures(true)
      }
    }
    load()
  }, [])
  const { championData, updateChampionData, isUpdatingChampionData } = useChampionData()

  const [showUpdateDialog, setShowUpdateDialog] = useAtom(showUpdateDialogAtom)
  const [showChampionDataUpdate, setShowChampionDataUpdate] = useAtom(showChampionDataUpdateAtom)
  const [showSettingsDialog, setShowSettingsDialog] = useAtom(showSettingsDialogAtom)

  return (
    <>
      <UpdateDialog isOpen={showUpdateDialog} onClose={() => setShowUpdateDialog(false)} />

      {/* Champion Data Update Dialog is hidden when skin features are disabled */}
      {!hideSkinFeatures && (
        <ChampionDataUpdateDialog
          isOpen={showChampionDataUpdate}
          onUpdate={updateChampionData}
          onSkip={() => setShowChampionDataUpdate(false)}
          currentVersion={championData?.version}
          isUpdating={isUpdatingChampionData}
        />
      )}

      <SettingsDialog isOpen={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} />
    </>
  )
}
