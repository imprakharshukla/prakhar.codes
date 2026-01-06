import type { CollectionEntry } from 'astro:content';
import { Button } from "@prakhar/ui";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import TechBadge from './TechBadge';

export default function ProjectFeed({
  numberOfPost = 4,
  headingVisible = false,
  projects,
  compact = false
}: {
  numberOfPost?: number,
  headingVisible?: boolean,
  projects: CollectionEntry<"project">[],
  compact?: boolean
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
              if (compact) {
                return (
                  <li key={project.id}>
                    <a href={`/projects/${project.slug}`} className="cursor-pointer">
                      <div className="text-muted-foreground group transform duration-200 cursor-pointer hover:scale-[1.01] border-transparent">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          <div className="rounded-sm flex-shrink-0 w-full sm:w-32 overflow-hidden">
                            <img
                              style={getTransitionId(project.id)}
                              className="object-cover object-left rounded-sm w-full h-48 sm:h-24 group-hover:border border-primary shadow-sm"
                              src={project.data.heroImage}
                              alt=""
                            />
                          </div>
                          <div className="flex-1 gap-y-2 flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="h5-heading">
                                {project.data.title}
                              </h3>
                              <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium text-xs">
                                {project.data.status}
                              </p>
                              <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium text-xs">
                                {project.data.type}
                              </p>
                            </div>
                            <p className="group-hover:text-foreground s-description line-clamp-2">
                              {project.data.description}
                            </p>
                            {/* Tech Stack Badges */}
                            {(project.data.languages || project.data.frameworks) && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {project.data.languages?.slice(0, 3).map((lang) => (
                                  <TechBadge key={lang} tech={lang} size="sm" />
                                ))}
                                {project.data.frameworks?.slice(0, 2).map((framework) => (
                                  <TechBadge key={framework} tech={framework} size="sm" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                );
              }

              return (
                <li key={project.id}>
                  <a href={`/projects/${project.slug}`} className="cursor-pointer">
                    <div className="text-muted-foreground group transform duration-200 cursor-pointer hover:scale-[1.02] border-transparent">
                      <div className="flex flex-col sm:flex-row gap-4 justify-start">
                        <div className="rounded-sm w-full sm:w-48 sm:flex-shrink-0 overflow-hidden">
                          <img
                            style={getTransitionId(project.id)}
                            className="object-cover rounded-sm w-full h-48 sm:h-32 group-hover:border border-primary shadow-sm"
                            src={project.data.heroImage}
                            alt=""
                          />
                        </div>
                        <div className="flex items-center justify-between w-full sm:flex-1">
                          <div className="w-full gap-y-2 flex flex-col">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="h5-heading">
                                {project.data.title}
                              </h3>
                              <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium md:text-sm text-xs">
                                {project.data.status}
                              </p>

                              <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium md:text-sm text-xs">
                                {project.data.type}
                              </p>

                            </div>
                            <p className="group-hover:text-foreground s-description line-clamp-2 md:max-w-2xl">
                              {project.data.description}
                            </p>
                            {/* Tech Stack Badges */}
                            {(project.data.languages || project.data.frameworks) && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {project.data.languages?.slice(0, 4).map((lang) => (
                                  <TechBadge key={lang} tech={lang} size="sm" />
                                ))}
                                {project.data.frameworks?.slice(0, 3).map((framework) => (
                                  <TechBadge key={framework} tech={framework} size="sm" />
                                ))}
                              </div>
                            )}
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