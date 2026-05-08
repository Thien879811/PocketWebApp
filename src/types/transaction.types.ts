export type TransactionType = 'income' | 'expense' | 'withdrawal' | 'borrow' | 'lend';

export interface TransactionTypeMetadata {
  label: string;
  shortLabel: string;
  color: string;
  badge: string;
  icon: string;
  prefix: '+' | '-';
}

export const TRANSACTION_TYPES_METADATA: Record<TransactionType, TransactionTypeMetadata> = {
  income: {
    label: 'Thu nhập',
    shortLabel: 'Thu',
    color: 'text-secondary',
    badge: 'bg-secondary/10 text-secondary',
    icon: 'arrow_downward',
    prefix: '+'
  },
  expense: {
    label: 'Chi tiêu',
    shortLabel: 'Chi',
    color: 'text-on-surface',
    badge: 'bg-error/10 text-error',
    icon: 'arrow_upward',
    prefix: '-'
  },
  withdrawal: {
    label: 'Rút tiền',
    shortLabel: 'Rút',
    color: 'text-amber-600',
    badge: 'bg-amber-600/10 text-amber-600',
    icon: 'payments',
    prefix: '-'
  },
  borrow: {
    label: 'Vay / Thu nợ',
    shortLabel: 'Vay',
    color: 'text-secondary',
    badge: 'bg-purple-600/10 text-purple-600',
    icon: 'handshake',
    prefix: '+'
  },
  lend: {
    label: 'Cho vay / Trả nợ',
    shortLabel: 'Cho vay',
    color: 'text-indigo-600',
    badge: 'bg-blue-600/10 text-blue-600',
    icon: 'volunteer_activism',
    prefix: '-'
  }
};
