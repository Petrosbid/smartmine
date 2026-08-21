import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Route,
  Trash2,
  Truck,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppState } from '../context/AppStateContext'
import { smartmineApi } from '../services/api/smartmineApi'
import type { NotificationCategory } from '../types/domain'

const filters: Array<{ id: NotificationCategory; label: string }> = [
  { id: 'all', label: 'همه اعلان‌ها' },
  { id: 'vehicle', label: 'سلامت خودرو' },
  { id: 'mission', label: 'مأموریت و دیسپچ' },
  { id: 'safety', label: 'ایمنی' },
  { id: 'system', label: 'سامانه' },
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'vehicle':
      return <Truck size={18} style={{ color: 'var(--primary)' }} />
    case 'mission':
      return <Route size={18} style={{ color: 'var(--info-text)' }} />
    case 'safety':
      return <AlertTriangle size={18} className="danger-text" />
    default:
      return <Bell size={18} className="muted" />
  }
}

export const NotificationsPage = () => {
  const { notifications, setNotifications, showToast } = useAppState()
  const [filter, setFilter] = useState<NotificationCategory>('all')

  const unreadTotal = notifications.filter((n) => !n.read).length

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
      showToast('اعلان به‌عنوان خوانده‌شده علامت‌گذاری شد', 'neutral')
    } catch {
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      )
    }
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    showToast('تمامی اعلان‌ها به‌عنوان خوانده‌شده علامت‌گذاری شدند', 'success')
  }

  const clearAll = () => {
    setNotifications([])
    showToast('لیست اعلان‌ها پاک شد', 'neutral')
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="هشدارها، اعلان‌ها و رویدادها"
        subtitle={`مرکز پایش پیام‌های سنسوری و رخدادهای عملیاتی شیفت (${unreadTotal} پیام خوانده‌نشده)`}
        label="پایش زنده پیام‌ها"
      />

      {/* Filter and Actions Bar */}
      <Card title="فیلتر دسته‌بندی اعلان‌ها">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div className="prompt-chips">
            {filters.map((item) => {
              const count =
                item.id === 'all'
                  ? notifications.length
                  : notifications.filter((n) => n.category === item.id).length

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`chip ${filter === item.id ? 'chip--active' : ''}`}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}{' '}
                  <span style={{ opacity: 0.7, fontSize: 11 }}>({count})</span>
                </button>
              )
            })}
          </div>

          <div className="actions-row">
            {unreadTotal > 0 && (
              <Button
                size="sm"
                variant="ghost"
                icon={<CheckCheck size={16} />}
                onClick={markAllRead}
              >
                خواندن همه
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                icon={<Trash2 size={16} />}
                onClick={clearAll}
              >
                پاکسازی لیست
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card title="فهرست وقایع و هشدارها">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={36} className="muted" />}
            title="هیچ اعلانی در این دسته‌بندی وجود ندارد"
            description="در حال حاضر پیام یا هشداری برای نمایش یافت نشد."
          />
        ) : (
          <ul className="notification-list">
            {filtered.map((item) => (
              <li key={item.id} className={item.read ? '' : 'unread'}>
                <div className="notification-item-main">
                  <div
                    className="notification-icon-box"
                    style={{
                      background:
                        item.level === 'danger'
                          ? 'var(--danger-bg)'
                          : item.level === 'warning'
                            ? 'var(--warning-bg)'
                            : 'var(--primary-bg)',
                    }}
                  >
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>{item.title}</strong>
                    <small className="muted" style={{ fontSize: 12 }}>
                      {item.timeAgo}
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge
                    label={item.read ? 'خوانده‌شده' : 'جدید'}
                    tone={item.read ? 'neutral' : item.level}
                  />
                  {!item.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Check size={14} />}
                      onClick={() => void markRead(item.id)}
                    >
                      خواندم
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
