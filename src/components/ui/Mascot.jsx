// src/components/ui/Mascot.jsx
//
// Componente base do mascote. NÃO contém lógica de crop — cada tela usa
// este componente dentro de um wrapper próprio (ver LoginMascot.jsx,
// ExampleCard.jsx, ProgressCard.jsx) porque o enquadramento varia.
//
// O objectFit: 'contain' é OBRIGATÓRIO e não deve ser removido.
// Dois dos três SVGs (login e kanban) têm preserveAspectRatio="none",
// o que faz o navegador esticar/distorcer a imagem para caber em
// qualquer caixa, a menos que objectFit force a proporção correta.

export default function Mascot({ pose, width, className = '', style = {} }) {
  const sources = {
    login: '/mascote/mascote-login.svg',
    dump: '/mascote/mascote-dump.svg',
    kanban: '/mascote/mascote-kanban.svg',
  }

  return (
    <img
      src={sources[pose]}
      alt=""
      className={className}
      style={{
        width,
        minWidth: width,
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
