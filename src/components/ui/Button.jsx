import { clsx } from '../../utils/helpers'

const variants = {
  primary: 'btn-primary',
  ghost:   'btn-ghost',
  danger:  'btn-danger',
  outline: 'border border-white/20 hover:bg-white/10 text-slate-300 hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 active:scale-95',
}
const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: '',
  lg: 'text-base px-6 py-3',
}

export default function Button({ children, variant = 'primary', size = 'md', loading, className, ...props }) {
  return (
    <button
      className={clsx(variants[variant], sizes[size], 'inline-flex items-center gap-2', className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
}