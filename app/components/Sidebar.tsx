'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navSections = [
  {
    label: 'Dashboard',
    items: [
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
        label: 'Add Entry',
        href: '/entry',
        icon: () => (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Insights',
    items: [
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
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-[#0c0b0b]">
      {/* Logo */}
      <div className="flex h-24 items-center justify-center border-b border-white/[0.06] px-3">
        <Image
          src="/dashlogo.png"
          alt="Analytics"
          width={220}
          height={80}
          priority
          style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
        />
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto py-4">
        {navSections.map((section, si) => (
          <div key={section.label} className={si > 0 ? 'mt-5' : ''}>
            <p className="mb-1 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
              {section.label}
            </p>
            <nav className="space-y-0.5 px-3">
              {section.items.map((item, i) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'nav-link group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80',
                    ].join(' ')}
                    style={{ animationDelay: `${0.05 + (si * 3 + i) * 0.05}s` }}
                  >
                    {isActive && (
                      <span className="absolute inset-y-0 left-0 w-[3px] rounded-full bg-white/50" />
                    )}
                    <span className={`shrink-0 transition-colors duration-150 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>
                      <item.icon />
                    </span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer / user */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[0.06] transition-colors cursor-pointer">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
            <span className="text-[12px] font-bold text-white">M</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-semibold text-white/90">Mohammed</span>
            <span className="text-[11px] text-white/40">Admin</span>
          </div>
          <svg className="ml-auto shrink-0 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </aside>
  )
}
