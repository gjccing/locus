"use client"

import { useParams } from "next/navigation"

export default function RepositoryDetailPage() {
  const { id } = useParams()
  return (
    <>
      {id}
      {/** TODO: implement the repository detail page */}
    </>
  )
}
