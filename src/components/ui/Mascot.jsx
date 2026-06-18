// src/components/ui/Mascot.jsx
//
// Renders one of the three mascot SVGs. Crop logic lives in each consumer
// (ExampleCard, ProgressCard, Landing) because framing differs per screen.
//
// flexShrink:0 + minWidth prevent flex containers from shrinking the image
// below its explicit width, which would break overflow-based crop wrappers.
// objectFit:'contain' is required: mascote-login.svg and mascote-kanban.svg
// carry preserveAspectRatio="none", which distorts without this override.

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
