import { NavLink } from 'react-router-dom'
import { Sparkles, LayoutList, Sun, Moon, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { Wordmark } from '../ui/Wordmark'
import { getInitial } from '../../utils/getInitial'

const items = [
  { to: '/dashboard/dump',    Icon: Sparkles,   label: 'Dump',    key: 'D' },
  { to: '/dashboard/tarefas', Icon: LayoutList, label: 'Tarefas', key: 'T' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const name = user?.user_metadata?.name || user?.email || ''

  return (
    <aside className="hidden lg:flex flex-col w-[248px] flex-shrink-0 border-r border-border bg-surface px-4 py-6">
      <Wordmark className="px-2 mb-8" />

      <nav className="flex flex-col gap-1">
        {items.map(({ to, Icon, label, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-label font-semibold transition-colors ${
                isActive
                  ? 'bg-action text-white'
                  : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary'
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            <kbd className="text-meta font-medium opacity-70 rounded-[6px] border border-current/30 px-1.5 leading-5">{key}</kbd>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <button
          onClick={toggle}
          className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-label font-medium text-text-secondary hover:bg-surface-sunken hover:text-text-primary transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </button>
        <button
          onClick={async () => {
            localStorage.setItem('dumpit_show_login', '1')
            await signOut()
          }}
          className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-label font-medium text-danger hover:bg-surface-sunken transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>

        <div className="mt-3 flex items-center gap-3 border-t border-border pt-4 px-2">
          <div className="w-9 h-9 rounded-full bg-action text-white flex items-center justify-center text-label font-semibold flex-shrink-0">
            {getInitial(user)}
          </div>
          <div className="min-w-0">
            <div className="text-label font-semibold text-text-primary truncate">{name}</div>
            <div className="text-meta text-text-secondary truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
