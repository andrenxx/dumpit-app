export default function Mascot({ pose, className = '', style = {} }) {
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
      style={{ display: 'block', ...style }}
    />
  )
}
