"use client"
import { useState, useEffect } from "react"
import { SearchBar } from "@/components/search-bar"
import { getSession } from "next-auth/react"
import { Octokit } from "octokit"
import { useInView } from "react-intersection-observer"
import { SyncIcon } from "@primer/octicons-react"
import { cn } from "@/lib/utils"
import { RepositoryCard, type Repository } from "@/components/repository-card"

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
    (repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
              <RepositoryCard key={repo.id} repo={repo} />
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
