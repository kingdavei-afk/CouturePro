import { useState } from 'react'
import { supabase } from './supabaseClient'
import imageCompression from 'browser-image-compression'

export default function ImageUpload({ label, onUploadSuccess, folder }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    try {
      // Compression de l'image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5, // Max 500kb
        maxWidthOrHeight: 800,
        useWebWorker: true
      })

      const fileName = `${folder}/${Date.now()}_${file.name}`

      // Upload vers Supabase Storage
      const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, compressedFile)

      if (error) throw error

      // Récupération de l'URL publique
      const { data } = supabase.storage.from('photos').getPublicUrl(fileName)
      setImageUrl(data.publicUrl)
      onUploadSuccess(data.publicUrl)
      
    } catch (error) {
      alert('Erreur upload image: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="mb-3">
      <label className="block text-gray-700 text-sm mb-1">{label}</label>
      {imageUrl ? (
        <img src={imageUrl} alt="Aperçu" className="w-full h-32 object-cover rounded-lg mb-2" />
      ) : (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-2">
          Pas de photo
        </div>
      )}
      <input 
        type="file" 
        accept="image/*" 
        capture="camera" // Permet d'ouvrir l'appareil photo sur mobile
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