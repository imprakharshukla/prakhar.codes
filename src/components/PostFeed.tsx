import FilterMenu from "./FilterMenu";
import { Category, collections } from "../content/config";
import type { z } from "astro/zod";
import { getCollection } from 'astro:content';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Button, Input } from "./ui";
import { ArrowRight, ListFilter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { cn } from "../lib/utils";
import Fuse from 'fuse.js';


const blogPosts = await getCollection("blog");

const fuseOptions = {
  keys: ['data.title', 'data.description', 'slug'],
  includeMatches: true,
  minMatchCharLength: 2,
  threshold: 0.5,
};

export default function PostFeed({
  searchEnabled = false,
  headingVisible = false,
  numberOfPost = 4
}: {
  searchEnabled?: boolean,
  headingVisible?: boolean,
  numberOfPost?: number
}) {

  const [query, setQuery] = useState('');

  const searchList = blogPosts.filter((post) => {
    return post.data.publish === true;
  });

  const fuse = new Fuse(searchList, fuseOptions);

  const searchResults = fuse.search(query).map((result) => result.item)
    .slice(0, 5);

  function handleOnSearch(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    console.log({ value });
    setQuery(value);
  }

  const [category, setCategory] = useState<Category | "All">("All");
  const [posts, setPosts] = useState(blogPosts);
  useEffect(() => {
    console.log({ category });
    if (category === "All") {
      posts.sort((a, b) => {
        return new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime();
      });
      setPosts(blogPosts);
    } else {
      blogPosts.sort((a, b) => {
        return new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime();
      });
      setPosts(
        blogPosts.filter((post) => {
          return post.data.category === category;
        })
      );
    }
  }, [category]);

  const [parent, enableAnimations] = useAutoAnimate()

  return (
    <>
      <div className={cn("flex w-full items-center justify-between")}>
        {headingVisible &&
          <h1 className="h3-heading">
            Latest Articles
          </h1>
        }
        <div className={cn("flex items-center gap-3 my-5", searchEnabled && "w-full")}>
          {searchEnabled &&
            <Input value={query} onChange={handleOnSearch} placeholder="Search articles" className="text-base text-muted-foreground" />
          }
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant={"outline"} className="text-foreground">
                Filter
                <ListFilter size={20} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border border-border/50">
              {
                Object.values(Category).map((category) => (
                  <DropdownMenuItem onClick={() => {
                    setCategory(category)
                  }} key={category}>
                    {category}
                  </DropdownMenuItem>

                ))

              }
              <DropdownMenuItem onClick={() => {
                setCategory("All")
              }} key={"all"}>
                {/* <button className="text-muted-foreground text-sm"> */}
                All
                {/* </button> */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ul ref={parent} className="grid">
        {

          query.length > 0 ? searchResults.map((post) => {
            return (
              <Post
                id={post.id}
                title={post.data.title}
                description={post.data.description}
                category={post.data.category}
                heroImage={post.data.heroImage}
                slug={post.slug}
              />
            )
          }) :
            posts.slice(0, numberOfPost).map((post) => {
              return (
                <Post
                  id={post.id}
                  title={post.data.title}
                  description={post.data.description}
                  category={post.data.category}
                  heroImage={post.data.heroImage}
                  slug={post.slug}
                />
              );
            })
        }
      </ul>
      {posts.length > numberOfPost &&
        <div>
          <a href="/blog">
            <Button size={"sm"} className="my-4" variant={"secondary"}>
              View all Posts
            </Button>
          </a>
        </div>
      }
    </>

  );
}

const Post = ({
  id,
  title,
  description,
  category,
  heroImage,
  slug
}: {
  id: string,
  title: string,
  description: string,
  category?: string,
  heroImage?: string,
  slug: string
}) => {
  return (
    <li key={id}>
      <a href={`/blog/${slug}`} className="cursor-pointer">
        <div className="text-muted-foreground group transform duration-200 cursor-pointer hover:scale-[1.02] border-transparent">
          <div className="flex flex-col gap-4 justify-start">
            <div className="rounded-sm w-full h-full">
              <img
                style={getTransitionId(id)}
                className="object-cover rounded-sm group-hover:border border-primary"
                src={heroImage}
                alt=""
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="w-full gap-y-2 flex flex-col ">
                <div className="flex items-baseline gap-3">
                  <h3 className="h5-heading">
                    {title}
                  </h3>
                  <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium md:text-sm text-xs">
                    {category}
                  </p>
                </div>
                <p className="group-hover:text-foreground s-description line-clamp-1 md:max-w-lg">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>
    </li>
  )
}
const getTransitionId = (id: string) => {
  return {
    viewTransitionName: id.replace(/[^a-z0-9]/gi, '')
  }
}