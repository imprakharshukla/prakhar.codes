import { useRef, useState, useEffect } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface Movie {
  title: string;
  year: string;
  poster: string;
  imdbRating: string;
  genre: string;
  imdbID: string;
}

export function MovieScroller({ endpoint = "/api/movies" }: { endpoint?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endpoint]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [movies]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  // Drag to scroll
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = scrollRef.current?.scrollLeft ?? 0;
    scrollRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - startX.current;
    scrollRef.current.scrollLeft = scrollStart.current - dx;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    scrollRef.current?.releasePointerCapture(e.pointerId);
  };

  if (loading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[160px] md:w-[180px]">
            <div className="aspect-[2/3] w-full rounded-sm bg-muted animate-pulse" />
            <div className="mt-2 h-4 w-3/4 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative max-w-full overflow-hidden">
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-4 w-16 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent flex items-center justify-center">
          <button
            onClick={() => scroll("left")}
            className="pointer-events-auto w-8 h-8 rounded-full border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <CaretLeft size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* Right fade + arrow */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-4 w-16 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent flex items-center justify-center">
          <button
            onClick={() => scroll("right")}
            className="pointer-events-auto w-8 h-8 rounded-full border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* Scroller */}
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth py-2 px-1 pb-4 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie) => (
          <a
            key={movie.imdbID}
            href={`https://www.imdb.com/title/${movie.imdbID}`}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            className="snap-start shrink-0 w-[160px] md:w-[180px] text-muted-foreground group/card transform duration-200 hover:scale-[1.02]"
          >
            <div className="relative overflow-hidden rounded-sm bg-muted">
              <img
                src={movie.poster}
                alt={movie.title}
                loading="lazy"
                draggable={false}
                className="aspect-[2/3] w-full object-cover rounded-sm group-hover/card:border border-primary"
              />
              {/* Badges */}
              <div className="absolute top-2 right-2 flex gap-1">
                <span className="text-white bg-black/70 px-1.5 py-0.5 rounded font-medium text-xs backdrop-blur-sm">
                  {movie.genre.split(",")[0]}
                </span>
                <span className="text-white bg-black/70 px-1.5 py-0.5 rounded font-medium text-xs backdrop-blur-sm">
                  {movie.imdbRating}
                </span>
              </div>
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="h5-heading line-clamp-1 !text-sm">{movie.title}</p>
              <p className="text-xs text-muted-foreground group-hover/card:text-foreground">{movie.year}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
