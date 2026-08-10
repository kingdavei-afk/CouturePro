import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function ClientsList({ onBack, onAdd, onSelectClient }) {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setClients(data)
    setLoading(false)
  }

  const filteredClients = clients.filter(c => 
    c.nom?.toLowerCase().includes(search.toLowerCase()) || 
    c.telephone?.includes(search)
  )

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600">&larr; Retour</button>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Mes Clients</h2>
      
      <input 
        type="text" 
        placeholder="🔍 Rechercher par nom ou téléphone..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? <p className="text-center text-gray-500">Chargement...</p> : (
        <div className="space-y-3">
          {filteredClients.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">Aucun client trouvé.</p>
          ) : (
            filteredClients.map(client => (
              <div 
                key={client.id} 
                onClick={() => onSelectClient(client.id)} 
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center cursor-pointer hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-bold text-gray-800">{client.nom}</h3>
                  <p className="text-sm text-gray-500">{client.telephone || 'Pas de téléphone'}</p>
                </div>
                <span className="text-blue-500 text-2xl">&rsaquo;</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}