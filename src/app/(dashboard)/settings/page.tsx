'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface UserSettings {
  displayName: string
  email: string
  avatar?: string
  notifications: {
    email: boolean
    push: boolean
    gameInvites: boolean
    achievements: boolean
  }
  privacy: {
    showProfile: boolean
    showStats: boolean
    showHistory: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: 'ko' | 'en'
    soundEnabled: boolean
    musicEnabled: boolean
    animationsEnabled: boolean
  }
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    notifications: {
      email: true,
      push: true,
      gameInvites: true,
      achievements: true,
    },
    privacy: {
      showProfile: true,
      showStats: true,
      showHistory: true,
    },
    preferences: {
      theme: 'dark',
      language: 'ko',
      soundEnabled: true,
      musicEnabled: true,
      animationsEnabled: true,
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }))
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '설정이 저장되었습니다' })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      setMessage({ type: 'error', text: '설정 저장에 실패했습니다' })
    } finally {
      setSaving(false)
    }
  }

  const updateNotification = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }

  const updatePrivacy = (key: keyof typeof settings.privacy, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }))
  }

  const updatePreference = <K extends keyof typeof settings.preferences>(
    key: K,
    value: typeof settings.preferences[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }))
  }

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-500' : 'bg-white/20'}`}
      onClick={() => onChange(!enabled)}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`}
      />
    </button>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">설정</h1>
          <p className="text-white/70">계정 및 앱 설정을 관리하세요</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Section */}
        <Card className="p-6 mb-6 bg-white/10 backdrop-blur border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">프로필</h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-3xl text-white font-bold">
              {settings.displayName?.charAt(0) || session?.user?.name?.charAt(0) || '?'}
            </div>
            <div>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                아바타 변경
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/80 mb-2">표시 이름</label>
              <input
                type="text"
                value={settings.displayName || session?.user?.name || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
              />
            </div>
            <div>
              <label className="block text-white/80 mb-2">이메일</label>
              <input
                type="email"
                value={settings.email || session?.user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/50"
              />
              <p className="text-sm text-white/50 mt-1">이메일은 변경할 수 없습니다</p>
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-6 mb-6 bg-white/10 backdrop-blur border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">알림</h2>

          <div className="space-y-4">
            {[
              { key: 'email' as const, label: '이메일 알림', desc: '중요한 업데이트를 이메일로 받습니다' },
              { key: 'push' as const, label: '푸시 알림', desc: '브라우저 푸시 알림을 받습니다' },
              { key: 'gameInvites' as const, label: '게임 초대', desc: '게임 초대 알림을 받습니다' },
              { key: 'achievements' as const, label: '업적 알림', desc: '업적 달성 시 알림을 받습니다' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{label}</div>
                  <div className="text-sm text-white/60">{desc}</div>
                </div>
                <Toggle
                  enabled={settings.notifications[key]}
                  onChange={(v) => updateNotification(key, v)}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy Section */}
        <Card className="p-6 mb-6 bg-white/10 backdrop-blur border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">개인정보</h2>

          <div className="space-y-4">
            {[
              { key: 'showProfile' as const, label: '프로필 공개', desc: '다른 사용자가 내 프로필을 볼 수 있습니다' },
              { key: 'showStats' as const, label: '통계 공개', desc: '리더보드에서 내 통계가 표시됩니다' },
              { key: 'showHistory' as const, label: '기록 공개', desc: '게임 기록을 공개합니다' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{label}</div>
                  <div className="text-sm text-white/60">{desc}</div>
                </div>
                <Toggle
                  enabled={settings.privacy[key]}
                  onChange={(v) => updatePrivacy(key, v)}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="p-6 mb-6 bg-white/10 backdrop-blur border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">환경설정</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">효과음</div>
                <div className="text-sm text-white/60">게임 효과음을 재생합니다</div>
              </div>
              <Toggle
                enabled={settings.preferences.soundEnabled}
                onChange={(v) => updatePreference('soundEnabled', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">배경 음악</div>
                <div className="text-sm text-white/60">배경 음악을 재생합니다</div>
              </div>
              <Toggle
                enabled={settings.preferences.musicEnabled}
                onChange={(v) => updatePreference('musicEnabled', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">애니메이션</div>
                <div className="text-sm text-white/60">UI 애니메이션을 사용합니다</div>
              </div>
              <Toggle
                enabled={settings.preferences.animationsEnabled}
                onChange={(v) => updatePreference('animationsEnabled', v)}
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <Button
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 py-6 text-lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '저장 중...' : '설정 저장'}
        </Button>
      </div>
    </div>
  )
}
