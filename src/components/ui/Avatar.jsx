import { getInitials } from '../../utils/helpers'
import { clsx } from '../../utils/helpers'

const colors = ['bg-brand-600','bg-blue-600','bg-green-600','bg-yellow-600','bg-pink-600','bg-purple-600']

export default function Avatar({ user, size = 'md', className }) {
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' }
  const color = colors[(user?.name?.charCodeAt(0) || 0) % colors.length]

  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} className={clsx('rounded-full object-cover', sizes[size], className)} />
  }
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0', sizes[size], color, className)}>
      {getInitials(user?.name || '?')}
    </div>
  )
}