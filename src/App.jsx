import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'
import Dashboard from './Dashboard'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {!session ? <Login /> : <Dashboard session={session} />}
    </div>
  )
}

export default App