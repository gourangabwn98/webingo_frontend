import { forwardRef } from 'react'
import { clsx } from '../../utils/helpers'

const Input = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={clsx('input-field', error && 'border-red-500/60 focus:border-red-500', className)} {...props} />
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
))
Input.displayName = 'Input'
export default Input