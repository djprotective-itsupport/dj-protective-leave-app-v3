'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleAuth = async () => {
    const { error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: email.split('@')[0] } }
        })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">
          {isSignUp ? 'Sign Up' : 'Login'}
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded-lg"
        />
        <button
          onClick={handleAuth}
          className="w-full bg-primary text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {isSignUp ? 'Create Account' : 'Login'}
        </button>
        <p className="text-center mt-4 text-sm">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary underline"
          >
            {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
