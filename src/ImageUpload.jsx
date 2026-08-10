import { useState } from 'react'
import { supabase } from './supabaseClient'
import imageCompression from 'browser-image-compression'

export default function ImageUpload({ label, onUploadSuccess, folder }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    try {
      // 1. RÃ©cupÃ©rer l'utilisateur connectÃ©
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Utilisateur non connectÃ©.")

      // 2. Compression de l'image (conservÃ©e)
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true
      })

      // 3. CrÃ©ation du chemin relatif sÃ©curisÃ© (user_id/folder/file)
      const fileName = `${user.id}/${folder}/${Date.now()}_${file.name}`

      // 4. Upload avec le vrai MIME type
      const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, compressedFile, {
          contentType: compressedFile.type,
          upsert: false
        })

      if (error) throw error

      // 5. GÃ©nÃ©rer une URL signÃ©e UNIQUEMENT pour l'aperÃ§u visuel immÃ©diat dans le formulaire
      const { data: signedUrlData } = await supabase.storage
        .from('photos')
        .createSignedUrl(fileName, 3600)

      setPreviewUrl(signedUrlData?.signedUrl)

      // 6. Retourner le chemin relatif (pas l'URL) Ã  la fonction parente
      onUploadSuccess(fileName)

    } catch (error) {
      alert('Erreur upload image: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="mb-3">
      <label className="block text-gray-700 text-sm mb-1">{label}</label>
      {previewUrl ? (
        <img src={previewUrl} alt="AperÃ§u" className="w-full h-32 object-cover rounded-lg mb-2" />
      ) : (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-2">
          Pas de photo
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        capture="camera"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />
      {loading && <p className="text-xs text-gray-500 mt-1">Chargement...</p>}
    </div>
  )
}
