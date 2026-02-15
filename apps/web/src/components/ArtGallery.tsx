import { useRef, useState, useEffect } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface ArtImage {
  src: string;
  alt: string;
  caption: string;
}

const artImages: ArtImage[] = [
  { src: "https://resume-cdn.prakhar.codes/life/IMG_6572%202.jpg", alt: "Art piece 1", caption: "Art piece 1" },
  { src: "https://resume-cdn.prakhar.codes/life/IMG_6574%202.jpg", alt: "Art piece 2", caption: "Art piece 2" },
  { src: "https://resume-cdn.prakhar.codes/life/IMG_6575%202.jpg", alt: "Art piece 3", caption: "Art piece 3" },
  { src: "https://resume-cdn.prakhar.codes/life/IMG_6576%202.jpg", alt: "Art piece 4", caption: "Art piece 4" },
];

export function ArtGallery({ images = artImages }: { images?: ArtImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasDragged = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.clientX;
    scrollStart.current = scrollRef.current?.scrollLeft ?? 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 3) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollStart.current - dx;
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  return (
    <>
      <div className="relative max-w-full overflow-hidden">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent flex items-center justify-center">
            <button
              onClick={() => scroll("left")}
              className="pointer-events-auto w-8 h-8 rounded-full border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
          </div>
        )}

        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent flex items-center justify-center">
            <button
              onClick={() => scroll("right")}
              className="pointer-events-auto w-8 h-8 rounded-full border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth py-2 px-1 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                if (!hasDragged.current) {
                  setIndex(i);
                  setOpen(true);
                }
              }}
              className="snap-start shrink-0 w-[200px] md:w-[220px] text-muted-foreground group transform duration-200 hover:scale-[1.02] cursor-pointer border-transparent"
            >
              <div className="relative rounded-sm overflow-hidden aspect-[3/4]">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover rounded-sm group-hover:border border-primary"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-xs font-medium">{img.caption}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((img) => ({ src: img.src, alt: img.alt }))}
      />
    </>
  );
}
