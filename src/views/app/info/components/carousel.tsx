import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Article } from './article-card'

interface CarouselProps {
  articles: Article[]
  onArticleClick?: (article: Article) => void
  className?: string
}

export function Carousel({ articles, onArticleClick, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex((index + articles.length) % articles.length)
    },
    [articles.length]
  )

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])

  useEffect(() => {
    if (isPaused || articles.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [isPaused, next, articles.length])

  if (articles.length === 0) return null

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-48 sm:h-56 md:h-64">
        {articles.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              'absolute inset-0 flex cursor-pointer items-end transition-all duration-700 ease-in-out',
              i === currentIndex
                ? 'opacity-100 translate-x-0'
                : i < currentIndex
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
            )}
            onClick={() => onArticleClick?.(item)}
          >
            {/* Gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
              }}
            />
            {/* Content overlay */}
            <div className="relative z-10 w-full p-6 text-white">
              <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {item.category}
              </span>
              <h3 className="text-lg font-semibold leading-tight md:text-xl">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-white/80 line-clamp-1">
                {item.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {articles.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {articles.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === currentIndex
                  ? 'h-1.5 w-5 bg-white'
                  : 'h-1.5 w-1.5 bg-white/50 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
