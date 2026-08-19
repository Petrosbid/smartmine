import { useMemo, useState } from 'react'
import { ApiError } from '../services/api/client'
import { smartmineApi } from '../services/api/smartmineApi'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppState } from '../context/AppStateContext'
import type { NotificationCategory } from '../types/domain'

const filters: NotificationCategory[] = ['all', 'safety', 'vehicle', 'mission', 'system']

const labels: Record<NotificationCategory, string> = {
  all: 'همه',
  safety: 'ایمنی',
  vehicle: 'خودرو',
  mission: 'مأموریت',
  system: 'سیستم',
}

export const NotificationsPage = () => {
  const { notifications, setNotifications, showToast } = useAppState()
  const [filter, setFilter] = useState<NotificationCategory>('all')

  const filtered = useMemo(
    () =>
      notifications.filter((item) =>
        filter === 'all' ? true : item.category === filter,
      ),
    [filter, notifications],
  )

  const markRead = async (id: string): Promise<void> => {
    try {
      const updated = await smartmineApi.markNotificationRead(id)
      setNotifications((prev) => prev.map((item) => (item.id === id ? updated : item)))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'به‌روزرسانی اعلان انجام نشد.'
      showToast(message, 'danger')
    }
  }

  return (
    <div className="page-grid">
      <PageHeader title="هشدارها و رویدادها" />

      <Card title="فیلترها">
        <div className="prompt-row">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip ${filter === item ? 'chip--active' : ''}`}
              onClick={() => setFilter(item)}
            >
              {labels[item]}
            </button>
          ))}
          <Button variant="ghost" onClick={() => setNotifications([])}>
            پاک کردن همه
          </Button>
        </div>
      </Card>

      <Card title="لیست رویدادها">
        {filtered.length === 0 ? (
          <EmptyState title="داده‌ای برای نمایش وجود ندارد" description="فیلتر دیگری انتخاب کنید." />
        ) : (
          <ul className="notification-list">
            {filtered.map((item) => (
              <li key={item.id} className={item.read ? '' : 'unread'}>
                <div>
                  <p>{item.title}</p>
                  <small>{item.timeAgo}</small>
                </div>
                <div className="notification-actions">
                  <StatusBadge label={item.read ? 'خوانده‌شده' : 'جدید'} tone={item.read ? 'neutral' : item.level} />
                  {!item.read && (
                    <Button variant="ghost" onClick={() => void markRead(item.id)}>
                      علامت به‌عنوان خوانده‌شده
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
