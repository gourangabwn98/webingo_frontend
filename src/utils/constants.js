export const TASK_STATUS = {
  todo:        { label: 'Todo',        color: 'text-slate-400',  bg: 'bg-slate-400/10',  border: 'border-slate-400/20' },
  in_progress: { label: 'In Progress', color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20'  },
  review:      { label: 'Review',      color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20'},
  completed:   { label: 'Completed',   color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20' },
}

export const TASK_PRIORITY = {
  low:      { label: 'Low',      color: 'text-slate-400',  bg: 'bg-slate-400/10',  dot: 'bg-slate-400'  },
  medium:   { label: 'Medium',   color: 'text-blue-400',   bg: 'bg-blue-400/10',   dot: 'bg-blue-400'   },
  high:     { label: 'High',     color: 'text-orange-400', bg: 'bg-orange-400/10', dot: 'bg-orange-400' },
  critical: { label: 'Critical', color: 'text-red-400',    bg: 'bg-red-400/10',    dot: 'bg-red-400'    },
}

export const PROJECT_ROLES = {
  project_admin: { label: 'Admin',       color: 'text-brand-400',  bg: 'bg-brand-400/10'  },
  team_member:   { label: 'Team Member', color: 'text-green-400',  bg: 'bg-green-400/10'  },
  viewer:        { label: 'Viewer',      color: 'text-slate-400',  bg: 'bg-slate-400/10'  },
}