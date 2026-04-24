import { supabase } from '@/utils/supabase'

/**
 * Upload avatar image to Supabase Storage
 * @param file - Image file to upload
 * @param userId - User ID for folder organization
 * @returns Public URL of uploaded image
 */
export const uploadContactAvatar = async (file: File, userId: string): Promise<string> => {
  if (!file) throw new Error('Vui lòng chọn ảnh')

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Định dạng ảnh không hỗ trợ. Vui lòng chọn JPG, PNG, WebP hoặc GIF')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('Ảnh không được vượt quá 5MB')
  }

  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${file.type.split('/')[1]}`
  const storagePath = `relo-contacts/${fileName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('public-files')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage.from('public-files').getPublicUrl(storagePath)

    if (!data?.publicUrl) throw new Error('Không thể lấy đường dẫn ảnh')

    return data.publicUrl
  } catch (error: any) {
    console.error('Upload avatar error:', error)
    throw new Error(error.message || 'Lỗi tải ảnh lên')
  }
}

/**
 * Delete avatar image from Supabase Storage
 * @param avatarUrl - Public URL of the image
 */
export const deleteContactAvatar = async (avatarUrl: string): Promise<void> => {
  if (!avatarUrl) return

  try {
    // Extract the file path from the URL
    const url = new URL(avatarUrl)
    const pathParts = url.pathname.split('/storage/v1/object/public/')
    if (pathParts.length < 2) return

    const filePath = pathParts[1]
    const { error } = await supabase.storage.from('public-files').remove([filePath])

    if (error) throw error
  } catch (error: any) {
    console.error('Delete avatar error:', error)
    // Don't throw - silently fail to avoid blocking contact deletion
  }
}

/**
 * Convert File to Data URL for preview
 * @param file - Image file
 * @returns Promise resolving to data URL string
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
