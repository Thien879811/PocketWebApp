import React, { useState } from 'react'
import { ChevronLeft, Sparkles, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabase'
const AISettings: React.FC = () => {
  const navigate = useNavigate()
  const handleAnalyze = async () => {
    const { data } = await supabase.functions.invoke(
      'express/analysis/monthly'
    );
    console.log(data);
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

            className="w-full bg-secondary/10 border-2 border-secondary text-secondary py-4 rounded-2xl font-headline font-black text-lg hover:bg-secondary hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <Loader2 className="w-6 h-6 animate-spin" />
            Phân tích tài chính
          </button>
        </div>

      </main>
    </div>
  )
}

export default AISettings
