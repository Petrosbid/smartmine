import { RotateCcw, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { useAppState } from '../context/AppStateContext'
import { mapAiMessage } from '../services/api/mappers'
import { smartmineApi } from '../services/api/smartmineApi'
import { suggestedPrompts } from '../services/mock/aiService'
import type { AIMessage } from '../types/domain'

export const AIAssistantPage = () => {
  const {
    session,
    aiMessages,
    setAiMessages,
  } = useAppState()

  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const sendPrompt = async (forcedPrompt?: string): Promise<void> => {
    const question = (forcedPrompt ?? prompt).trim()
    if (!question) return

    const userMessage: AIMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
      createdAt: Date.now(),
    }
    setAiMessages([...aiMessages, userMessage])
    setPrompt('')
    setLoading(true)

    try {
      const answer = await smartmineApi.askAi(question, session.driver.id, session.driver.truckId)
      setAiMessages((prev) => [...prev, mapAiMessage(answer)])
    } catch {
      const errorMessage: AIMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: 'ارتباط با سرویس AI برقرار نیست. سیستم در حالت Demo ادامه می‌دهد.',
        createdAt: Date.now(),
      }
      setAiMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-grid">
      <PageHeader title="SmartMine AI" subtitle="تحلیل هوشمند بر پایه داده‌های جاری" />

      <Card title="پرسش‌های پیشنهادی">
        <div className="prompt-row">
          {suggestedPrompts.map((item) => (
            <button key={item} type="button" className="chip" onClick={() => sendPrompt(item)}>
              {item}
            </button>
          ))}
        </div>
      </Card>

      <Card title="گفتگو">
        {aiMessages.length === 0 ? (
          <EmptyState title="گفتگو هنوز شروع نشده" description="یکی از پرسش‌های پیشنهادی را انتخاب کنید." />
        ) : (
          <div className="chat-list">
            {aiMessages.map((message) => (
              <div key={message.id} className={`chat-item chat-item--${message.role}`}>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
        )}
        {loading && <LoadingState message="SmartMine AI در حال تحلیل..." />}
      </Card>

      <Card title="ارسال پیام">
        <div className="input-row">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="پیام خود را بنویسید..."
          />
          <Button onClick={() => sendPrompt()} icon={<Send size={16} />}>
            ارسال
          </Button>
          <Button variant="ghost" onClick={() => setAiMessages([])} icon={<RotateCcw size={16} />}>
            پاک کردن گفتگو
          </Button>
        </div>
      </Card>
    </div>
  )
}
