import { useMemo, useState } from 'react'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { exportTransactionsToExcel } from '@/features/reports/utils/exportTransactionsToExcel'
import api from '@/lib/axios'
import { notify } from '@/lib/notify'

/**
 * UI: Sync & Export (PocketFlow)
 * - Uses existing transactions hook for “backup”/export-related data.
 * - Snapshots/backup files are UI-only placeholders until backend storage exists.
 */
export default function SyncExport() {
    // Use existing hook to fetch transaction history as source data for export/backups.
    // Options: since the UI is “Recent Snapshots”, we keep the query broad (no filters).
    const { data: transactions = [], isLoading } = useTransactions()
    const [isBackingUp, setIsBackingUp] = useState(false)

    const uploadLedgerBackupToGoogleDrive = async (fileNameBase: string) => {
        setIsBackingUp(true)
        try {
            const res = await api.post('/sync/backup/upload-to-drive', {
                transactions,
                fileNameBase,
            })

            const file = res.data?.file
            if (!file?.webViewLink && !file?.id) {
                notify.error('Không nhận được thông tin file từ Google Drive.')
                return
            }

            notify.success('Đã backup lên Google Drive thành công.', {
                title: 'Backup',
            })

            // Mở link xem file trong tab mới (nếu có)
            if (file.webViewLink) {
                window.open(file.webViewLink, '_blank', 'noopener,noreferrer')
            }
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ||
                e?.response?.data?.message ||
                e?.message ||
                'Backup lên Google Drive thất bại.'
            notify.error(msg, { title: 'Backup lỗi' })
        } finally {
            setIsBackingUp(false)
        }
    }

    const stats = useMemo(() => {
        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((acc, t) => acc + (t.amount ?? 0), 0)

        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => acc + (t.amount ?? 0), 0)

        return { totalIncome, totalExpense, count: transactions.length }
    }, [transactions])

    return (
        <div className="bg-surface text-on-surface font-body min-h-screen relative pb-32">
            <main className="pt-4 px-6 md:px-12 max-w-3xl mx-auto">
                <button
                    className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 duration-200 flex items-center justify-center text-blue-700 dark:text-blue-400 px-4 py-2"
                    type="button"
                    aria-label="Back"
                    onClick={() => window.history.back()}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <h1 className="font-manrope font-bold flex-1 ml-2">Edit Account</h1>
                </button>
                <div className="mb-8">
                    <h2 className="font-headline text-display-lg text-primary tracking-tight">Sync &amp; Export</h2>
                    <p className="font-body text-body-md text-on-surface-variant mt-2 max-w-md">
                        Manage your financial data across devices and generate reports.
                    </p>
                </div>

                {/* Cloud Sync Section */}
                <section className="bg-surface-container-low rounded-xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                                cloud_sync
                            </span>
                        </div>

                        <div>
                            <h3 className="font-headline text-title-md font-semibold text-on-surface mb-1">Cloud Synchronization</h3>
                            <p className="font-body text-label-sm text-on-surface-variant mb-2">
                                Keep your ledger updated across all your devices securely.
                            </p>

                            <div className="inline-flex items-center gap-1 bg-surface-container-highest px-2 py-1 rounded text-label-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-[14px]">history</span>
                                <span>Last synced: {isLoading ? '...' : 'Today, 10:42 AM'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Switch (UI-only) */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 sm:self-center self-start">
                        <input checked className="sr-only peer" type="checkbox" value="" readOnly />
                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        <span className="ml-3 text-body-md font-medium text-on-surface">Auto-sync</span>
                    </label>
                </section>

                {/* Data Export Section */}
                <section className="space-y-6">
                    <h3 className="font-headline text-headline-sm text-on-surface">Data Export</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-surface-container-lowest sm:col-span-2 group relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300">
                            <div className="absolute inset-0 bg-surface-container-low opacity-50 group-hover:opacity-0 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="material-symbols-outlined text-primary transition-colors">
                                        description
                                    </span>
                                    <span className="font-body text-label-sm px-2 py-1 bg-surface-container rounded text-on-surface-variant">
                                        Export
                                    </span>
                                </div>

                                <h4 className="font-headline text-title-md font-semibold text-on-surface mb-1">
                                    Monthly Report
                                </h4>
                                <p className="font-body text-body-md text-on-surface-variant/90">
                                    Download your ledger and analytics from the Excel option.
                                </p>

                                <div className="mt-4 text-label-sm text-on-surface-variant/90">
                                    Source transactions: <span className="text-on-surface font-semibold">{stats.count}</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className="bg-surface-container-lowest group relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300 hover:bg-tertiary-container"
                        >
                            <div className="absolute inset-0 bg-surface-container-low opacity-50 group-hover:opacity-0 transition-opacity" />

                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div className="flex flex-col">
                                    <span className="material-symbols-outlined text-tertiary group-hover:text-on-tertiary-container transition-colors mb-4">
                                        table_chart
                                    </span>

                                    <h4 className="font-headline text-title-md font-semibold text-on-surface group-hover:text-on-tertiary-container transition-colors mb-1">
                                        Ledger (Excel)
                                    </h4>
                                    <p className="font-body text-body-md text-on-surface-variant group-hover:text-on-tertiary-container/80 transition-colors">
                                        Download transactions as an .xlsx spreadsheet.
                                    </p>

                                    <div className="mt-3 text-label-sm text-on-surface-variant/90">
                                        Income: <span className="text-on-surface font-semibold">{stats.totalIncome.toFixed(2)}</span>
                                        <br />
                                        Expense: <span className="text-on-surface font-semibold">{stats.totalExpense.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Left/Right download icons (both trigger Excel download) */}
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <button
                                        type="button"
                                        className="text-primary hover:text-primary-container p-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        onClick={() => exportTransactionsToExcel(transactions, 'ledger.xlsx')}
                                        disabled={isLoading}
                                        aria-label="Download ledger as Excel (right)"
                                    >
                                        <span className="material-symbols-outlined">file_download</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Backup Section */}
                <section className="bg-surface-container-low rounded-xl p-6 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-headline text-headline-sm text-on-surface">Local Backup</h3>
                            <p className="font-body text-body-md text-on-surface-variant mt-1">
                                Create an encrypted snapshot of your atelier.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => uploadLedgerBackupToGoogleDrive('pf_backup_latest.xlsx')}
                            disabled={isLoading || isBackingUp}
                            className="bg-primary text-on-primary font-headline font-semibold text-title-md px-6 py-3 rounded-xl hover:bg-primary-fixed-variant transition-colors flex items-center justify-center gap-2 active:scale-95 duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined">{isBackingUp ? 'hourglass_empty' : 'save'}</span>
                            {isBackingUp ? 'Đang backup...' : 'Backup Now'}
                        </button>
                    </div>

                    <div className="mt-8">
                        <h4 className="font-body text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
                            Recent Snapshots
                        </h4>

                        <div className="space-y-2">
                            {/* UI placeholders (until backend snapshot storage exists) */}
                            <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-outline">folder_zip</span>
                                    <div>
                                        <p className="font-body text-body-md font-medium text-on-surface">pf_backup_latest.xlsx</p>
                                        <p className="font-body text-label-sm text-on-surface-variant">Today • Google Drive</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={isLoading || isBackingUp}
                                    onClick={() => uploadLedgerBackupToGoogleDrive('pf_backup_latest.xlsx')}
                                    className="text-primary hover:text-primary-container p-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    aria-label="Download latest backup from Google Drive"
                                >
                                    <span className="material-symbols-outlined">download</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-transparent rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-outline">folder_zip</span>
                                    <div>
                                        <p className="font-body text-body-md font-medium text-on-surface">pf_backup_earlier.xlsx</p>
                                        <p className="font-body text-label-sm text-on-surface-variant">Earlier • Google Drive</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={isLoading || isBackingUp}
                                    onClick={() => uploadLedgerBackupToGoogleDrive('pf_backup_earlier.xlsx')}
                                    className="text-primary hover:text-primary-container p-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    aria-label="Download earlier backup from Google Drive"
                                >
                                    <span className="material-symbols-outlined">download</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Connected Services */}
                <section className="space-y-4">
                    <h3 className="font-headline text-headline-sm text-on-surface">Connected Services</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-surface-container-low p-5 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
                                    <span className="material-symbols-outlined text-primary">add_to_drive</span>
                                </div>
                                <div>
                                    <p className="font-body text-title-md font-medium text-on-surface">Google Drive</p>
                                    <p className="font-body text-label-sm text-secondary flex items-center gap-1 mt-0.5">
                                        <span className="material-symbols-outlined text-[12px]">check_circle</span> Connected
                                    </p>
                                </div>
                            </div>

                            <button className="text-outline hover:text-error transition-colors p-2" aria-label="Disconnect Google Drive">
                                <span className="material-symbols-outlined">link_off</span>
                            </button>
                        </div>

                        <div className="bg-surface-container-low p-5 rounded-xl flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
                                    <span className="material-symbols-outlined text-outline">cloud</span>
                                </div>
                                <div>
                                    <p className="font-body text-title-md font-medium text-on-surface">iCloud</p>
                                    <p className="font-body text-label-sm text-on-surface-variant mt-0.5">Not connected</p>
                                </div>
                            </div>

                            <span className="material-symbols-outlined text-primary">chevron_right</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
