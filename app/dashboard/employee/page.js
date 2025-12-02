'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

export default function EmployeeDashboard() {
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [requests, setRequests] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const supabase = createClient()

  useEffect(() => {
    fetchLeaveTypes()
    fetchMyRequests()
  }, [])

  async function fetchLeaveTypes() {
    const { data } = await supabase.from('leave_types').select('*').order('name')
    setLeaveTypes(data || [])
  }

  async function fetchMyRequests() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('leave_requests')
      .select('*, leave_types(name, color)')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false })
    setRequests(data || [])
  }

  async function submitRequest() {
    if (!leaveType || !startDate || !endDate) return alert('Please fill all fields')

    const { data: { user } } = await supabase.auth.getUser()
    const selectedType = leaveTypes.find(t => t.name === leaveType)

    const { error } = await supabase.from('leave_requests').insert({
      user_id: user.id,
      leave_type_id: selectedType.id,
      start_date: startDate,
      end_date: endDate,
      notes,
      status: selectedType.requires_approval ? 'pending' : 'approved'
    })

    if (error) alert(error.message)
    else {
      alert(selectedType.requires_approval 
        ? 'Leave request submitted!' 
        : 'Emergency Leave auto-approved!')
      fetchMyRequests()
      setLeaveType('')
      setStartDate('')
      setEndDate('')
      setNotes('')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Request Leave</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="p-3 border rounded-lg">
            <option value="">Select Leave Type</option>
            {leaveTypes.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-3 border rounded-lg" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-3 border rounded-lg" />
          <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className="p-3 border rounded-lg md:col-span-2" rows="3" />
        </div>
        <button onClick={submitRequest} className="mt-4 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Submit Request
        </button>
      </div>

      <h3 className="text-2xl font-bold mb-4">My Leave History</h3>
      <div className="space-y-3">
        {requests.length === 0 ? <p>No requests yet.</p> : requests.map(r => (
          <div key={r.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <span className="font-semibold" style={{ color: r.leave_types.color }}>
                {r.leave_types.name}
              </span>
              <span className="ml-4">
                {format(new Date(r.start_date), 'dd MMM')} → {format(new Date(r.end_date), 'dd MMM yyyy')}
              </span>
              <span className="ml-4 text-sm text-gray-600">• {r.status.toUpperCase()}</span>
            </div>
            {r.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Pending</span>}
            {r.status === 'approved' && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Approved</span>}
            {r.status === 'rejected' && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Rejected</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
