import { getCollection } from 'astro:content';
import { Button } from "./ui";
import { useAutoAnimate } from '@formkit/auto-animate/react'


const travels = await getCollection("travel");
const sortedTravels = [...travels].sort((a, b) => 
  new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
);

export default function TravelFeed({
  numberOfPost = 100
}: {
  numberOfPost?: number
}) {

  const [parent] = useAutoAnimate()
  return (
    <>
      <div className="">
        <ul ref={parent} className="grid gap-6 lg:grid-cols-2 grid-cols-1">
          {
            sortedTravels.slice(0, numberOfPost).map((travel) => {
              return (
                <li key={travel.id}>
                  <a href={`/travel/${travel.slug}`} className="cursor-pointer">
                    <div className="text-muted-foreground group transform duration-200 cursor-pointer hover:scale-[1.02] border-transparent">
                      <div className="flex flex-col gap-4 justify-start">
                        <div className="rounded-sm w-full h-full">
                          <img
                            style={getTransitionId(travel.id)}
                            className="aspect-video object-cover rounded-sm group-hover:border border-primary"
                            src={travel.data.heroImage}
                            alt=""
                          />
                        </div>
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
                  </a>
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
    </>

  );
}

const getTransitionId = (id: string) => {
  return {
    viewTransitionName: id.replace(/[^a-z0-9]/gi, '')
  }
}