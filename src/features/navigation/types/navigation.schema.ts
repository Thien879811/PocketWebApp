export interface AppNavigation {
  id: string
  user_id: string
  group_key: string
  group_label: string
  item_label: string
  item_path: string
  item_icon: string
  item_color: string
  sort_order: number
  is_external: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AppNavigationFormValues {
  group_key: string
  group_label: string
  item_label: string
  item_path: string
  item_icon?: string
  item_color?: string
  sort_order?: number
  is_external?: boolean
  is_active?: boolean
}
