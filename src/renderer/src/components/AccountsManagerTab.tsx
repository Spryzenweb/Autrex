import { useState, useEffect } from 'react'
import {
  Loader2,
  UserPlus,
  Trash2,
  RefreshCw,
  LogIn,
  Download,
  Copy,
  Check,
  Coins,
  Gem,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface Account {
  username: string
  password: string
  riotID: string
  level: number
  server: string
  be: number
  rp: number
  oe: number
  rank: string
  rank2: string
  champions: number
  skins: number
  note: string
}

interface Champion {
  id: number
  name: string
  alias: string
  imageUrl: string | null
}

interface Skin {
  id: number
  championId: number
  championName: string
  championAlias: string
  skinName: string
  skinNum: number
  championImageUrl: string | null
  skinImageUrl: string | null
}

export default function AccountsManagerTab() {
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set())
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newAccount, setNewAccount] = useState({ username: '', password: '', note: '' })
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Modal states
  const [showChampionsModal, setShowChampionsModal] = useState(false)
  const [showSkinsModal, setShowSkinsModal] = useState(false)
  const [champions, setChampions] = useState<Champion[]>([])
  const [skins, setSkins] = useState<Skin[]>([])
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const result = await window.api.accountsLoad()
      if (result.success && result.accounts) {
        setAccounts(result.accounts)
        toast.success(`${result.accounts.length} hesap yüklendi`)
      }
    } catch (error) {
      console.error('Hesaplar yüklenemedi:', error)
      toast.error('Hesaplar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const addAccount = async () => {
    if (!newAccount.username || !newAccount.password) {
      toast.error('Kullanıcı adı ve şifre gerekli')
      return
    }

    setLoading(true)
    try {
      const result = await window.api.accountsAdd(newAccount)
      if (result.success) {
        toast.success('Hesap eklendi')
        setShowAddDialog(false)
        setNewAccount({ username: '', password: '', note: '' })
        await loadAccounts()
      } else {
        toast.error(result.error || 'Hesap eklenemedi')
      }
    } catch (error) {
      console.error('Hesap eklenemedi:', error)
      toast.error('Hesap eklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const deleteSelected = async () => {
    if (selectedAccounts.size === 0) {
      toast.error('Silinecek hesap seçin')
      return
    }

    setLoading(true)
    try {
      const usernames = Array.from(selectedAccounts)
      const result = await window.api.accountsDelete(usernames)
      if (result.success) {
        toast.success(`${usernames.length} hesap silindi`)
        setSelectedAccounts(new Set())
        await loadAccounts()
      } else {
        toast.error(result.error || 'Hesaplar silinemedi')
      }
    } catch (error) {
      console.error('Hesaplar silinemedi:', error)
      toast.error('Hesaplar silinemedi')
    } finally {
      setLoading(false)
    }
  }

  const loginAccount = async (username: string, password: string) => {
    setLoading(true)
    toast.info('Hesaba giriş yapılıyor...')

    try {
      const result = await window.api.accountsLogin({ username, password })
      if (result.success) {
        toast.success('Hesaba giriş yapıldı! LCU hazır olduğunda "Güncelle" butonuna tıklayın.')
      } else {
        toast.error(result.error || 'Giriş yapılamadı')
      }
    } catch (error) {
      console.error('Giriş yapılamadı:', error)
      toast.error('Giriş yapılamadı')
    } finally {
      setLoading(false)
    }
  }

  const pullAccountData = async (username: string, password: string) => {
    setLoading(true)
    toast.info('Hesap bilgileri çekiliyor...')
    try {
      const result = await window.api.accountsPullData({ username, password })
      if (result.success) {
        toast.success('Hesap bilgileri güncellendi')
        await loadAccounts()
      } else {
        toast.error(result.error || 'Bilgiler çekilemedi')
      }
    } catch (error) {
      console.error('Bilgiler çekilemedi:', error)
      toast.error('Bilgiler çekilemedi')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedAccounts.size === accounts.length) {
      setSelectedAccounts(new Set())
    } else {
      setSelectedAccounts(new Set(accounts.map((a) => a.username)))
    }
  }

  const toggleSelect = (username: string) => {
    const newSelected = new Set(selectedAccounts)
    if (newSelected.has(username)) {
      newSelected.delete(username)
    } else {
      newSelected.add(username)
    }
    setSelectedAccounts(newSelected)
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Kopyalandı!')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('Kopyalanamadı')
    }
  }

  const loadChampions = async () => {
    setModalLoading(true)
    try {
      const result = await window.api.accountsGetChampions()
      if (result.success && result.champions) {
        setChampions(result.champions)
        setShowChampionsModal(true)
      } else {
        toast.error(result.error || 'Şampiyonlar yüklenemedi')
      }
    } catch (error) {
      console.error('Şampiyonlar yüklenemedi:', error)
      toast.error('Şampiyonlar yüklenemedi')
    } finally {
      setModalLoading(false)
    }
  }

  const loadSkins = async () => {
    setModalLoading(true)
    try {
      const result = await window.api.accountsGetSkins()
      if (result.success && result.skins) {
        setSkins(result.skins)
        setShowSkinsModal(true)
      } else {
        toast.error(result.error || 'Skinler yüklenemedi')
      }
    } catch (error) {
      console.error('Skinler yüklenemedi:', error)
      toast.error('Skinler yüklenemedi')
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Hesap Yöneticisi</h2>
            <p className="text-sm text-gray-400">
              League of Legends hesaplarınızı yönetin ve hızlıca geçiş yapın
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddDialog(true)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Hesap Ekle
            </button>
            <button
              onClick={loadAccounts}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Yenile
            </button>
            <button
              onClick={toggleSelectAll}
              disabled={accounts.length === 0}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 rounded-lg"
            >
              Tümünü Seç
            </button>
            <button
              onClick={deleteSelected}
              disabled={loading || selectedAccounts.size === 0}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Seçilenleri Sil
            </button>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left p-3">Seç</th>
                <th className="text-left p-3">Kullanıcı Adı</th>
                <th className="text-left p-3">Riot ID</th>
                <th className="text-left p-3">Seviye</th>
                <th className="text-left p-3">Sunucu</th>
                <th className="text-left p-3">BE</th>
                <th className="text-left p-3">RP</th>
                <th className="text-left p-3">OE</th>
                <th className="text-left p-3">SoloQ</th>
                <th className="text-left p-3">FlexQ</th>
                <th className="text-left p-3">Şampiyonlar</th>
                <th className="text-left p-3">Skinler</th>
                <th className="text-left p-3">Not</th>
                <th className="text-left p-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedAccounts.has(account.username)}
                      onChange={() => toggleSelect(account.username)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.username}</span>
                      <button
                        onClick={() => copyToClipboard(account.username, `username-${index}`)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Kullanıcı adını kopyala"
                      >
                        {copiedField === `username-${index}` ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="p-3">{account.riotID || '-'}</td>
                  <td className="p-3">{account.level || 0}</td>
                  <td className="p-3">{account.server || '-'}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-blue-400" />
                      <span>{account.be?.toLocaleString() || 0}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Gem className="w-4 h-4 text-yellow-400" />
                      <span>{account.rp?.toLocaleString() || 0}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span>{account.oe?.toLocaleString() || 0}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                      {account.rank || 'Unranked'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                      {account.rank2 || 'Unranked'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={loadChampions}
                      disabled={modalLoading}
                      className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      {account.champions || 0}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={loadSkins}
                      disabled={modalLoading}
                      className="text-purple-400 hover:text-purple-300 underline cursor-pointer"
                    >
                      {account.skins || 0}
                    </button>
                  </td>
                  <td className="p-3">
                    <span className="text-xs text-gray-400">{account.note || '-'}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => loginAccount(account.username, account.password)}
                        disabled={loading}
                        className="px-2 py-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-600 rounded text-xs flex items-center gap-1"
                        title="Hesaba giriş yap (League Client'ı kapatıp yeniden açar)"
                      >
                        <LogIn className="w-3 h-3" />
                        Giriş
                      </button>
                      <button
                        onClick={() => pullAccountData(account.username, account.password)}
                        disabled={loading}
                        className="px-2 py-1 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 rounded text-xs flex items-center gap-1"
                        title="Açık olan hesabın bilgilerini çek (League Client'ı kapatmaz)"
                      >
                        <Download className="w-3 h-3" />
                        Güncelle
                      </button>
                      <button
                        onClick={() => copyToClipboard(account.password, `password-${index}`)}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1"
                        title="Şifreyi kopyala"
                      >
                        {copiedField === `password-${index}` ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {accounts.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            Henüz hesap eklenmemiş. "Hesap Ekle" butonuna tıklayarak başlayın.
          </div>
        )}
      </div>

      {/* Add Account Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700 w-96">
            <h3 className="text-lg font-semibold mb-4">Yeni Hesap Ekle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="kullanici_adi"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Şifre</label>
                <input
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Not (Opsiyonel)</label>
                <input
                  type="text"
                  value={newAccount.note}
                  onChange={(e) => setNewAccount({ ...newAccount, note: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="Ana hesap, smurf, vb."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg"
              >
                Ekle
              </button>
              <button
                onClick={() => {
                  setShowAddDialog(false)
                  setNewAccount({ username: '', password: '', note: '' })
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 rounded-lg"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Champions Modal */}
      {showChampionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700 w-[800px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Sahip Olunan Şampiyonlar ({champions.length})
              </h3>
              <button
                onClick={() => setShowChampionsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-3">
                {champions.map((champion) => (
                  <div
                    key={champion.id}
                    className="bg-[#0a0a0a] border border-gray-700 rounded-lg overflow-hidden hover:bg-gray-800/50 transition-colors"
                  >
                    {champion.imageUrl ? (
                      <img
                        src={champion.imageUrl}
                        alt={champion.name}
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div
                      className={
                        champion.imageUrl
                          ? 'hidden'
                          : 'w-full h-24 bg-gray-800 flex items-center justify-center'
                      }
                    >
                      <span className="text-gray-500 text-xs">Resim yok</span>
                    </div>
                    <div className="p-2">
                      <div className="font-medium text-sm truncate">{champion.name}</div>
                      <div className="text-xs text-gray-400 truncate">{champion.alias}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowChampionsModal(false)}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skins Modal */}
      {showSkinsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700 w-[900px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sahip Olunan Skinler ({skins.length})</h3>
              <button
                onClick={() => setShowSkinsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                {skins.map((skin) => (
                  <div
                    key={skin.id}
                    className="bg-[#0a0a0a] border border-gray-700 rounded-lg overflow-hidden hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="flex-shrink-0">
                        {skin.championImageUrl ? (
                          <img
                            src={skin.championImageUrl}
                            alt={skin.championName}
                            className="w-16 h-16 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div
                          className={
                            skin.championImageUrl
                              ? 'hidden'
                              : 'w-16 h-16 bg-gray-800 rounded flex items-center justify-center'
                          }
                        >
                          <span className="text-gray-500 text-xs">?</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{skin.skinName}</div>
                        <div className="text-xs text-gray-400 truncate">{skin.championName}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {skin.id}</div>
                      </div>
                    </div>
                    {skin.skinImageUrl && (
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={skin.skinImageUrl}
                          alt={skin.skinName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.parentElement?.classList.add('hidden')
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowSkinsModal(false)}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
