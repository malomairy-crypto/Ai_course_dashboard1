'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 4-6" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-[#1a1a22] bg-[#09090c]">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-[#1a1a22] px-5">
        <Image
          src="/logo.png"
          alt="Delightrics"
          width={130}
          height={42}
          priority
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
        />
      </div>

      {/* Nav label */}
      <div className="px-5 pb-1.5 pt-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
          Menu
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'nav-link group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'border border-amber-500/25 bg-amber-500/10 text-amber-300'
                  : 'border border-transparent text-slate-500 hover:border-white/5 hover:bg-white/[0.04] hover:text-slate-200',
              ].join(' ')}
              style={{ animationDelay: `${0.05 + i * 0.055}s` }}
            >
              <span
                className={`shrink-0 transition-colors duration-150 ${
                  isActive ? 'text-amber-400' : 'text-slate-700 group-hover:text-slate-400'
                }`}
              >
                <item.icon />
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / user */}
      <div className="border-t border-[#1a1a22] p-4">
        <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/15">
            <span className="font-mono text-[11px] font-bold text-amber-400">M</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[12px] font-medium text-slate-300">Mohammed</span>
            <span className="text-[10px] text-slate-600">Admin</span>
          </div>
          <button
            className="ml-auto shrink-0 text-slate-700 transition-colors hover:text-slate-400"
            aria-label="Sign out"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
