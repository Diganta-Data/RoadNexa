import { Link } from 'react-router-dom';
import { ArrowRight, Upload } from 'lucide-react';
import { motion } from 'motion/react';

export function DemoBadge({ children = 'Synthetic Demo Data' }) {
  return <span className="iris-demo-badge">{children}</span>;
}

export function SectionHeading({ kicker, title, highlight, copy, demo }) {
  return (
    <header className="max-w-3xl mb-12">
      {kicker && (
        <p className="iris-kicker"><i aria-hidden="true" />{kicker}</p>
      )}
      <h2 className="iris-display">
        {title}
        {highlight && (
          <>
            <br />
            <span className="iris-gradient-text">{highlight}</span>
          </>
        )}
      </h2>
      {copy && <p className="iris-copy mt-5">{copy}</p>}
      {demo && <div className="mt-4"><DemoBadge>{demo}</DemoBadge></div>}
    </header>
  );
}

export function IrisButton({
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon = 'arrow',
  children,
  className = '',
  ...props
}) {
  const classes = `iris-btn ${variant === 'primary' ? 'iris-btn-primary' : 'iris-btn-secondary'} ${size === 'lg' ? 'iris-btn-lg' : ''} ${className}`;
  const content = (
    <motion.span
      className="relative z-10 inline-flex items-center gap-2"
      whileHover={icon === 'arrow' ? { x: 0 } : undefined}
    >
      {children}
      {icon === 'arrow' && (
        <motion.span className="inline-flex" whileHover={{ x: 4 }}>
          <ArrowRight size={16} />
        </motion.span>
      )}
      {icon === 'upload' && (
        <motion.span className="inline-flex" whileHover={{ rotate: 18 }}>
          <Upload size={16} />
        </motion.span>
      )}
      <span className="iris-shine" aria-hidden="true" />
    </motion.span>
  );

  const motionProps = {
    whileHover: { y: -2 },
    whileTap: { scale: 0.98 },
    className: classes,
    'data-cursor': 'button',
    ...props,
  };

  if (to) {
    return (
      <motion.div className="inline-flex" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link to={to} className={classes} data-cursor="button">
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.a href={href} {...motionProps}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button type="button" onClick={onClick} {...motionProps}>
      {content}
    </motion.button>
  );
}

export function IrisLogo({ className = 'w-9 h-9' }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="34" height="34" stroke="rgba(34,211,238,0.35)" />
      <path d="M8 24 L14 12 L18 20 L22 10 L28 22" stroke="#22D3EE" strokeWidth="1.4" fill="none" />
      <circle cx="14" cy="12" r="1.6" fill="#EF4444" />
      <circle cx="22" cy="10" r="1.6" fill="#F59E0B" />
      <circle cx="18" cy="20" r="1.4" fill="#22C55E" />
    </svg>
  );
}
