import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Supabase non configuré: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant(e). Utilisation d\'un mock pour le développement local.')

	const mockAuth = {
		getSession: async () => ({ data: { session: null } }),
		onAuthStateChange: (_cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
		signInWithPassword: async () => ({ error: { message: 'Supabase non configuré (VITE_SUPABASE_URL manquant)' } }),
		signUp: async () => ({ error: { message: 'Supabase non configuré (VITE_SUPABASE_URL manquant)' } }),
	}

	supabase = { auth: mockAuth }
} else {
	supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }