import type { CollectionEntry } from 'astro:content';
import { Button } from "@prakhar/ui";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function TravelFeed({
  numberOfPost = 100,
  travels
}: {
  numberOfPost?: number;
  travels: CollectionEntry<"travel">[];
}) {
  const sortedTravels = [...travels].sort((a, b) =>
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
  const visibleTravels = useMemo(
    () => sortedTravels.slice(0, numberOfPost),
    [sortedTravels, numberOfPost]
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeTravel = activeIndex === null ? null : visibleTravels[activeIndex];

  const closeGallery = () => setActiveIndex(null);
  const showPrevious = () => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === 0 ? visibleTravels.length - 1 : current - 1;
    });
  };
  const showNext = () => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === visibleTravels.length - 1 ? 0 : current + 1;
    });
  };

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, visibleTravels.length]);

  const [parent] = useAutoAnimate()
  return (
    <>
      <div className="">
        <ul ref={parent} className="grid gap-6 lg:grid-cols-2 grid-cols-1">
          {
            visibleTravels.map((travel, index) => {
              return (
                <li key={travel.id}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="block w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-left"
                    aria-label={`Open ${travel.data.place} photo`}
                  >
                    <div className="text-muted-foreground group transform duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.99] border-transparent">
                      <div className="flex flex-col gap-4 justify-start">
                        {travel.data.heroImage && (
                          <div className="rounded-sm w-full h-full">
                            <img
                              style={getTransitionId(travel.id)}
                              className="aspect-video object-cover rounded-sm group-hover:border border-primary"
                              src={travel.data.heroImage}
                              alt=""
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between w-full">
                          <div className="w-full gap-y-2 flex flex-col ">
                            <div className="flex items-center gap-3">
                              <h3 className="h5-heading">
                                {travel.data.place}
                              </h3>
                              <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium md:text-sm text-xs">
                                {travel.data.state}, {travel.data.country}
                              </p>

                            </div>
                            <p className="group-hover:text-foreground line-clamp-1 md:max-w-2xl s-description">
                              {travel.data.description}
                            </p>
                            <p className="group-hover:text-foreground line-clamp-1 md:max-w-2xl text-xs">
                              <time>
                                {
                                  travel.data.date.toLocaleDateString('en-us', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                }
                              </time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })
          }
        </ul>
        {travels.length > numberOfPost &&
          <div>
            <a href="/travels">
              <Button size={"sm"} className="my-4" variant={"secondary"}>
                View all Travels
              </Button>
            </a>
          </div>

        }
      </div>
      {activeTravel?.data.heroImage && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-950/85 p-3 backdrop-blur-sm md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeTravel.data.place} photo gallery`}
          onClick={closeGallery}
        >
          <div
            className="relative max-h-[92dvh] w-full max-w-6xl overflow-hidden rounded-sm bg-zinc-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeTravel.data.heroImage}
              alt=""
              className="max-h-[92dvh] w-full object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/55 to-transparent px-4 pb-4 pt-16 text-white md:px-6 md:pb-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="grid max-w-3xl gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-semibold leading-tight md:text-4xl">
                      {activeTravel.data.place}
                    </h3>
                    <p className="rounded bg-white/15 px-2 py-1 text-xs font-medium text-white/90 backdrop-blur-sm md:text-sm">
                      {activeTravel.data.state}, {activeTravel.data.country}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-white/85 md:text-base">
                    {activeTravel.data.description}
                  </p>
                </div>
                <time className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                  {activeTravel.data.date.toLocaleDateString('en-us', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
            <button
              type="button"
              onClick={closeGallery}
              className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-zinc-950/55 text-white backdrop-blur-sm transition hover:bg-zinc-900/80 active:scale-95"
              aria-label="Close gallery"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            {visibleTravels.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-zinc-950/55 text-white backdrop-blur-sm transition hover:bg-zinc-900/80 active:scale-95"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-zinc-950/55 text-white backdrop-blur-sm transition hover:bg-zinc-900/80 active:scale-95"
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>

  );
}

const getTransitionId = (id: string) => {
  return {
    viewTransitionName: id.replace(/[^a-z0-9]/gi, '')
  }
}
