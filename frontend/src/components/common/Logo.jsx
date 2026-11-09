import { Link } from 'react-router-dom';

export default function Logo({
  size = 46,
  showText = true,
  textColor = '#0284c7',
  layout = 'horizontal',
}) {
  const isHorizontal = layout === 'horizontal';

  return (
    <Link
      to="/"
      style={{
        textDecoration: 'none',
        display: 'inline-flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isHorizontal ? '0.65rem' : '0.25rem',
        padding: '2px 0',
        backgroundColor: 'transparent',
      }}
    >
      <img
        src="/logo.png"
        alt="AquaCraft Logo"
        style={{
          height: `${size}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      {showText && (
        <span
          style={{
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            fontSize: isHorizontal ? '1.35rem' : '1.1rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: textColor || '#0284c7',
            textTransform: 'uppercase',
            lineHeight: 1,
            display: 'block',
            textAlign: isHorizontal ? 'left' : 'center',
          }}
        >
          AquaCraft
        </span>
      )}
    </Link>
  );
}
