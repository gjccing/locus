"use client"
import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { useSearchParams } from "next/navigation"


export default function Page() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const [searchTerm, setSearchTerm] = useState(searchQuery)

  return (
    <div className="flex flex-col gap-8 p-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Repositories</h1>
      <SearchBar
        value={searchParams.get("search") || ""}
        onChange={(v) => {
          setSearchTerm(v)
        }}
       />
    </div>
  )
}
