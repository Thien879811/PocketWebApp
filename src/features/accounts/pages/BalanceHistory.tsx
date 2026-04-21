import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, History, TrendingUp, Wallet, Info } from 'lucide-react'
import { useBalanceHistory } from '../hooks/useAccounts'
import { formatCurrency } from '@/utils/format'
import { LoadingScreen } from '@/components/Loading'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BalanceHistory: React.FC = () => {
  const navigate = useNavigate()
  const { data: history, isLoading } = useBalanceHistory()

  if (isLoading) {
    return <LoadingScreen message="Đang tải lịch sử số dư..." />
  }

  // Group history by date
  const groupedHistory = history?.reduce((acc: any, log: any) => {
    const date = log.log_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(log)
    return acc
  }, {})

  const sortedDates = groupedHistory ? Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a)) : []

  return (
    <div className="min-h-screen bg-surface pb-24 md:p-8">
      <div className="w-full max-w-2xl mx-auto bg-surface relative flex flex-col md:rounded-[3rem] md:shadow-2xl md:min-h-[800px] overflow-hidden">
        
        {/* 🏔️ Header */}
        <header className="sticky top-0 w-full z-20 flex items-center gap-4 px-6 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-on-surface" />
          </button>
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant font-bold opacity-60">Cài đặt</p>
            <h1 className="font-headline font-bold text-xl tracking-tight text-on-surface flex items-center gap-2">
              Biến động số dư
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-8 no-scrollbar">
          {sortedDates.length === 0 ? (
            <div className="bg-surface-container-low rounded-[2.5rem] p-12 text-center border-2 border-dashed border-outline-variant/30 space-y-4">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto opacity-40">
                <History className="w-8 h-8" />
              </div>
              <p className="text-on-surface-variant font-black text-sm uppercase opacity-40 tracking-widest">Chưa có dữ liệu biến động</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <section key={date} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-px flex-1 bg-outline-variant/20"></div>
                  <h2 className="font-label text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant opacity-40">
                    {new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                  </h2>
                  <div className="h-px flex-1 bg-outline-variant/20"></div>
                </div>

                <div className="grid gap-3">
                  {groupedHistory[date].map((log: any) => (
                    <div 
                      key={log.id} 
                      className="bg-surface-container-lowest p-5 rounded-[2rem] border border-outline-variant/10 shadow-sm flex items-center justify-between group hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/10",
                          log.accounts?.color || 'bg-primary'
                        )}>
                          <Wallet size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="font-headline font-bold text-on-surface">{log.accounts?.name || 'Tài khoản ẩn'}</h4>
                          {log.note && (
                            <p className="text-[11px] font-bold text-on-surface-variant opacity-60 flex items-center gap-1 mt-0.5 capitalize">
                              <Info size={10} />
                              {log.note}
                            </p>
                          )}
                          <p className="text-[10px] font-medium text-on-surface-variant/40 mt-0.5">
                            Cập nhật lúc: {new Date(log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-headline font-black text-lg text-on-surface">
                          {formatCurrency(log.balance)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {/* We could calculate delta if we had previous logs, but for now just show balance */}
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary opacity-60">Số dư cuối</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}

          <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 space-y-3">
            <h3 className="font-headline font-black text-primary text-sm uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} /> Lưu ý
            </h3>
            <p className="text-xs font-medium text-on-surface-variant leading-relaxed opacity-80">
              Đây là nhật ký số dư hàng ngày được hệ thống tự động ghi lại. Dữ liệu này giúp bạn theo dõi sự thay đổi tổng tài sản theo thời gian một cách trực quan nhất.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default BalanceHistory
