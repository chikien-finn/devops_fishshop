import { Link } from 'react-router-dom';

export default function Logo({
  size = 56,
  showText = true,
  textColor = '#0284c7',
}) {
  return (
    <Link
      to="/"
      style={{
        textDecoration: 'none',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 4px',
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
            fontSize: '1.1rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: textColor || '#0284c7',
            textTransform: 'uppercase',
            marginTop: '3px',
            lineHeight: 1,
            display: 'block',
            textAlign: 'center',
          }}
        >
          AquaCraft
        </span>
      )}
    </Link>
  );
}
