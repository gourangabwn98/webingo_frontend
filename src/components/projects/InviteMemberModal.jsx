import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { inviteMemberApi } from '../../features/projects/projectsApi'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import toast from 'react-hot-toast'

export default function InviteMemberModal({ open, onClose, projectId }) {
  const [loading,   setLoading]   = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied,    setCopied]    = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setInviteUrl('')
    try {
      const res = await inviteMemberApi(projectId, data)
      const url = res.data.data?.inviteUrl
      if (url) setInviteUrl(url)
      toast.success('Invitation created!')
      reset()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setInviteUrl('')
    setCopied(false)
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Invite Team Member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="member@company.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <div className="space-y-1.5">
          <label className="label">Role</label>
          <select className="input-field" {...register('role')}>
            <option value="team_member">Team Member</option>
            <option value="project_admin">Project Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" type="button" onClick={handleClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Invitation</Button>
        </div>
      </form>

      {/* Invite link box */}
      {inviteUrl && (
        <div style={{
          marginTop: '1.25rem',
          padding: '1rem',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1rem' }}>✅</span>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a5b4fc' }}>
              Invitation Created!
            </p>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            Share this link with the person you want to invite:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              readOnly
              value={inviteUrl}
              onClick={e => e.target.select()}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.7rem',
                color: '#cbd5e1',
                outline: 'none',
                fontFamily: 'monospace',
                cursor: 'text',
              }}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: '0.5rem 1rem',
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.2)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(99,102,241,0.4)'}`,
                borderRadius: '0.5rem',
                color: copied ? '#4ade80' : '#818cf8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.5rem' }}>
            🕒 Link expires in 7 days
          </p>
        </div>
      )}
    </Modal>
  )
}