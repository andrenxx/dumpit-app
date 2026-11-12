export function Wordmark({ className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 text-title font-bold tracking-tight text-text-primary ${className}`}>
      dump
      <span className="px-[7px] py-[2px] rounded-[9px] bg-sticker text-sticker-ink -rotate-3 inline-block">
        it
      </span>
    </div>
  )
}
