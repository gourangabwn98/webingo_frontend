import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { forgotApi } from '../../features/auth/authApi'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await forgotApi(data)
      setSent(true)
      toast.success('Reset email sent!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send email')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Forgot Password</h1>
          <p className="text-slate-400 mt-2 text-sm">We'll send you a reset link</p>
        </div>
        <div className="card">
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-300 text-sm">Check your email for the reset link.</p>
              <Link to="/login" className="text-brand-400 hover:text-brand-300 text-sm transition-colors">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
              <Button type="submit" loading={loading} className="w-full justify-center">Send Reset Link</Button>
              <p className="text-center text-sm text-slate-500">
                <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}