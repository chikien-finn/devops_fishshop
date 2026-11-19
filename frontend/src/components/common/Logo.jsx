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
            fontFamily: "'Segoe UI', Roboto, -apple-system, sans-serif",
            fontSize: isHorizontal ? '1.25rem' : '1.05rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: textColor || '#0284c7',
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
