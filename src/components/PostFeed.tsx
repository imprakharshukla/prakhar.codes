import { Category, collections } from "../content/config";
import type { z } from "astro/zod";
import type { CollectionEntry } from "astro:content";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  Input,
} from "./ui";
import { ArrowRight, ListFilter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cn } from "../lib/utils";
import * as Fuse from "fuse.js";
import { getReadingTimeDynamic } from "../plugins/reading-time-dynamic";
import FilterDropdown from "./FilterDropdown";

const fuseOptions = {
  keys: ["data.title", "data.description", "slug"],
  includeMatches: true,
  minMatchCharLength: 2,
  threshold: 0.5,
};

export default function PostFeed(
  props: {
    searchEnabled?: boolean;
    headingVisible?: boolean;
    numberOfPost?: number;
    posts: CollectionEntry<"blog">[];
    compact?: boolean;
  }
) {
  const {
    searchEnabled = false,
    headingVisible = false,
    numberOfPost = 4,
    posts: blogPosts,
    compact = false,
  } = props;

  const [query, setQuery] = useState("");

  const searchList = blogPosts.filter((post) => {
    return post.data.publish === true;
  });

  const fuse = new Fuse.default(searchList, fuseOptions);

  const searchResults = fuse
    .search(query)
    .map((result) => result.item)
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
        return (
          new Date(b.data.pubDate).getTime() -
          new Date(a.data.pubDate).getTime()
        );
      });
      setPosts(blogPosts);
    } else {
      blogPosts.sort((a, b) => {
        return (
          new Date(b.data.pubDate).getTime() -
          new Date(a.data.pubDate).getTime()
        );
      });
      setPosts(
        blogPosts.filter((post) => {
          return post.data.category === category;
        })
      );
    }
  }, [category]);

  const [parent, enableAnimations] = useAutoAnimate();

  return (
    <>
      <div className={cn("flex w-full items-center justify-between")}>
        {headingVisible && <h1 className="h3-heading">Latest Articles</h1>}
        <div
          className={cn(
            "flex items-center gap-3 my-5",
            searchEnabled && "w-full"
          )}
        >
          {searchEnabled && (
            <Input
              value={query}
              onChange={handleOnSearch}
              placeholder="Search articles"
              className="text-base text-muted-foreground"
            />
          )}
          <FilterDropdown setCategory={setCategory} />
        </div>
      </div>
      <ul ref={parent} className="grid gap-6">
        {query.length > 0
          ? searchResults.map((post) => {
              return (
                <Post
                  id={post.id}
                  body={post.body}
                  title={post.data.title}
                  description={post.data.description}
                  category={post.data.category}
                  heroImage={post.data.heroImage}
                  slug={post.slug}
                  compact={compact}
                />
              );
            })
          : posts.slice(0, numberOfPost).map((post) => {
              return (
                <Post
                  body={post.body}
                  id={post.id}
                  title={post.data.title}
                  description={post.data.description}
                  category={post.data.category}
                  heroImage={post.data.heroImage}
                  slug={post.slug}
                  compact={compact}
                />
              );
            })}
      </ul>
      {posts.length > numberOfPost && (
        <div>
          <a href="/blog">
            <Button size={"sm"} className="my-4" variant={"secondary"}>
              View all Posts
            </Button>
          </a>
        </div>
      )}
    </>
  );
}

const Post = ({
  id,
  title,
  description,
  category,
  body,
  heroImage,
  slug,
  compact = false,
}: {
  id: string;
  title: string;
  body: string;
  description: string;
  category?: string;
  heroImage?: string;
  slug: string;
  compact?: boolean;
}) => {
  if (compact) {
    return (
      <li key={id}>
        <a href={`/blog/${slug}`} className="cursor-pointer">
          <div className="text-muted-foreground group transform duration-200 cursor-pointer hover:scale-[1.01] border-transparent">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="rounded-sm flex-shrink-0 w-full sm:w-32 aspect-[16/9]">
                <img
                  style={getTransitionId(id)}
                  className="object-cover rounded-sm w-full h-full group-hover:border border-primary"
                  src={heroImage}
                  alt=""
                />
              </div>
              <div className="flex-1 gap-y-2 flex flex-col min-w-0">
                <div className="flex items-baseline gap-3">
                  <h3 className="h5-heading">{title}</h3>
                  <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium text-xs flex-shrink-0">
                    {category}
                  </p>
                </div>
                <p className="group-hover:text-foreground s-description line-clamp-1">
                  {description}
                </p>
                <p className="group-hover:text-foreground s-description text-xs">
                  {getReadingTimeDynamic(body)}
                </p>
              </div>
            </div>
          </div>
        </a>
      </li>
    );
  }

  return (
    <li key={id}>
      <a href={`/blog/${slug}`} className="cursor-pointer">
        <div className="text-muted-foreground group transform duration-200 cursor-pointer hover:scale-[1.02] border-transparent">
          <div className="flex flex-col sm:flex-row gap-4 justify-start">
            <div className="rounded-sm w-full sm:w-48 sm:flex-shrink-0 overflow-hidden aspect-[16/9]">
              <img
                style={getTransitionId(id)}
                className="object-cover rounded-sm w-full h-full group-hover:border border-primary"
                src={heroImage}
                alt=""
              />
            </div>
            <div className="flex items-center justify-between w-full sm:flex-1">
              <div className="w-full gap-y-2 flex flex-col">
                <div className="flex items-baseline gap-3">
                  <h3 className="h5-heading">{title}</h3>
                  <p className="text-primary bg-primary/20 px-1.5 py-1 rounded font-medium md:text-sm text-xs flex-shrink-0">
                    {category}
                  </p>
                </div>
                <p className="group-hover:text-foreground s-description line-clamp-1 md:max-w-lg">
                  {description}
                </p>
                <p className="group-hover:text-foreground s-description md:max-w-lg">
                  {getReadingTimeDynamic(body)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>
    </li>
  );
};
const getTransitionId = (id: string) => {
  return {
    viewTransitionName: id.replace(/[^a-z0-9]/gi, ""),
  };
};
