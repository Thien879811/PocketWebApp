import ExcelJS from 'exceljs'
import { TRANSACTION_TYPES_METADATA } from '@/types/transaction.types'
import type { Transaction } from '@/features/transactions/types/transaction.schema'

export async function exportTransactionsToExcel(
  transactions: Transaction[],
  fileName = 'ledger.xlsx',
) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'PocketWebApp'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet('Ledger', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  const headers = [
    'Date',
    'Type',
    'Amount',
    'Category ID',
    'Goal ID',
    'Account ID',
    'Note',
    'Receipt URL',
    'Fee',
    'Due Date',
    'Person Name',
  ]

  worksheet.addRow(headers)

  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  }

  // Reasonable column widths
  const colWidths = [12, 12, 12, 14, 10, 12, 20, 20, 10, 12, 16]
  worksheet.columns = colWidths.map((w) => ({ width: w }))

  for (const tx of transactions) {
    const typeMeta = TRANSACTION_TYPES_METADATA[tx.type]
    const typeLabel = typeMeta?.shortLabel ?? tx.type

    worksheet.addRow([
      tx.date ?? '',
      typeLabel,
      typeof tx.amount === 'number' ? tx.amount : 0,
      tx.category_id ?? '',
      tx.goal_id ?? '',
      tx.account_id ?? '',
      tx.note ?? '',
      tx.receipt_url ?? '',
      typeof tx.fee === 'number' ? tx.fee : 0,
      tx.due_date ?? '',
      tx.person_name ?? '',
    ])
  }

  // Format amount/fee columns (C and I)
  for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
    const amountCell = worksheet.getRow(rowIndex).getCell(3)
    amountCell.numFmt = '0.00'

    const feeCell = worksheet.getRow(rowIndex).getCell(9)
    feeCell.numFmt = '0.00'
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
