import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ImageUpload from './ImageUpload'

export default function ClientDetail({ clientId, onBack }) {
  const [client, setClient] = useState(null)
  const [commandes, setCommandes] = useState([])
  const [showCommandeForm, setShowCommandeForm] = useState(false)
  
  // Champs de formulaire
  const [modele, setModele] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [acompte, setAcompte] = useState('')
  const [datePrevue, setDatePrevue] = useState('')
  const [photoModele, setPhotoModele] = useState('')
  const [photoTissu, setPhotoTissu] = useState('')

  // État local pour le 2ème versement (mise à jour rapide)
  const [versementInputs, setVersementInputs] = useState({})

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const fetchClientData = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*, mensurations(*)')
      .eq('id', clientId)
      .single()
    
    if (error) console.error(error)
    else setClient(data)

    const { data: cmdData } = await supabase
      .from('commandes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    setCommandes(cmdData || [])
    
    // Initialiser les inputs de versement avec les valeurs existantes
    const inputs = {}
    cmdData?.forEach(cmd => {
      inputs[cmd.id] = cmd.deuxieme_versement || ''
    })
    setVersementInputs(inputs)
  }

  const handleCreateCommande = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('commandes').insert([{
      client_id: clientId,
      user_id: user.id,
      modele, description, 
      prix_total: prix, 
      acompte: acompte || 0, 
      date_prevue: datePrevue,
      photo_modele_url: photoModele,
      photo_tissu_url: photoTissu,
      statut: 'À faire'
    }])

    if (error) alert(error.message)
    else {
      alert('Commande créée !')
      setModele(''); setDescription(''); setPrix(''); setAcompte(''); setDatePrevue('')
      setShowCommandeForm(false)
      fetchClientData()
    }
  }

  const handleStatusChange = async (cmdId, newStatus) => {
    const { error } = await supabase
      .from('commandes')
      .update({ statut: newStatus })
      .eq('id', cmdId)
    
    if (error) alert(error.message)
    else fetchClientData()
  }

  // Enregistrer le 2ème versement dans la base de données
  const handleSaveVersement = async (cmdId) => {
    const montant = versementInputs[cmdId] || 0
    const { error } = await supabase
      .from('commandes')
      .update({ deuxieme_versement: montant })
      .eq('id', cmdId)
    
    if (error) alert(error.message)
    else {
      alert('Versement mis à jour !')
      fetchClientData()
    }
  }

  if (!client) return <p className="text-center mt-10">Chargement...</p>

  const m = client.mensurations || {}
  const phoneClean = client.telephone?.replace(/\D/g, '')

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600">&larr; Retour aux clients</button>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{client.nom}</h2>
        <div className="flex items-center gap-2 mt-2">
          <a 
            href={`https://wa.me/${phoneClean}`} 
            target="_blank" rel="noreferrer" 
            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center gap-1"
          >
            💬 Appeler sur WhatsApp
          </a>
        </div>
        {client.notes && <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-2 rounded">📝 {client.notes}</p>}
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="font-bold text-gray-700 mb-2 border-b pb-1">Mensurations</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {m.tour_poitrine && <p>Poitrine: <span className="font-semibold">{m.tour_poitrine}</span></p>}
          {m.tour_taille && <p>Taille: <span className="font-semibold">{m.tour_taille}</span></p>}
          {m.tour_hanche && <p>Hanche: <span className="font-semibold">{m.tour_hanche}</span></p>}
          {m.carrure && <p>Carrure: <span className="font-semibold">{m.carrure}</span></p>}
          {m.longueur_epaule && <p>Épaule: <span className="font-semibold">{m.longueur_epaule}</span></p>}
          {m.tour_bras && <p>Bras: <span className="font-semibold">{m.tour_bras}</span></p>}
          {m.longueur_vetement && <p>Longueur: <span className="font-semibold">{m.longueur_vetement}</span></p>}
          {m.autres && <p className="col-span-2">Autres: <span className="font-semibold">{m.autres}</span></p>}
        </div>
      </div>

      {!showCommandeForm && (
        <button onClick={() => setShowCommandeForm(true)} className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold mb-4 hover:bg-blue-700">
          + Nouvelle Commande
        </button>
      )}

      {showCommandeForm && (
        <form onSubmit={handleCreateCommande} className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          <h3 className="font-bold text-gray-700">Nouvelle Commande</h3>
          <input type="text" placeholder="Nom du modèle" value={modele} onChange={(e)=>setModele(e.target.value)} required className="w-full p-2 border rounded" />
          <textarea placeholder="Description / Instructions" value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full p-2 border rounded"></textarea>
          
          <ImageUpload label="Photo du modèle" folder="modeles" onUploadSuccess={setPhotoModele} />
          <ImageUpload label="Photo du tissu/pagne" folder="tissus" onUploadSuccess={setPhotoTissu} />
          
          <div className="flex gap-2">
            <input type="number" placeholder="Prix total (FCFA)" value={prix} onChange={(e)=>setPrix(e.target.value)} required className="w-1/2 p-2 border rounded" />
            <input type="number" placeholder="Acompte (FCFA)" value={acompte} onChange={(e)=>setAcompte(e.target.value)} className="w-1/2 p-2 border rounded" />
          </div>
          
          <input type="date" value={datePrevue} onChange={(e)=>setDatePrevue(e.target.value)} className="w-full p-2 border rounded" />
          
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded font-semibold">Valider</button>
            <button type="button" onClick={() => setShowCommandeForm(false)} className="flex-1 bg-gray-200 text-gray-800 p-2 rounded font-semibold">Annuler</button>
          </div>
        </form>
      )}

      <div>
        <h3 className="font-bold text-gray-700 mb-2">Historique des commandes</h3>
        {commandes.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune commande pour l'instant.</p>
        ) : (
          <div className="space-y-4">
            {commandes.map(cmd => {
              // Génération du message WhatsApp personnalisé
              let statutText = "en attente de traitement";
              if (cmd.statut === "En cours") statutText = "actuellement en cours de couture";
              if (cmd.statut === "Terminé") statutText = "prête ! Vous pouvez venir la récupérer";
              if (cmd.statut === "Livré") statutText = "livrée";
              if (cmd.statut === "Soldé") statutText = "soldée. Merci beaucoup !";

              const msg = `Bonjour ${client.nom} 👋🏾, votre commande "${cmd.modele}" est ${statutText}. Il vous reste à payer : ${cmd.reste} FCFA. Merci pour votre confiance !`;
              const waLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`;
              
              return (
                <div key={cmd.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{cmd.modele}</h4>
                      <p className="text-xs text-gray-500">Livraison: {cmd.date_prevue || 'Non définie'}</p>
                    </div>
                    <select 
                      value={cmd.statut} 
                      onChange={(e) => handleStatusChange(cmd.id, e.target.value)}
                      className={`text-xs border rounded-full px-2 py-1 focus:outline-none ${
                        cmd.statut === 'Soldé' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-50'
                      }`}
                    >
                      <option value="À faire">À faire</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminé">Terminé</option>
                      <option value="Livré">Livré</option>
                      <option value="Soldé">Soldé</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {cmd.photo_modele_url && <img src={cmd.photo_modele_url} alt="Modèle" className="w-16 h-16 object-cover rounded" />}
                    {cmd.photo_tissu_url && <img src={cmd.photo_tissu_url} alt="Tissu" className="w-16 h-16 object-cover rounded" />}
                  </div>

                  <div className="mt-3 text-sm border-t pt-2 space-y-2">
                    <p className="flex justify-between"><span>Total:</span> <b>{cmd.prix_total} FCFA</b></p>
                    <p className="flex justify-between"><span>1er versement:</span> <b>{cmd.acompte} FCFA</b></p>
                    
                    {/* Bloc 2ème versement */}
                    <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                      <span className="text-xs flex-1">2ème versement:</span>
                      <input 
                        type="number" 
                        value={versementInputs[cmd.id] || ''} 
                        onChange={(e) => setVersementInputs({...versementInputs, [cmd.id]: e.target.value})}
                        placeholder="0"
                        className="w-20 p-1 text-xs border rounded text-center"
                      />
                      <button 
                        onClick={() => handleSaveVersement(cmd.id)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                      >
                        OK
                      </button>
                    </div>

                    <p className="flex justify-between text-red-600 font-bold text-base"><span>Reste à payer:</span> <span>{cmd.reste} FCFA</span></p>
                  </div>

                  {/* Aperçu du message WhatsApp + Bouton */}
                  <div className="mt-3 bg-green-50 p-2 rounded-lg border border-green-100">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">📱 Aperçu du message WhatsApp :</p>
                    <p className="text-xs text-gray-700 italic mb-2">"{msg}"</p>
                    <a 
                      href={waLink} 
                      target="_blank" rel="noreferrer" 
                      className="w-full block text-center bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600"
                    >
                      💬 Ouvrir WhatsApp pour envoyer
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}