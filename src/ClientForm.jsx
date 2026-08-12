import { useState } from 'react'
import { supabase } from './supabaseClient'
import ImageUpload from './ImageUpload'

export default function ClientForm({ onBack }) {
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [sexe, setSexe] = useState('')
  const [notes, setNotes] = useState('')
  const [photoClient, setPhotoClient] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Normaliser le numéro ivoirien au format 225XXXXXXXXXX
  const normalizePhone = (value) => {
    let phone = value.replace(/\D/g, '')

    if (!phone) return ''

    // 00225XXXXXXXXXX
    if (phone.startsWith('00225')) {
      phone = phone.substring(5)
    }

    // 225XXXXXXXXXX
    if (phone.startsWith('225')) {
      return phone
    }

    // 0XXXXXXXXX
    if (phone.startsWith('0')) {
      return `225${phone}`
    }

    // Numéro saisi sans le 0 initial
    return `225${phone}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Utilisateur non connecté.')
      }

      const telephoneNormalise = normalizePhone(telephone)

      const { error: clientError } = await supabase
        .from('clients')
        .insert([{
          nom,
          telephone: telephoneNormalise || null,
          sexe: sexe || null,
          notes: notes || null,
          user_id: user.id,
          photo_url: photoClient || null
        }])

      if (clientError) {
        throw clientError
      }

      alert('Client ajouté avec succès !')
      onBack()

    } catch (err) {
      console.error(err)
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-blue-600"
      >
        ← Retour
      </button>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Nouveau Client
      </h2>

      {error && (
        <p className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-4 rounded-lg shadow"
      >

        {/* INFORMATIONS CLIENT */}
        <div className="border-b pb-4">
          <h3 className="font-bold text-gray-700 mb-3">
            Informations du client
          </h3>

          <ImageUpload
            label="Photo du client"
            folder="clients"
            onUploadSuccess={setPhotoClient}
          />

          <input
            type="text"
            placeholder="Nom et prénom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full p-2 mb-2 border rounded"
          />

          <div className="mb-2">
            <label className="block text-sm text-gray-600 mb-1">
              Téléphone / WhatsApp
            </label>

            <div className="flex items-center">
              <span className="bg-gray-100 border border-r-0 rounded-l px-3 py-2 text-gray-700">
                +225
              </span>

              <input
                type="tel"
                placeholder="07 00 00 00 00"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full p-2 border rounded-r"
              />
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Le préfixe +225 sera automatiquement enregistré.
            </p>
          </div>

          <select
            value={sexe}
            onChange={(e) => setSexe(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Sexe (optionnel)</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          <textarea
            placeholder="Notes sur le client..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* INFORMATION */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
          <strong>📏 Mensurations</strong>
          <p className="mt-1">
            Les mensurations seront prises et enregistrées
            directement lors de la création de chaque commande.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer le client'}
        </button>

      </form>
    </div>
  )
}