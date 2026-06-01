import { format, formatDistanceToNow, isValid } from 'date-fns'

export const formatDate = (date) => {
  if (!date || !isValid(new Date(date))) return '—'
  return format(new Date(date), 'MMM dd, yyyy')
}

export const timeAgo = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong'

export const truncate = (str, len = 60) =>
  str?.length > len ? str.slice(0, len) + '…' : str

export const clsx = (...classes) => classes.filter(Boolean).join(' ')