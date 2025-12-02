'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Logout() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      router.push('/')
    })
  }, [supabase, router])

  return <p className="p-8 text-center">Logging you out...</p>
}
