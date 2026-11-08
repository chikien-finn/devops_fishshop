import { Link } from 'react-router-dom';

export default function Logo({
  boxed = true,
  size = 54,
  showText = true,
  textColor = '#0284c7',
  subText = 'AQUARIUM',
}) {
  const content = (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: boxed ? '4px 14px' : '0',
        border: boxed ? '2px solid #dc2626' : 'none',
        borderRadius: boxed ? '4px' : '0',
        backgroundColor: '#ffffff',
        transition: 'transform 0.2s, box-shadow 0.2s',
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
        <div style={{ textAlign: 'center', marginTop: '2px', lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: "'Segoe UI', Roboto, sans-serif",
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '1px',
              color: textColor || '#0f172a',
              textTransform: 'uppercase',
              display: 'block',
            }}
          >
            AquaCraft
          </span>
          {subText && (
            <span
              style={{
                fontSize: '0.625rem',
                letterSpacing: '2.5px',
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'block',
              }}
            >
              {subText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
      {content}
    </Link>
  );
}

