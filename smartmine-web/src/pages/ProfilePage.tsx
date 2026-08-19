import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { useAppState } from '../context/AppStateContext'
import { smartmineApi } from '../services/api/smartmineApi'

interface ProfileStats {
  averagePerformance: number
  missionCount: number
  payloadTon: number
  safetyIndex: number
}

const initialStats: ProfileStats = {
  averagePerformance: 84,
  missionCount: 126,
  payloadTon: 4820,
  safetyIndex: 93,
}

export const ProfilePage = () => {
  const { session } = useAppState()
  const [stats, setStats] = useState<ProfileStats>(initialStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const profile = await smartmineApi.getProfile(session.driver.id)
        setStats({
          averagePerformance: Math.round(profile.average_performance),
          missionCount: profile.mission_count,
          payloadTon: Math.round(profile.payload_total_ton),
          safetyIndex: Math.round(profile.safety_index),
        })
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [session.driver.id])

  return (
    <div className="page-grid">
      <PageHeader title="پروفایل راننده" />

      <Card title={session.driver.id} subtitle={session.driver.role}>
        <p>کامیون: {session.driver.truckId}</p>
        <p>شیفت: {session.driver.shift}</p>
      </Card>

      {loading ? (
        <LoadingState message="در حال دریافت اطلاعات پروفایل..." />
      ) : (
        <section className="kpi-grid">
          <StatCard label="میانگین امتیاز" value={stats.averagePerformance} />
          <StatCard label="تعداد مأموریت" value={stats.missionCount} />
          <StatCard label="تناژ حمل‌شده" value={`${stats.payloadTon} ton`} />
          <StatCard label="شاخص ایمنی" value={`${stats.safetyIndex}%`} />
        </section>
      )}
    </div>
  )
}
