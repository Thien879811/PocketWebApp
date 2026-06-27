import React, { useState } from 'react'
import { ChevronLeft, Sparkles, Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabase'

interface AnalysisResult {
  summary: string
  totalIncome: number
  totalExpense: number
  transactionCount: number
}

const AISettings: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('clever-function/analysis/monthly', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to invoke function')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Đã xảy ra lỗi khi phân tích.')
    } finally {
      setLoading(false)
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
            <Sparkles className="w-5 h-5" />
            Trợ lý tài chính AI
          </h3>
          <p className="text-sm font-medium text-on-surface-variant opacity-80 leading-relaxed">
            Yêu cầu AI phân tích toàn bộ lịch sử thu chi của bạn và đưa ra lời khuyên cá nhân hóa.
          </p>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-secondary/10 border-2 border-secondary text-secondary py-4 rounded-2xl font-headline font-black text-lg hover:bg-secondary hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Phân tích tài chính
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Analysis Result */}
        {result && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-200 text-center">
                <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-green-600 font-bold">Thu nhập</p>
                <p className="text-sm font-black text-green-800">{result.totalIncome.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-center">
                <TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-red-500 font-bold">Chi tiêu</p>
                <p className="text-sm font-black text-red-700">{result.totalExpense.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-center">
                <CheckCircle className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-blue-500 font-bold">Giao dịch</p>
                <p className="text-sm font-black text-blue-700">{result.transactionCount}</p>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-gradient-to-br from-secondary/5 to-primary/5 p-6 rounded-[2rem] border border-secondary/10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                <h3 className="font-headline font-bold text-secondary">Phân tích từ AI</h3>
              </div>
              <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap font-medium">
                {result.summary}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default AISettings
