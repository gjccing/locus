"use client"
import { useState } from "react"
import { SearchBar } from "@/components/search-bar"


export default function Page() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="flex flex-col gap-8 p-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Repositories</h1>
      <SearchBar
        value={searchTerm}
        onChange={(v) => {
          setSearchTerm(v)
        }}
       />
    </div>
  )
}
