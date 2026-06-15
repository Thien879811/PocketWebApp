import { useState, useMemo } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import type { TransactionFormValues } from '../types/transaction.schema'
import type { TransactionType } from '@/types/transaction.types'
import type { Category } from '../../categories/types/category.schema'

/**
 * Shared form state cho cả AddTransaction và EditTransaction.
 * Quản lý: transactionType, showAccountSelector, filteredCategories.
 */
export const useTransactionForm = (
  categories: Category[] | undefined,
  setValue: UseFormSetValue<TransactionFormValues>
) => {
  const [transactionType, setTransactionType] = useState<TransactionType>('expense')
  const [showAccountSelector, setShowAccountSelector] = useState(false)

  const handleTypeChange = (typeKey: 'income' | 'expense' | 'withdrawal' | 'borrow' | 'business') => {
    setTransactionType(typeKey)
    setValue('type', typeKey)
    if (typeKey === 'withdrawal') setValue('category_id', '')
  }

  const handleSubTypeChange = (type: 'borrow' | 'lend') => {
    setTransactionType(type)
    setValue('type', type)
  }

  const filteredCategories = useMemo(() =>
    (categories ?? []).filter(cat => {
      return cat.type === transactionType
    }),
    [categories, transactionType]
  )

  return {
    transactionType,
    setTransactionType,
    showAccountSelector,
    setShowAccountSelector,
    handleTypeChange,
    handleSubTypeChange,
    filteredCategories,
  }
}
