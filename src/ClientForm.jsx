import { useState } from 'react'
import { supabase } from './supabaseClient'
import ImageUpload from './ImageUpload'

export default function ClientForm({ onBack }) {
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [sexe, setSexe] = useState('')
  const [notes, setNotes] = useState('')
  const [photoClient, setPhotoClient] = useState('')

  // Mensurations complÃ¨tes
  const [mes, setMes] = useState({
    tour_poitrine: '', tour_taille: '', tour_hanche: '', carrure: '',
    longueur_epaule: '', tour_bras: '', longueur_vetement: '', autres: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleMesChange = (e) => {
    setMes({ ...mes, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    // Insertion du client
  const { data: clientData, error: clientError } = await supabase
  .from('clients')
  .insert([{
    nom, telephone, sexe, notes,
    user_id: user.id,
    photo_url: photoClient || null
  }])
  .select()

    if (clientError) {
      setError(clientError.message)
      setLoading(false)
      return
    }

    const clientId = clientData[0].id

    // Insertion des mensurations
    const { error: mesError } = await supabase
      .from('mensurations')
      .insert([{ client_id: clientId, ...mes }])

    if (mesError) {
      setError(mesError.message)
    } else {
      alert('Client ajoutÃ© avec succÃ¨s !')
      onBack()
    }
    setLoading(false)
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600">&larrarr; Retour</button>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Nouveau Client</h2>

      {error && <p className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-4 rounded-lg shadow">

        <div className="border-b pb-4">
          <h3 className="font-bold text-gray-700 mb-2">Informations & Photo</h3>
          <ImageUpload label="Photo du client" folder="clients" onUploadSuccess={setPhotoClient} />
          <input type="text" placeholder="Nom et prÃ©nom" value={nom} onChange={(e) => setNom(e.target.value)} required className="w-full p-2 mb-2 border rounded" />
          <input type="tel" placeholder="TÃ©lÃ©phone / WhatsApp" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full p-2 mb-2 border rounded" />
          <select value={sexe} onChange={(e) => setSexe(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Sexe (Optionnel)</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-bold text-gray-700 mb-2">Mensurations</h3>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" name="tour_poitrine" placeholder="Tour poitrine" value={mes.tour_poitrine} onChange={handleMesChange} className="p-2 border rounded" />
            <input type="text" name="tour_taille" placeholder="Tour taille" value={mes.tour_taille} onChange={handleMesChange} className="p-2 border rounded" />
            <input type="text" name="tour_hanche" placeholder="Tour hanche" value={mes.tour_hanche} onChange={handleMesChange} className="p-2 border rounded" />
            <input type="text" name="carrure" placeholder="Carrure" value={mes.carrure} onChange={handleMesChange} className="p-2 border rounded" />
            <input type="text" name="longueur_epaule" placeholder="Longueur Ã©paule" value={mes.longueur_epaule} onChange={handleMesChange} className="p-2 border rounded" />
            <input type="text" name="tour_bras" placeholder="Tour bras" value={mes.tour_bras} onChange={handleMesChange} className="p-2 border rounded" />
            <input type="text" name="longueur_vetement" placeholder="Longueur robe/pantalon" value={mes.longueur_vetement} onChange={handleMesChange} className="p-2 border rounded" />
          </div>
          <input type="text" name="autres" placeholder="Autres mesures..." value={mes.autres} onChange={handleMesChange} className="w-full p-2 mt-2 border rounded" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Enregistrer le client'}
        </button>
      </form>
    </div>
  )
}
