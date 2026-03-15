import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { lcuConnectedAtom } from '../store/atoms/lcu.atoms'
import { Loader2, Trash2, Users, Power, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface Friend {
  puuid: string
  name: string
  availability: string
  selected: boolean
}

export default function MiscToolsTab() {
  const { t } = useTranslation()
  const isConnected = useAtomValue(lcuConnectedAtom)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [showFriendList, setShowFriendList] = useState(false)

  const addOutput = (message: string) => {
    setOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const nukeLogs = async () => {
    setLoading(true)
    addOutput(t('miscTools.clearingLogs'))

    try {
      const result = await window.api.invoke('nuke-logs')
      if (result.success) {
        addOutput(`✓ ${t('miscTools.logsCleared', { count: result.deletedCount })}`)
        result.files.forEach((file: string) => addOutput(`  - ${file}`))
        toast.success(t('miscTools.logsCleared', { count: result.deletedCount }))
      } else {
        addOutput(`✗ ${t('error')}: ${result.error}`)
        toast.error(t('miscTools.logClearFailed'))
      }
    } catch (error) {
      addOutput(`✗ ${t('error')}: ${error}`)
      toast.error(t('miscTools.logClearFailed'))
    } finally {
      setLoading(false)
    }
  }

  const getFriends = async () => {
    setLoading(true)
    addOutput(t('miscTools.fetchingFriends'))

    try {
      const friendsData = await window.api.lcuRequest('GET', '/lol-chat/v1/friends')
      if (!friendsData || friendsData.length === 0) {
        addOutput(t('miscTools.noFriendsFound'))
        toast.info(t('miscTools.noFriendsFound'))
        setFriends([])
        setShowFriendList(false)
      } else {
        const friendList: Friend[] = friendsData.map((friend: any) => ({
          puuid: friend.puuid,
          name: friend.gameName || friend.name || friend.summonerName || friend.id || t('miscTools.noName'),
          availability: friend.availability || 'offline',
          selected: false
        }))
        setFriends(friendList)
        setShowFriendList(true)
        addOutput(t('miscTools.friendsFound', { count: friendList.length }))
        toast.success(t('miscTools.friendsListed', { count: friendList.length }))
      }
    } catch (error) {
      addOutput(`✗ ${t('error')}: ${error}`)
      toast.error(t('miscTools.friendsListFailed'))
    } finally {
      setLoading(false)
    }
  }

  const toggleFriend = (puuid: string) => {
    setFriends((prev) => prev.map((f) => (f.puuid === puuid ? { ...f, selected: !f.selected } : f)))
  }

  const toggleAllFriends = () => {
    const allSelected = friends.every((f) => f.selected)
    setFriends((prev) => prev.map((f) => ({ ...f, selected: !allSelected })))
  }

  const deleteSelectedFriends = async () => {
    const selected = friends.filter((f) => f.selected)
    if (selected.length === 0) {
      toast.warning(t('miscTools.selectFriendsToDelete'))
      return
    }

    if (!confirm(t('miscTools.confirmDeleteFriends', { count: selected.length }))) return

    setLoading(true)
    addOutput(t('miscTools.deletingFriends', { count: selected.length }))

    let successCount = 0
    for (const friend of selected) {
      try {
        await window.api.lcuRequest('DELETE', `/lol-chat/v1/friends/${friend.puuid}`)
        addOutput(`✓ ${t('miscTools.friendDeleted', { name: friend.name })}`)
        successCount++
      } catch {
        addOutput(`✗ ${t('miscTools.friendDeleteFailed', { name: friend.name })}`)
      }
    }

    addOutput(t('miscTools.friendsDeleted', { count: successCount, total: selected.length }))
    toast.success(t('miscTools.friendsDeleted', { count: successCount }))
    setLoading(false)
    getFriends()
  }

  const getRiotHwid = async () => {
    setLoading(true)
    addOutput(t('miscTools.fetchingHwid'))

    try {
      const result = await window.api.invoke('get-riot-hwid')
      if (result.success) {
        addOutput(`✓ ${t('miscTools.riotHwid', { hwid: result.hwid })}`)
        toast.success(t('miscTools.hwidCopied'))
        navigator.clipboard.writeText(result.hwid)
      } else {
        addOutput(`✗ ${t('error')}: ${result.error}`)
        toast.error(t('miscTools.hwidFailed'))
      }
    } catch (error) {
      addOutput(`✗ ${t('error')}: ${error}`)
      toast.error(t('miscTools.hwidFailed'))
    } finally {
      setLoading(false)
    }
  }

  const restartLeagueUx = async () => {
    setLoading(true)
    addOutput(t('miscTools.restartingUx'))

    try {
      await window.api.lcuRequest('POST', '/riotclient/kill-and-restart-ux')
      addOutput(`✓ ${t('miscTools.uxRestarted')}`)
      toast.success(t('miscTools.clientRestarted'))
    } catch (error) {
      addOutput(`✗ ${t('error')}: ${error}`)
      toast.error(t('miscTools.restartFailed'))
    } finally {
      setLoading(false)
    }
  }

  const disableAutolaunch = async () => {
    setLoading(true)
    addOutput(t('miscTools.disablingAutolaunch'))

    try {
      const result = await window.api.invoke('disable-riot-autolaunch')
      if (result.success) {
        addOutput(`✓ ${t('miscTools.autolaunchDisabledSuccess')}`)
        toast.success(t('miscTools.autolaunchDisabled'))
      } else {
        addOutput(`✗ ${t('error')}: ${result.error}`)
        toast.error(t('miscTools.operationFailed'))
      }
    } catch (error) {
      addOutput(`✗ ${t('error')}: ${error}`)
      toast.error(t('miscTools.operationFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">{t('lootManager.waitingForConnection')}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 h-full overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        {/* Log Management */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            {t('miscTools.logManagement')}
          </h3>
          <button
            onClick={nukeLogs}
            disabled={loading}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            {t('miscTools.clearLogs')}
          </button>
        </div>

        {/* Friend Management */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            {t('miscTools.friendManagement')}
          </h3>
          <div className="space-y-2">
            <button
              onClick={getFriends}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              {t('miscTools.listFriends')}
            </button>
          </div>
        </div>

        {/* System Tools */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            {t('miscTools.systemTools')}
          </h3>
          <div className="space-y-2">
            <button
              onClick={getRiotHwid}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              {t('miscTools.showRiotHwid')}
            </button>
            <button
              onClick={disableAutolaunch}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              {t('miscTools.disableAutolaunch')}
            </button>
          </div>
        </div>

        {/* Client Tools */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Power className="w-5 h-5 text-green-400" />
            {t('miscTools.clientTools')}
          </h3>
          <button
            onClick={restartLeagueUx}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Power className="w-4 h-4" />
            {t('miscTools.restartUx')}
          </button>
        </div>
      </div>

      {/* Friend List */}
      {showFriendList && friends.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('miscTools.friendList')} ({friends.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={toggleAllFriends}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                {friends.every((f) => f.selected) ? t('miscTools.deselectAll') : t('miscTools.selectAll')}
              </button>
              <button
                onClick={deleteSelectedFriends}
                disabled={loading || !friends.some((f) => f.selected)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-sm flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {t('miscTools.deleteSelected')} ({friends.filter((f) => f.selected).length})
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.puuid}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  friend.selected
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => toggleFriend(friend.puuid)}
              >
                <input
                  type="checkbox"
                  checked={friend.selected}
                  onChange={() => toggleFriend(friend.puuid)}
                  className="w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-xs text-gray-400">{friend.availability}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output Console */}
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{t('miscTools.operationOutput')}</h3>
          {loading && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('miscTools.operationInProgress')}
            </div>
          )}
        </div>
        <div className="bg-black/30 rounded p-3 space-y-1 h-64 overflow-y-auto text-sm font-mono">
          {output.length === 0 && !loading && (
            <p className="text-gray-500">{t('miscTools.noOperationsYet')}</p>
          )}
          {output.map((line, index) => (
            <p
              key={index}
              className={
                line.includes('✓')
                  ? 'text-green-400'
                  : line.includes('✗')
                    ? 'text-red-400'
                    : 'text-gray-300'
              }
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
