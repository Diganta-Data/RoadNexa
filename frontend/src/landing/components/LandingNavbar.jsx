import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Search, X } from 'lucide-react';
import { NAV_ITEMS, ROUTES, SEARCH_TARGETS } from '../config';
import { IrisButton, IrisLogo } from './ui';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open && !searchOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, searchOpen]);

  const results = SEARCH_TARGETS.filter((item) =>
    `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <header className={`iris-nav ${scrolled ? 'is-scrolled' : ''}`} data-hero="nav">
        <div className="iris-nav-inner">
          <Link to="/" className="iris-brand" aria-label="RoadNexa home">
            <span className="iris-brand-mark">
              <IrisLogo />
            </span>
            <span>
              <strong>RoadNexa</strong>
              <small>Road Intelligence</small>
            </span>
          </Link>

          <nav className="iris-nav-links" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `iris-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="iris-nav-right">
            <button
              type="button"
              className="iris-icon-btn"
              aria-label="Search platform pages"
              data-cursor="button"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
            </button>
            <IrisButton to={ROUTES.dashboard} size="md">Explore Demo</IrisButton>
            <IrisButton to={ROUTES.upload} variant="secondary" icon="upload">Upload Dataset</IrisButton>
            <button
              type="button"
              className="iris-icon-btn iris-menu"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="iris-drawer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0" aria-label="Close menu" onClick={() => setOpen(false)} />
            <motion.aside
              className="iris-drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <button type="button" className="iris-icon-btn absolute top-6 right-6" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
              {NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <NavLink to={item.to} className="block py-3 text-2xl font-semibold" onClick={() => setOpen(false)}>
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              <IrisButton to={ROUTES.dashboard} className="mt-6">Explore Demo</IrisButton>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div className="iris-search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0" aria-label="Close search" onClick={() => setSearchOpen(false)} />
            <motion.div
              className="iris-search-panel relative"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              role="dialog"
              aria-label="Jump to a platform page"
            >
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Jump to dashboard, map, cities, ML..."
                aria-label="Search pages"
              />
              <div className="mt-2">
                {results.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    data-cursor="button"
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(item.to);
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="text-[#94A3B8] text-xs">{item.hint}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
