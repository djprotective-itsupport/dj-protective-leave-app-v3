'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { jsPDF } from 'jspdf'
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'

export default function ManagerDashboard() {
  const [pending, setPending] = useState([])
  const supabase = createClient()

  useEffect(() => {
    fetchPending()
  }, [])

  async function fetchPending() {
    const { data } = await supabase
      .from('leave_requests')
      .select('*, leave_types(name, color), profiles(full_name)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
    setPending(data || [])
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('leave_requests')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) fetchPending()
  }

  function generatePDF() {
    const doc = new jsPDF()
    const month = format(new Date(), 'MMMM yyyy')
    doc.setFontSize(16)
    doc.text(`${process.env.NEXT_PUBLIC_COMPANY_NAME}`, 10, 15)
    doc.setFontSize(14)
    doc.text(`Monthly Timetable - ${month}`, 10, 25)

    let y = 40
    const days = eachDayOfInterval({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    })

    days.forEach(day => {
      const dayStr = format(day, 'dd MMM (EEE)')
      doc.setFontSize(10)
      doc.text(`${dayStr}:`, 10, y)
      // In v2 we'll list actual names — this is the placeholder
      doc.text('   [Off: — ]', 50, y)
      y += 8
    })

    doc.save(`timetable-${format(new Date(), 'yyyy-MM')}.pdf`)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Manager Dashboard</h2>
        <button onClick={generatePDF} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
          Export PDF Timetable
        </button>
      </div>

      <h3 className="text-2xl font-bold mb-4">Pending Requests ({pending.length})</h3>
      {pending.length === 0 ? (
        <p className="text-gray-600">No pending requests 🎉</p>
      ) : (
        <div className="space-y-4">
          {pending.map(r => (
            <div key={r.id} className="bg-white p-5 rounded-lg shadow flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">{r.profiles.full_name}</span>
                <span className="mx-3">•</span>
                <span style={{ color: r.leave_types.color }} className="font-semibold">
                  {r.leave_types.name}
                </span>
                <span className="mx-3">•</span>
                <span>
                  {format(new Date(r.start_date), 'dd MMM')} → {format(new Date(r.end_date), 'dd MMM yyyy')}
                </span>
                {r.notes && <p className="text-sm text-gray-600 mt-1">Note: {r.notes}</p>}
              </div>
              <div className="space-x-3">
                <button onClick={() => updateStatus(r.id, 'approved')} className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">
                  Approve
                </button>
                <button onClick={() => updateStatus(r.id, 'rejected')} className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
