'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'manager' || profile?.role === 'admin') {
        router.push('/manager')
      } else {
        router.push('/employee')
      }
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  if (loading) return <p className="p-8 text-center">Loading...</p>

  return null
}
