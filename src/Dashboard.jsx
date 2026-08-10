import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ClientsList from './ClientsList'
import ClientForm from './ClientForm'
import ClientDetail from './ClientDetail'

export default function Dashboard({ session }) {
  const [view, setView] = useState('accueil')
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [clientsCount, setClientsCount] = useState(0)
  const [commandesEnCours, setCommandesEnCours] = useState(0)

  const fetchStats = async () => {
    const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true })
    setClientsCount(count || 0)

    const { count: cmdCount } = await supabase
      .from('commandes')
      .select('*', { count: 'exact', head: true })
      .neq('statut', 'Livré')
    setCommandesEnCours(cmdCount || 0)
  }

  useEffect(() => {
    fetchStats()
  }, [view])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const openClientDetail = (id) => {
    setSelectedClientId(id)
    setView('client_detail')
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-100">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold">CouturePro</h1>
        <button onClick={handleLogout} className="text-sm bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">
          Déconnexion
        </button>
      </header>

      <main className="max-w-md mx-auto p-4">
        {view === 'accueil' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Tableau de bord</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-3xl font-bold text-blue-600">{clientsCount}</p>
                <p className="text-gray-500 text-sm">Clients enregistrés</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-3xl font-bold text-orange-500">{commandesEnCours}</p>
                <p className="text-gray-500 text-sm">Commandes en cours</p>
              </div>
            </div>
            <button onClick={() => setView('clients')} className="w-full bg-gray-800 text-white p-4 rounded-lg font-semibold mb-2 hover:bg-gray-900">
              Voir mes clients
            </button>
            <button onClick={() => setView('nouveau_client')} className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700">
              + Ajouter un client
            </button>
          </div>
        )}

        {view === 'clients' && <ClientsList onBack={() => setView('accueil')} onAdd={() => setView('nouveau_client')} onSelectClient={openClientDetail} />}
        {view === 'nouveau_client' && <ClientForm onBack={() => setView('accueil')} />}
        {view === 'client_detail' && <ClientDetail clientId={selectedClientId} onBack={() => setView('clients')} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 max-w-md mx-auto shadow-md">
        <button onClick={() => setView('accueil')} className={`flex flex-col items-center text-xs ${view === 'accueil' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-xl">🏠</span> Accueil
        </button>
        <button onClick={() => setView('clients')} className={`flex flex-col items-center text-xs ${view === 'clients' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-xl">👥</span> Clients
        </button>
        <button onClick={() => setView('nouveau_client')} className={`flex flex-col items-center text-xs ${view === 'nouveau_client' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-xl">➕</span> Ajouter
        </button>
      </nav>
    </div>
  )
}