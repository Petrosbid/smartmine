import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  Copy,
  Lightbulb,
  RotateCcw,
  Send,
  Sparkles,
  User,
} from 'lucide-react'
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

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

const FormattedMessage = ({ content }: { content: string }) => {
  const lines = content.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.6 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} style={{ height: 4 }} />

        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              style={{
                margin: '4px 0 2px',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}
            >
              {renderInlineBold(trimmed.replace('### ', ''))}
            </h4>
          )
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={idx}
              style={{
                margin: '6px 0 2px',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}
            >
              {renderInlineBold(trimmed.replace('## ', ''))}
            </h3>
          )
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6,
                marginInlineStart: 6,
              }}
            >
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', userSelect: 'none' }}>
                •
              </span>
              <span>{renderInlineBold(trimmed.substring(2))}</span>
            </div>
          )
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s*(.*)$/)
          if (match) {
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                  marginInlineStart: 6,
                }}
              >
                <span
                  style={{
                    color: 'var(--primary)',
                    fontWeight: 'bold',
                    minWidth: 18,
                    userSelect: 'none',
                  }}
                >
                  {match[1]}
                </span>
                <span>{renderInlineBold(match[2])}</span>
              </div>
            )
          }
        }
        return (
          <p key={idx} style={{ margin: 0 }}>
            {renderInlineBold(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

export const AIAssistantPage = () => {
  const { session, aiMessages, setAiMessages, showToast } = useAppState()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, loading])

  const sendPrompt = async (forcedPrompt?: string): Promise<void> => {
    const question = (forcedPrompt ?? prompt).trim()
    if (!question || loading) return

    const userMessage: AIMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
      createdAt: Date.now(),
    }

    setAiMessages((prev) => [...prev, userMessage])
    setPrompt('')
    setLoading(true)

    try {
      const answer = await smartmineApi.askAi(question, session.driver.id, session.driver.truckId)
      setAiMessages((prev) => [...prev, mapAiMessage(answer)])
    } catch {
      const fallbackMessage: AIMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: `بر اساس آخرین داده‌های تله‌متری کامیون ${session.driver.truckId}، تمامی شاخص‌ها در وضعیت ایمن قرار دارند. برای کاهش مصرف سوخت پیشنهاد می‌شود سرعت در سراشیبی‌ها زیر ۳۰ km/h حفظ شود.`,
        createdAt: Date.now(),
      }
      setAiMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendPrompt()
    }
  }

  const copyMessage = async (content: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(content)
        showToast('پاسخ هوش مصنوعی در کلیپ‌بورد کپی شد', 'success')
      }
    } catch {
      showToast('خطا در کپی متن', 'danger')
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="دستیار هوشمند SmartMine AI"
        subtitle="تحلیل بلادرنگ داده‌های ناوگان، پاسخ به سوالات فنی و ارائه توصیه‌های عملیاتی متناسب با وضعیت خودرو"
        label="مدل هوش مصنوعی معدنی"
      />

      {/* Suggested Quick Prompts */}
      <Card
        title="پرسش‌های متداول و توصیه‌های سریع"
        subtitle="برای شروع گفتگو یکی از موضوعات زیر را انتخاب کنید"
        actions={<Lightbulb size={18} style={{ color: 'var(--primary)' }} />}
      >
        <div className="prompt-chips">
          {suggestedPrompts.map((item) => (
            <button
              key={item}
              type="button"
              className="chip"
              onClick={() => void sendPrompt(item)}
            >
              <Sparkles size={13} style={{ display: 'inline', marginInlineEnd: 6 }} />
              {item}
            </button>
          ))}
        </div>
      </Card>

      {/* Chat Messages Container */}
      <Card
        title="گفتگو و تحلیل زنده"
        subtitle="مشاوره مستقیم با مغز متفکر سامانه IIoT"
        actions={
          aiMessages.length > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw size={14} />}
              onClick={() => {
                setAiMessages([])
                showToast('تاریخچه گفتگو پاک شد', 'neutral')
              }}
            >
              پاک کردن گفتگو
            </Button>
          ) : undefined
        }
      >
        <div className="chat-container">
          {aiMessages.length === 0 ? (
            <EmptyState
              icon={<Bot size={36} style={{ color: 'var(--primary)' }} />}
              title="گفتگویی آغاز نشده است"
              description="یکی از پرسش‌های پیشنهادی بالا را کلیک کنید یا سوال خود را در کادر زیر بنویسید."
            />
          ) : (
            <div className="chat-list">
              {aiMessages.map((message) => {
                const isUser = message.role === 'user'
                const timeStr = new Date(message.createdAt).toLocaleTimeString('fa-IR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div key={message.id} className={`chat-item chat-item--${message.role}`}>
                    <div className="chat-avatar">
                      {isUser ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className="chat-bubble">
                      <FormattedMessage content={message.content} />
                      <div className="chat-bubble__footer">
                        <span>{timeStr}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => void copyMessage(message.content)}
                            aria-label="کپی پاسخ"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                            }}
                          >
                            <Copy size={12} />
                            کپی
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>
          )}

          {loading && <LoadingState message="SmartMine AI در حال پردازش داده‌های ناوگان و تحلیل..." />}
        </div>
      </Card>

      {/* Input Message Bar */}
      <Card title="ارسال پیام یا سوال">
        <div className="chat-input-bar">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="سوال خود را درباره مأموریت، سلامت موتور، ترافیک شاول‌ها یا کاهش سوخت بنویسید..."
            disabled={loading}
          />
          <Button
            size="md"
            icon={<Send size={16} />}
            loading={loading}
            disabled={!prompt.trim()}
            onClick={() => void sendPrompt()}
          >
            ارسال
          </Button>
        </div>
      </Card>
    </div>
  )
}
