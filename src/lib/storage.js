import { supabase } from './supabase'

const BUCKET = 'deposits'

/**
 * Upload une photo (fichier image) vers le bucket.
 * Retourne l'URL publique du fichier.
 */
export async function uploadPhoto(file) {
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
  const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false
    })

  if (error) throw new Error(`Upload photo échoué : ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Upload un fichier audio (webm / mp4) vers le bucket.
 * Retourne l'URL publique du fichier.
 */
export async function uploadAudio(file) {
  const path = `audio/${Date.now()}-${Math.random().toString(36).slice(2)}.webm`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || 'audio/webm',
      upsert: false
    })

  if (error) throw new Error(`Upload audio échoué : ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Upload une waveform (Blob PNG) vers le bucket.
 * Retourne l'URL publique du fichier.
 */
export async function uploadWaveform(pngBlob) {
  const path = `waveforms/${Date.now()}-${Math.random().toString(36).slice(2)}.png`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, pngBlob, {
      contentType: 'image/png',
      upsert: false
    })

  if (error) throw new Error(`Upload waveform échoué : ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}