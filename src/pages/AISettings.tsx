import React, { useState } from 'react'
import { ChevronLeft, Sparkles, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { useCategories } from '@/features/categories/hooks/useCategories'

const AISettings: React.FC = () => {
  const navigate = useNavigate()
  const apiKey = ''
  const user = useAuthStore((state) => state.user)

  const { data: transactions } = useTransactions()
  const { data: categories } = useCategories()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [insight, setInsight] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!apiKey) {
      setError('Please provide a Gemini API Key in your .env file as VITE_GEMINI_API_KEY.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setInsight(null)

    try {
      // Prepare data
      const payload = {
        transactions: transactions?.map(t => ({
          type: t.type,
          amount: t.amount,
          date: t.date,
          category: categories?.find(c => c.id === t.category_id)?.name || 'Unknown',
          note: t.note
        })),
        userName: user?.user_metadata?.full_name || 'User'
      }

      const prompt = `Bạn là một chuyên gia tư vấn tài chính cá nhân. Dưới đây là dữ liệu giao dịch của người dùng có tên là \${payload.userName}.
      
      Dữ liệu giao dịch:
      ${JSON.stringify(payload.transactions, null, 2)}
      
      Hãy phân tích thói quen chi tiêu của họ, chỉ ra những điểm nổi bật, và đưa ra 3 lời khuyên tài chính ngắn gọn, thiết thực nhất trong những tháng tới. Viết bằng tiếng Việt, trình bày rõ ràng.`

      const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      if (!res.ok) {
        throw new Error('Failed to generate insights from Gemini. Check your API Key.')
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights generated.'
      setInsight(text)
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto md:max-w-none pt-4 pb-24 overflow-y-auto">
      {/* 🏔️ Header */}
      <section className="mb-6 px-2 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </button>
        <div>
          <p className="font-label text-label-sm uppercase tracking-[0.15em] text-on-surface-variant font-bold opacity-60">Settings</p>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-secondary" />
            AI Assistant
          </h2>
        </div>
      </section>

      <main className="px-4 space-y-8">



        {/* AI Action */}
        <div className="bg-white p-6 rounded-[2rem] border border-secondary/20 shadow-xl shadow-secondary/5 space-y-4">
          <h3 className="font-headline font-black text-xl text-secondary flex items-center gap-2">
            Trợ lý tài chính AI
          </h3>
          <p className="text-sm font-medium text-on-surface-variant opacity-80 leading-relaxed">
            Yêu cầu AI phân tích toàn bộ lịch sử thu chi của bạn và đưa ra lời khuyên cá nhân hóa.
          </p>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !apiKey}
            className="w-full bg-secondary/10 border-2 border-secondary text-secondary py-4 rounded-2xl font-headline font-black text-lg hover:bg-secondary hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            {isAnalyzing ? 'Đang phân tích dữ liệu...' : 'Phân tích tài chính'}
          </button>

          {error && (
            <div className="p-4 bg-error/10 text-error rounded-xl text-sm font-medium mt-4">
              {error}
            </div>
          )}

          {insight && (
            <div className="mt-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
              <h4 className="font-headline font-black text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Kết quả phân tích:
              </h4>
              <div className="text-sm text-on-surface-variant leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                {insight}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

export default AISettings
