import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Button } from './ui/button'

export function AutoMessageSettings() {
  const [enabled, setEnabled] = useState(false)
  const [messages, setMessages] = useState<string[]>([''])
  const [delay, setDelay] = useState(2000)
  const [sendOnLobbyJoin, setSendOnLobbyJoin] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const status = await window.api.autoMessageGetStatus()
      setEnabled(status.settings.enabled)
      setMessages(status.settings.messages.length > 0 ? status.settings.messages : [''])
      setDelay(status.settings.delay)
      setSendOnLobbyJoin(status.settings.sendOnLobbyJoin)
    } catch (error) {
      console.error('Failed to load auto message settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      const filteredMessages = messages.filter((msg) => msg.trim() !== '')
      await window.api.autoMessageUpdateSettings({
        enabled,
        messages: filteredMessages,
        delay,
        sendOnLobbyJoin
      })
    } catch (error) {
      console.error('Failed to save auto message settings:', error)
    }
  }

  const handleEnabledChange = async (checked: boolean) => {
    setEnabled(checked)
    await window.api.autoMessageUpdateSettings({ enabled: checked })
  }

  const handleMessageChange = (index: number, value: string) => {
    const newMessages = [...messages]
    newMessages[index] = value
    setMessages(newMessages)
  }

  const handleMessageBlur = () => {
    saveSettings()
  }

  const addMessage = () => {
    setMessages([...messages, ''])
  }

  const removeMessage = (index: number) => {
    const newMessages = messages.filter((_, i) => i !== index)
    setMessages(newMessages.length > 0 ? newMessages : [''])
    setTimeout(saveSettings, 100)
  }

  const handleDelayChange = (value: string) => {
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setDelay(numValue)
    }
  }

  const handleDelayBlur = () => {
    saveSettings()
  }

  const handleSendOnLobbyJoinChange = async (checked: boolean) => {
    setSendOnLobbyJoin(checked)
    await window.api.autoMessageUpdateSettings({ sendOnLobbyJoin: checked })
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Otomatik Mesaj
          </Label>
          <p className="text-sm text-muted-foreground">
            Şampiyon seçimi ekranına girdiğinde otomatik mesaj gönder
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleEnabledChange} />
      </div>

      {enabled && (
        <>
          <div className="space-y-3">
            <Label>Mesajlar</Label>
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => handleMessageChange(index, e.target.value)}
                    onBlur={handleMessageBlur}
                    placeholder={`Mesaj ${index + 1}`}
                    className="flex-1"
                  />
                  {messages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMessage(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addMessage} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Mesaj Ekle
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Gecikme (milisaniye)</Label>
            <Input
              type="number"
              value={delay}
              onChange={(e) => handleDelayChange(e.target.value)}
              onBlur={handleDelayBlur}
              min="0"
              step="100"
            />
            <p className="text-xs text-muted-foreground">
              Şampiyon seçimi ekranına girdikten sonra mesajları göndermeden önce beklenecek süre
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Şampiyon Seçiminde Gönder</Label>
              <p className="text-sm text-muted-foreground">
                Şampiyon seçimi ekranına her girdiğinde mesajları otomatik gönder
              </p>
            </div>
            <Switch checked={sendOnLobbyJoin} onCheckedChange={handleSendOnLobbyJoinChange} />
          </div>
        </>
      )}
    </div>
  )
}
