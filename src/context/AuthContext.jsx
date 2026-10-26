import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [prenom, setPrenom] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('rachel40_prenom')
    if (saved) setPrenom(saved)
  }, [])

  async function handleLogin(name) {
    const clean = name.trim()
    if (!clean) return

    const { error } = await supabase.from('participants').upsert(
      { id: clean.toLowerCase(), display_name: clean },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    if (error) {
      console.error('⚠️ Login BDD échoué :', error.message)
      // On continue quand même pour ne pas bloquer la fête,
      // mais on le voit en console
    } else {
      console.log('✅ Participant enregistré :', clean)
    }

    localStorage.setItem('rachel40_prenom', clean)
    setPrenom(clean)
  }

  function handleLogout() {
    localStorage.removeItem('rachel40_prenom')
    setPrenom(null)
  }

  return (
    <AuthContext.Provider value={{ prenom, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)