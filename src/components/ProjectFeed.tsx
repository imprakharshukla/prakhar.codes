import { getCollection } from 'astro:content';
import { Button } from "./ui";
import { useAutoAnimate } from '@formkit/auto-animate/react'


const projects = await getCollection("project");

export default function ProjectFeed({
  numberOfPost = 4,
  headingVisible = false
}: {
  numberOfPost?: number,
  headingVisible?: boolean
}) {

  const [parent] = useAutoAnimate()
  return (
    <>
      <div>
        {headingVisible &&
          <h1 className="h3-heading">
            Latest Projects
          </h1>
        }
      </div>
      <div className="mt-3 grid grid-cols-1 items-center xs:w-full">
        <ul ref={parent} className="grid gap-6">
          {
            projects.slice(0, numberOfPost).map((project) => {
              return (
                <li key={project.id}>
                  <a href={`/projects/${project.slug}`} className="cursor-pointer">
                    <div className="text-muted-foreground group transform duration-200 cursor-pointer hover:scale-[1.02] border-transparent">
                      <div className="flex flex-col gap-4 justify-start">
                        <div className="rounded-sm w-full h-full">
                          <img
                            style={getTransitionId(project.id)}
                            className="object-cover rounded-sm group-hover:border border-primary shadow-sm"
                            src={project.data.heroImage}
                            alt=""
                          />
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <div className="w-full gap-y-2 flex flex-col ">
                            <div className="flex items-center gap-3">
                              <h3 className="h5-heading">
                                {project.data.title}
                              </h3>
                              <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium  md:text-sm text-xs">
                                {project.data.status}
                              </p>

                              <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium  md:text-sm text-xs">
                                {project.data.type}
                              </p>

                            </div>
                            <p className="group-hover:text-foreground s-description line-clamp-1 md:max-w-2xl">
                              {project.data.description}
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
        {projects.length > numberOfPost &&
          <div>
            <a href="/projects">
              <Button size={"sm"} className="my-4" variant={"secondary"}>
                View all Projects
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