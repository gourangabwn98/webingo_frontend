import { clsx } from '../../utils/helpers'

export default function Badge({ children, color = 'text-slate-400', bg = 'bg-slate-400/10', border, dot, className }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border', bg, color, border || 'border-transparent', className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dot)} />}
      {children}
    </span>
  )
}