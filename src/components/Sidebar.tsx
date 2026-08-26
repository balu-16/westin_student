import { NavLink } from 'react-router-dom'
import {
  CalendarClock,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  FolderOpen,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import westinLogo from '../assets/images/westin-logo.avif'
import { ProfileCard } from './ProfileCard'
import { cx } from '../utils'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Timetable', to: '/timetable', icon: CalendarDays },
  { label: 'Attendance', to: '/attendance', icon: ChartNoAxesColumnIncreasing },
  { label: 'Study Materials', to: '/materials', icon: FolderOpen },
  { label: 'Events', to: '/events', icon: CalendarClock },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export const navGroups: NavGroup[] = [
  {
    label: 'Academics',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Timetable', to: '/timetable', icon: CalendarDays },
      { label: 'Attendance', to: '/attendance', icon: ChartNoAxesColumnIncreasing },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Study Materials', to: '/materials', icon: FolderOpen },
      { label: 'Events', to: '/events', icon: CalendarClock },
    ],
  },
  {
    label: 'Account',
    items: [{ label: 'Settings', to: '/settings', icon: Settings }],
  },
]

interface SidebarContentProps {
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

function SidebarContent({ onNavigate, collapsed, onToggleCollapsed }: SidebarContentProps) {
  const width = collapsed ? 'w-[72px]' : 'w-[280px]'
  const responsiveWidth = collapsed ? width : 'w-[82vw] max-w-[320px] lg:w-[280px]'

  return (
    <div
      className={cx(
        'flex h-full shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-[#4FB0F4] via-[#3BA7F2] to-[#0E6EBD] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_20px_60px_rgba(14,110,189,0.22)]',
        collapsed ? 'overflow-visible' : 'overflow-hidden',
        responsiveWidth,
      )}
    >
      {/* Subtle top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header — logo + portal name + collapse */}
      <div className={cx('relative flex shrink-0 items-center', collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 pt-4 pb-3')}>
        {/* Logo */}
        <div
          className={cx(
            'shrink-0 rounded-xl bg-white shadow-[0_4px_14px_rgba(12,64,115,0.18)]',
            collapsed ? 'p-1.5' : 'p-1.5',
          )}
        >
          <img
            src={westinLogo}
            width={575}
            height={294}
            decoding="async"
            alt="Westin College"
            className={cx('block h-auto object-contain', collapsed ? 'w-8' : 'w-9')}
          />
        </div>

        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-extrabold leading-none tracking-tight text-white">Westin College</p>
              <p className="truncate text-[11px] font-semibold tracking-[0.08em] text-white/75">Student Portal</p>
            </div>
            {onToggleCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand' : 'Collapse'}
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/16 lg:flex"
              >
                <PanelLeftClose size={16} aria-hidden="true" />
              </button>
            )}
          </>
        )}

        {/* Collapsed — show expand button (fully visible inside header) */}
        {collapsed && onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-ink-soft shadow-md transition-colors hover:text-primary lg:flex"
          >
            <PanelLeftOpen size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Mobile top bar inside drawer — close */}
      {onNavigate && (
        <div className="flex items-center justify-between px-4 pb-2 lg:hidden">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/65">Menu</span>
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/16"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {!collapsed && <div className="mx-4 h-px shrink-0 bg-white/12" />}

      {/* Navigation */}
      <nav
        aria-label="Portal navigation"
        className={cx(
          'flex-1 py-3 scrollbar-thin min-h-0',
          collapsed ? 'space-y-1 px-2 overflow-y-auto overflow-x-visible' : 'space-y-5 px-3 overflow-y-auto overflow-x-hidden',
        )}
      >
        {collapsed
          ? navItems.map((item) => (
              <div key={item.to} className="group relative flex justify-center">
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  aria-label={item.label}
                  title={item.label}
                  className={({ isActive }) =>
                    cx(
                      'flex h-11 w-11 items-center justify-center rounded-xl text-white/85 transition-all duration-200',
                      isActive
                        ? 'bg-white text-[#0E6EBD] shadow-[0_4px_14px_rgba(12,64,115,0.22)]'
                        : 'hover:bg-white/[0.10] hover:text-white',
                    )
                  }
                >
                  <item.icon size={20} aria-hidden="true" />
                </NavLink>
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-20 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-line bg-ink px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl group-hover:block">
                  {item.label}
                  <span className="absolute right-full top-1/2 h-2 w-2 -translate-y-1/2 translate-x-[3px] rotate-45 border-b border-l border-line bg-ink" />
                </span>
              </div>
            ))
          : navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/62">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cx(
                          'group flex h-[42px] items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold transition-all duration-200',
                          isActive
                            ? 'bg-white text-[#0E6EBD] shadow-[0_4px_14px_rgba(12,64,115,0.20)]'
                            : 'text-white/85 hover:bg-white/[0.10] hover:text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cx(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                              isActive ? 'bg-[#EAF6FF] text-[#0E6EBD]' : 'bg-white/10 text-white/85 group-hover:bg-white/14 group-hover:text-white',
                            )}
                          >
                            <item.icon size={16} aria-hidden="true" />
                          </span>
                          <span className="truncate">{item.label}</span>
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#0E6EBD]" aria-hidden="true" />
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
      </nav>

      {/* Bottom — profile + subtle watermark */}
      <div className="relative shrink-0">
        {/* very subtle watermark texture instead of big illustration */}
        {!collapsed && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 opacity-[0.07]"
            style={{
              background:
                'radial-gradient(ellipse 380px 120px at 50% 100%, white 0%, transparent 70%), linear-gradient(to top, rgba(255,255,255,0.14), transparent 60%)',
            }}
          />
        )}
        <div className={cx('relative', collapsed ? 'px-2 pb-3 pt-2' : 'px-3 pb-4 pt-2')}>
          <ProfileCard onNavigate={onNavigate} collapsed={collapsed} />
        </div>
        {/* bottom safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  )
}

interface SidebarProps {
  open: boolean
  onClose: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
  onHoverEnter?: () => void
  onHoverLeave?: () => void
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapsed, onHoverEnter, onHoverLeave }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 z-30" onMouseEnter={onHoverEnter} onMouseLeave={onHoverLeave}>
          <SidebarContent collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cx('fixed inset-0 z-50 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!open}
      >
        <div
          onClick={onClose}
          className={cx(
            'absolute inset-0 bg-[#0F2A4A]/45 backdrop-blur-[6px] transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          className={cx(
            'absolute inset-y-0 left-0 overflow-hidden rounded-r-[20px] shadow-[0_20px_80px_rgba(12,64,115,0.35)] transition-transform duration-300 ease-out',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <SidebarContent onNavigate={onClose} />
        </div>
      </div>
    </>
  )
}
