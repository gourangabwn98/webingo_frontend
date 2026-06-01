import { useState, useRef, useEffect } from 'react'

export default function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 mt-1 w-48 glass-dark rounded-xl border border-white/10 shadow-xl z-30 animate-fade-in overflow-hidden">
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="border-t border-white/10 my-1" />
            ) : (
              <button
                key={i}
                onClick={() => { item.onClick(); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/10 flex items-center gap-2 ${item.danger ? 'text-red-400 hover:text-red-300' : 'text-slate-300 hover:text-white'}`}
              >
                {item.icon && <span className="w-4">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}