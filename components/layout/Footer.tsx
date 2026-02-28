import Link from 'next/link'

const links = {
  Platform: [
    { label: 'Browse spaces', href: '/spaces' },
    { label: 'List a space', href: '/signup' },
    { label: 'How it works', href: '/#how-it-works' },
  ],
  Account: [
    { label: 'Sign up', href: '/signup' },
    { label: 'Log in', href: '/login' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Categories: [
    { label: 'Billboards', href: '/spaces?type=Billboard' },
    { label: 'Vehicle wraps', href: '/spaces?type=Vehicle' },
    { label: 'Digital screens', href: '/spaces?type=Digital' },
    { label: 'Event signage', href: '/spaces?type=Event' },
  ],
}

export default function Footer() {
  return (
    <footer
      className="border-t mt-20"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-2xl" style={{ color: 'var(--accent)' }}>
              SpotLight
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              The marketplace for unconventional advertising spaces.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                {group}
              </p>
              <ul className="flex flex-col gap-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm transition hover:opacity-100"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs sm:flex-row"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
        >
          <p>© {new Date().getFullYear()} SpotLight. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:opacity-80">Privacy</Link>
            <Link href="#" className="hover:opacity-80">Terms</Link>
            <Link href="#" className="hover:opacity-80">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
