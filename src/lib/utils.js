import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'title', 'body', 'label', 'meta'] }],
    },
  },
})

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
