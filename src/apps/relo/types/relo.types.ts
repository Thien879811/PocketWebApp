// ================================================================
// RELO APP - TYPE DEFINITIONS
// ================================================================

export interface ReloContact {
  id: string
  user_id: string
  name: string
  relationship_type: 'partner' | 'family' | 'friend' | 'other'
  avatar_url?: string
  birthday?: string
  contact_type: 'personal' | 'professional'
  notes?: string
  phone?: string
  email?: string
  preferences?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ReloContactFormValues {
  name: string
  relationship_type: 'partner' | 'family' | 'friend' | 'other'
  avatar_url?: string
  birthday?: string
  phone?: string
  email?: string
  notes?: string
}

export interface ReloAnniversary {
  id: string
  user_id: string
  contact_id?: string
  title: string
  description?: string
  anniversary_date: string // ISO date
  is_recurring: boolean
  reminder_days: number
  created_at: string
  updated_at: string
  relo_contacts?: { name: string; avatar_url?: string }
}

export interface ReloAnniversaryFormValues {
  contact_id?: string
  title: string
  description?: string
  anniversary_date: string
  is_recurring: boolean
  reminder_days: number
}

export interface ReloAppointment {
  id: string
  user_id: string
  contact_id?: string
  title: string
  description?: string
  location?: string
  appointment_date: string // ISO date
  appointment_time?: string // HH:MM
  status: 'upcoming' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  relo_contacts?: { name: string; avatar_url?: string }
}

export interface ReloAppointmentFormValues {
  contact_id?: string
  title: string
  description?: string
  location?: string
  appointment_date: string
  appointment_time?: string
  status: 'upcoming' | 'completed' | 'cancelled'
}

export interface ReloPreference {
  id: string
  user_id: string
  contact_id: string
  category: 'food' | 'hobby' | 'gift' | 'travel' | 'other'
  item: string
  notes?: string
  created_at: string
  relo_contacts?: { name: string; avatar_url?: string }
}

export interface ReloPreferenceFormValues {
  contact_id: string
  category: 'food' | 'hobby' | 'gift' | 'travel' | 'other'
  item: string
  notes?: string
}
