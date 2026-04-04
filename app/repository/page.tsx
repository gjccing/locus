"use client"
import { useState, useEffect } from "react"
import { SearchBar } from "@/components/search-bar"
import { getSession } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Octokit } from "octokit"
import { useInView } from "react-intersection-observer"
import { SyncIcon } from "@primer/octicons-react"
import { cn } from "@/lib/utils"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  private: boolean
  language: string
  stargazers_count: number
  updated_at: string
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("")
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const pageSize = 30

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  })

  useEffect(() => {
    async function fetchRepos(pageNumber: number, isInitial: boolean = false) {
      try {
        if (isInitial) setLoading(true)
        else setIsFetchingMore(true)

        const session = await getSession()
        if (session?.accessToken) {
          const octokit = new Octokit({
            auth: session.accessToken,
          });
          
          const { data } = await octokit.rest.repos.listForAuthenticatedUser({
            per_page: pageSize,
            page: pageNumber,
            sort: "updated",
            visibility: "all",
            affiliation: "owner,collaborator,organization_member",
          });

          if (isInitial) {
            setRepos(data as unknown as Repository[])
          } else {
            setRepos(prev => [...prev, ...(data as unknown as Repository[])])
          }
          
          setHasMore(data.length === pageSize)
        }
      } catch (error) {
        console.error("Error fetching repositories:", error)
      } finally {
        setLoading(false)
        setIsFetchingMore(false)
      }
    }

    if (page === 1) {
      fetchRepos(1, true)
    } else {
      fetchRepos(page)
    }
  }, [page])

  useEffect(() => {
    if (inView && hasMore && !loading && !isFetchingMore) {
      setPage(prev => prev + 1)
    }
  }, [inView, hasMore, loading, isFetchingMore])

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-8 p-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Repositories</h1>
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        results={filteredRepos.length}
      />
      {!loading && repos.length === 0 ? (
        <div className="text-center text-muted-foreground p-8">
          No repositories found or you are not authenticated.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              >
                <Card className="h-full hover:shadow-md transition-shadow group flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="truncate group-hover:text-primary transition-colors text-base leading-snug">
                        {repo.name}
                      </CardTitle>
                      <Badge variant={repo.private ? "secondary" : "outline"} className="shrink-0 text-[10px] h-5 px-1.5 font-medium leading-none">
                        {repo.private ? "Private" : "Public"}
                      </Badge>
                    </div>
                    {repo.description && (
                      <CardDescription className="line-clamp-2 mt-2 text-sm text-balance">
                        {repo.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <div className="p-6 pt-0 mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                    {repo.language && (
                      <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-primary/60" />
                        {repo.language}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      ★ {repo.stargazers_count}
                    </div>
                    <div className="truncate ml-auto text-[10px]">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              </a>
            ))}
            {!loading && filteredRepos.length === 0 && repos.length > 0 && (
              <div className="col-span-full text-center text-muted-foreground p-8">
                No repositories found matching &quot;{searchTerm}&quot;.
              </div>
            )}
          </div>
          <div
            ref={ref}
            className={cn(
              "flex justify-center p-8",
              !hasMore && "hidden"
            )}
          >
            {(isFetchingMore || loading) && (
              <div className="flex items-center gap-2 text-muted-foreground animate-in fade-in duration-500">
                <SyncIcon className="animate-spin" />
                <span>Loading more...</span>
              </div>
            )}
          </div>
          {!hasMore && repos.length > 0 && (
            <div className="text-center text-muted-foreground/50 text-xs pb-8">
              No more repositories to load.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
