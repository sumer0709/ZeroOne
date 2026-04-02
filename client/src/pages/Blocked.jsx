export default function Blocked() {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <p style={styles.icon}>🚫</p>
        <h2 style={styles.title}>TEAM BLOCKED</h2>
        <p style={styles.text}>
          Your team has been blocked due to repeated violations.
          Contact the admin to restore access.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: '#020408' },
  box: { background: '#0a1520', border: '2px solid #ff3c6e', borderRadius: 12,
    padding: 40, maxWidth: 420, textAlign: 'center', display: 'flex',
    flexDirection: 'column', gap: 16 },
  icon: { fontSize: 52, margin: 0 },
  title: { color: '#ff3c6e', fontFamily: 'monospace', fontSize: 24,
    margin: 0, letterSpacing: 3 },
  text: { color: '#c8e6f0', fontSize: 15, lineHeight: 1.6, margin: 0 }
}