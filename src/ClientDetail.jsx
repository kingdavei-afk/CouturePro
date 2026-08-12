import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ImageUpload from './ImageUpload'

// ============================================================
// CONFIGURATION DES MENSURATIONS PAR TYPE DE VÊTEMENT
// ============================================================

const MESURES = {
  dos: 'Dos',
  epaule: 'Épaule',
  epaule_manche: 'Épaule-manche',
  poitrine: 'Poitrine',
  tour_taille: 'Tour taille',
  longueur_taille: 'Longueur taille',
  bassin: 'Bassin',
  longueur_manche: 'Longueur manche',
  tour_manche: 'Tour manche',
  pinces: 'Pinces',
  longueur_totale: 'Longueur totale',
  longueur_robe: 'Longueur robe',
  ceinture: 'Ceinture',
  frappe: 'Frappe',
  cuisse: 'Cuisse',
  genoux: 'Genoux',
  longueur_jupe: 'Longueur jupe',
  longueur_pantalon: 'Longueur pantalon',
  bas: 'Bas',
  tour_ventre: 'Tour ventre',
  poignet: 'Poignet',
  col: 'Col',
  entre_jambes: 'Entre-jambes',
  mollet: 'Mollet',
  longueur_bermuda: 'Longueur bermuda',
  longueur_boubou: 'Longueur boubou',
  ampleur_boubou: 'Ampleur boubou'
}

const TYPES_VETEMENTS = {
  Homme: {
    'Chemise homme': [
      'dos',
      'epaule',
      'poitrine',
      'tour_taille',
      'bassin',
      'longueur_totale',
      'epaule_manche',
      'longueur_manche',
      'tour_manche',
      'poignet',
      'col'
    ],

    'Veste homme': [
      'dos',
      'epaule',
      'poitrine',
      'tour_taille',
      'bassin',
      'longueur_totale',
      'epaule_manche',
      'longueur_manche',
      'tour_manche',
      'poignet',
      'col'
    ],

    'Pantalon homme': [
      'tour_ventre',
      'tour_taille',
      'bassin',
      'frappe',
      'cuisse',
      'genoux',
      'entre_jambes',
      'mollet',
      'longueur_pantalon',
      'bas'
    ],

    'Ensemble homme': [
      // Veste
      'dos',
      'epaule',
      'poitrine',
      'tour_taille',
      'longueur_taille',
      'bassin',
      'epaule_manche',
      'longueur_manche',
      'tour_manche',
      'poignet',
      'col',
      'longueur_totale',

      // Pantalon
      'tour_ventre',
      'frappe',
      'cuisse',
      'genoux',
      'entre_jambes',
      'mollet',
      'longueur_pantalon',
      'bas'
    ],

    'Boubou africain': [
      'dos',
      'epaule',
      'poitrine',
      'tour_taille',
      'bassin',
      'epaule_manche',
      'longueur_manche',
      'tour_manche',
      'poignet',
      'col',
      'longueur_boubou',
      'ampleur_boubou'
    ],

    'Bermuda homme': [
      'tour_ventre',
      'tour_taille',
      'bassin',
      'frappe',
      'cuisse',
      'genoux',
      'entre_jambes',
      'mollet',
      'longueur_bermuda',
      'bas'
    ]
  },

  Femme: {
    'Robe femme': [
      'dos',
      'epaule',
      'poitrine',
      'tour_taille',
      'longueur_taille',
      'bassin',
      'pinces',
      'longueur_robe',
      'epaule_manche',
      'longueur_manche',
      'tour_manche',
      'poignet',
      'col'
    ],

    'Jupe femme': [
      'tour_taille',
      'bassin',
      'pinces',
      'ceinture',
      'longueur_jupe'
    ],

    'Pantalon femme': [
      'tour_ventre',
      'tour_taille',
      'bassin',
      'frappe',
      'cuisse',
      'genoux',
      'entre_jambes',
      'mollet',
      'longueur_pantalon',
      'bas'
    ],

    'Ensemble femme': [
      'dos',
      'epaule',
      'poitrine',
      'tour_taille',
      'longueur_taille',
      'bassin',
      'pinces',
      'epaule_manche',
      'longueur_manche',
      'tour_manche',
      'poignet',
      'col',
      'longueur_totale',
      'tour_ventre',
      'frappe',
      'cuisse',
      'genoux',
      'entre_jambes',
      'mollet',
      'longueur_pantalon',
      'bas'
    ],

    'Boubou femme': [
      'dos',
      'epaule',
      'poitrine',
      'tour_taille',
      'bassin',
      'epaule_manche',
      'longueur_manche',
      'tour_manche',
      'poignet',
      'col',
      'longueur_boubou',
      'ampleur_boubou'
    ]
  }
}

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

const [typeVetement, setTypeVetement] = useState('')
const [mesures, setMesures] = useState({})
const [modeReutilisation, setModeReutilisation] = useState('nouvelle')
const [commandeSource, setCommandeSource] = useState(null)

const handleMesureChange = (e) => {
  const { name, value } = e.target

  setMesures((prev) => ({
    ...prev,
    [name]: value
  }))
}

  // État local pour le 2ème versement (mise à jour rapide)
  const [versementInputs, setVersementInputs] = useState({})

    // URLs temporaires pour les photos privées
  const [clientPhotoUrl, setClientPhotoUrl] = useState(null)
  const [resolvedCommandes, setResolvedCommandes] = useState([])

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const resolveImageUrl = async (path) => {
    if (!path) return null

    // Anciennes URLs publiques : on les conserve
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // Nouveau chemin : génération d'une URL signée temporaire
    const { data, error } = await supabase.storage
      .from('photos')
      .createSignedUrl(path, 3600)

    if (error) {
      console.error('Erreur génération URL signée:', error)
      return null
    }

    return data?.signedUrl || null
  }

  const fetchClientData = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*, mensurations(*)')
      .eq('id', clientId)
      .single()

       if (error) {
      console.error(error)
    } else {
      setClient(data)

      // Générer l'URL temporaire de la photo du client
      const clientPhoto = await resolveImageUrl(data.photo_url)
      setClientPhotoUrl(clientPhoto)
    }

    const { data: cmdData, error: commandesError } = await supabase
  .from('commandes')
  .select(`
    *,
    mensurations(*)
  `)
  .eq('client_id', clientId)
  .order('created_at', { ascending: false })

if (commandesError) {
  console.error('Erreur récupération commandes:', commandesError)
  setCommandes([])
  setResolvedCommandes([])
  return
}

setCommandes(cmdData || [])

// Générer les URLs temporaires des photos des commandes
const resolvedCmds = await Promise.all(
  (cmdData || []).map(async (cmd) => ({
    ...cmd,
    resolved_modele_url: await resolveImageUrl(cmd.photo_modele_url),
    resolved_tissu_url: await resolveImageUrl(cmd.photo_tissu_url)
  }))
)

setResolvedCommandes(resolvedCmds)

// Initialiser les inputs de versement
const inputs = {}

;(cmdData || []).forEach(cmd => {
  inputs[cmd.id] = cmd.deuxieme_versement || ''
})

setVersementInputs(inputs)
  }

  const handleCreateCommande = async (e) => {
    e.preventDefault()

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

    if (!user) {
      alert('Utilisateur non connecté.')
      return
    }

    if (!typeVetement) {
      alert('Veuillez sélectionner un type de vêtement.')
      return
    }

    // =====================================================
    // 1. CRÉATION DE LA COMMANDE
    // =====================================================

    const { data: commandeData, error: commandeError } =
      await supabase
        .from('commandes')
        .insert([{
          client_id: clientId,
          user_id: user.id,
          modele,
          description,
          prix_total: prix || 0,
          acompte: acompte || 0,
          date_prevue: datePrevue || null,
          photo_modele_url: photoModele || null,
          photo_tissu_url: photoTissu || null,
          statut: 'À faire'
        }])
        .select()
        .single()

    if (commandeError) {
      console.error('Erreur création commande:', commandeError)
      alert(commandeError.message)
      return
    }

    const commandeId = commandeData.id

    // =====================================================
    // 2. ENREGISTREMENT DES MENSURATIONS
    // =====================================================

    const champsNecessaires =
      TYPES_VETEMENTS[client.sexe]?.[typeVetement] || []

    const mesuresAEnregistrer = {}

    champsNecessaires.forEach((champ) => {
      const valeur = mesures[champ]

      if (valeur !== undefined && valeur !== '') {
        mesuresAEnregistrer[champ] = valeur
      }
    })

    const { error: mesuresError } = await supabase
      .from('mensurations')
      .insert([{
        client_id: clientId,
        commande_id: commandeId,
        type_vetement: typeVetement,
        ...mesuresAEnregistrer
      }])

    if (mesuresError) {
      console.error('Erreur mensurations:', mesuresError)

      // Si les mensurations échouent, on supprime la commande
      // pour éviter une commande incomplète.
      await supabase
        .from('commandes')
        .delete()
        .eq('id', commandeId)

      alert(
        'La commande n’a pas pu être enregistrée avec ses mensurations : ' +
        mesuresError.message
      )

      return
    }

    // =====================================================
    // 3. NETTOYAGE DU FORMULAIRE
    // =====================================================

    alert('Commande créée avec succès !')

    setModele('')
    setDescription('')
    setPrix('')
    setAcompte('')
    setDatePrevue('')
    setPhotoModele('')
    setPhotoTissu('')
    setTypeVetement('')
    setMesures({})
    setModeReutilisation('nouvelle')
    setCommandeSource(null)

    setShowCommandeForm(false)

    // Recharger l'historique
    fetchClientData()

  } catch (error) {
    console.error(error)
    alert(error.message || 'Une erreur est survenue.')
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

      {clientPhotoUrl && (
  <img
    src={clientPhotoUrl}
    alt="Photo du client"
    className="w-20 h-20 rounded-full object-cover mb-3"
  />
)}
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


      {!showCommandeForm && (
        <button onClick={() => setShowCommandeForm(true)} className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold mb-4 hover:bg-blue-700">
          + Nouvelle Commande
        </button>
      )}

      {showCommandeForm && (
        <form onSubmit={handleCreateCommande} className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          <h3 className="font-bold text-gray-700">Nouvelle Commande</h3>

          <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Type de vêtement
  </label>

  <select
    value={typeVetement}
    onChange={(e) => {
  setTypeVetement(e.target.value)
}}
    required
    className="w-full p-2 border rounded"
  >
    <option value="">
      Sélectionner un type de vêtement
    </option>

    {client.sexe &&
      Object.keys(TYPES_VETEMENTS[client.sexe] || {}).map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
  </select>

  {!client.sexe && (
    <p className="text-xs text-orange-600 mt-1">
      Le sexe du client doit être renseigné pour choisir
      automatiquement les types de vêtements.
    </p>
  )}
</div>

{/* =====================================================
    SOURCE DES MENSURATIONS
===================================================== */}

{typeVetement && (
  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">

    <h4 className="font-bold text-blue-800 mb-2">
      📏 Source des mensurations
    </h4>

    <div className="flex gap-4 mb-3">

      <label className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          name="modeReutilisation"
          value="nouvelle"
          checked={modeReutilisation === 'nouvelle'}
          onChange={() => {
            setModeReutilisation('nouvelle')
            setCommandeSource(null)
          }}
        />
        Nouvelles mensurations
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          name="modeReutilisation"
          value="ancienne"
          checked={modeReutilisation === 'ancienne'}
          onChange={() => setModeReutilisation('ancienne')}
        />
        Réutiliser une ancienne commande
      </label>

    </div>

    {modeReutilisation === 'ancienne' && (
      <div>

        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Choisir une ancienne commande
        </label>

        <select
          value={commandeSource?.id || ''}
          onChange={(e) => {

            const commande = commandes.find(
              cmd => cmd.id === e.target.value
            )

            setCommandeSource(commande || null)

            if (commande?.mensurations?.length) {

              const ancienneMesure = commande.mensurations[0]

              setMesures(prev => ({
                ...prev,
                ...ancienneMesure
              }))
            }
          }}
          className="w-full p-2 border rounded bg-white"
        >

          <option value="">
            Sélectionner une ancienne commande
          </option>

          {commandes
            .filter(cmd => cmd.mensurations?.length)
            .map(cmd => {

              const mesure = cmd.mensurations[0]

              return (
                <option key={cmd.id} value={cmd.id}>
                  {mesure?.type_vetement || cmd.modele || 'Commande'}
                  {' — '}
                  {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                </option>
              )
            })}

        </select>

        {commandeSource && (
          <p className="text-xs text-blue-700 mt-2">
            ✓ Mensurations chargées depuis cette ancienne commande.
            Vous pouvez maintenant les modifier.
          </p>
        )}

      </div>
    )}

  </div>
)}

{/* =====================================================
    MENSURATIONS DE LA COMMANDE
===================================================== */}

{typeVetement && (
  <div className="border-t pt-4">
    <h4 className="font-bold text-gray-700 mb-1">
      Mensurations
    </h4>

    <p className="text-xs text-gray-500 mb-3">
      Mensurations nécessaires pour : <strong>{typeVetement}</strong>
    </p>

    <div className="grid grid-cols-2 gap-2">
      {(TYPES_VETEMENTS[client.sexe]?.[typeVetement] || []).map(
        (champ) => (
          <div key={champ}>
            <label className="block text-xs text-gray-600 mb-1">
              {MESURES[champ]}
            </label>

            <input
              type="number"
              step="0.1"
              name={champ}
              value={mesures[champ] || ''}
              onChange={handleMesureChange}
              placeholder="cm"
              className="w-full p-2 border rounded"
            />
          </div>
        )
      )}
    </div>
  </div>
)}
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
        {resolvedCommandes.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune commande pour l'instant.</p>
        ) : (
          <div className="space-y-4">
            {resolvedCommandes.map(cmd => {
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
{/* Type de vêtement */}
{cmd.mensurations?.[0] && (
  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
    <p className="text-sm font-semibold text-blue-800">
      👕 Type de vêtement :
      <span className="ml-1">
        {cmd.mensurations[0].type_vetement}
      </span>
    </p>
  </div>
)}

{/* Mensurations utilisées pour cette commande */}
{cmd.mensurations?.[0] && (
  <div className="mt-3 bg-gray-50 border rounded-lg p-3">
    <h5 className="font-bold text-gray-700 mb-2">
      📏 Mensurations de cette commande
    </h5>

    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {Object.entries(cmd.mensurations[0])
        .filter(([champ, valeur]) =>
          champ !== 'id' &&
          champ !== 'client_id' &&
          champ !== 'commande_id' &&
          champ !== 'type_vetement' &&
          champ !== 'created_at' &&
          champ !== 'updated_at' &&
          valeur !== null &&
          valeur !== ''
        )
        .map(([champ, valeur]) => (
          <p key={champ}>
            <span className="text-gray-600">
              {MESURES[champ] || champ} :
            </span>{' '}
            <strong>{valeur} cm</strong>
          </p>
        ))}
    </div>
  </div>
)}

                  <div className="flex gap-2 mt-3">
                    {cmd.photo_modele_url && <img src={cmd.resolved_modele_url} alt="Modèle" className="w-16 h-16 object-cover rounded" />}
                    {cmd.photo_tissu_url && <img src={cmd.resolved_tissu_url} alt="Tissu" className="w-16 h-16 object-cover rounded" />}
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
