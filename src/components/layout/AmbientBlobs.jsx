export function AmbientBlobs() {
  return (
    <div aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <div style={{ position:'fixed', top:-60, right:-40, width:260, height:260, borderRadius:'50%',
        background:'#5B3DF2', filter:'blur(60px)', opacity:0.22, zIndex:-10 }} />
      <div style={{ position:'fixed', bottom:-30, left:-50, width:220, height:220, borderRadius:'50%',
        background:'#FF6F52', filter:'blur(60px)', opacity:0.16, zIndex:-10 }} />
      <div style={{ position:'fixed', top:'45%', right:-30, width:180, height:180, borderRadius:'50%',
        background:'#00D2A0', filter:'blur(60px)', opacity:0.14, zIndex:-10 }} />
    </div>
  )
}
