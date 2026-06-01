import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { acceptInviteApi } from '../../features/projects/projectsApi'
import { selectIsAuth } from '../../features/auth/authSlice'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function InvitePage() {
  const { token }  = useParams()
  const navigate   = useNavigate()
  const isAuth     = useSelector(selectIsAuth)
  const [loading, setLoading]   = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!isAuth) navigate(`/login?redirect=/invite/${token}`)
  }, [isAuth])

  const handleAccept = async () => {
    setLoading(true)
    try {
      const res = await acceptInviteApi(token)
      setAccepted(true)
      toast.success('Joined project!')
      setTimeout(() => navigate(`/projects/${res.data.data.project._id}`), 1500)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid invitation')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center space-y-6 animate-slide-up">
        <div className="w-16 h-16 bg-brand-600/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        {accepted ? (
          <>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-slate-300">Successfully joined! Redirecting...</p>
          </>
        ) : (
          <>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Project Invitation</h1>
              <p className="text-slate-400 mt-2 text-sm">You've been invited to join a project on CollabPM.</p>
            </div>
            <Button onClick={handleAccept} loading={loading} className="w-full justify-center">
              Accept Invitation
            </Button>
            <button onClick={() => navigate('/dashboard')} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Decline
            </button>
          </>
        )}
      </div>
    </div>
  )
}