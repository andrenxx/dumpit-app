import Mascot from '../components/ui/Mascot'

export default function WelcomePage({ onContinue }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1,
      padding: '0 24px', position: 'relative', zIndex: 10,
    }}>
      {/* Text: centered in the upper portion of the screen */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 40, fontWeight: 800, color: 'hsl(var(--text-primary))',
          letterSpacing: '-0.8px', lineHeight: 1.15, marginBottom: 16,
        }}>
          Vamos organizar<br />sua bagunça
        </h1>
        <p style={{
          fontSize: 16, color: 'hsl(var(--text-secondary))',
          fontWeight: 500, lineHeight: 1.6,
        }}>
          Joga tudo que tá na sua cabeça.<br />Eu cuido do resto.
        </p>
      </div>

      {/* Mascot + Button: pinned to bottom. Mascot's lower half hides behind button. */}
      <div style={{ width: '100%', paddingBottom: 56 }}>
        {/* Negative margin pulls the mascot into the button's space */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          position: 'relative', zIndex: 1, marginBottom: -90,
        }}>
          <Mascot
            pose="login"
            width={300}
            style={{ filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.4))' }}
          />
        </div>

        <button
          onClick={onContinue}
          style={{
            position: 'relative', zIndex: 2,
            width: '100%', padding: '18px 22px',
            borderRadius: 25, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(145deg, #1B9DC6, #0E7C9E)',
            boxShadow: '0 10px 26px rgba(27,157,198,0.4)',
            color: 'white', fontSize: 15.5, fontWeight: 800,
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          Por aqui <span style={{ fontSize: 17 }}>→</span>
        </button>
      </div>
    </div>
  )
}
