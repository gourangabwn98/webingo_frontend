import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { resetApi } from '../../features/auth/authApi'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const { token }   = useParams()
  const navigate    = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await resetApi(token, data)
      toast.success('Password reset! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 mt-2 text-sm">Enter your new password</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Min. 6 characters"
              error={errors.password?.message}
              {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min. 6 characters' } })}
            />
            <Button type="submit" loading={loading} className="w-full justify-center">Reset Password</Button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors text-sm">Back to login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}