"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getSession } from 'next-auth/react'
import { Octokit } from 'octokit'
import { cloneRepository, resolveBranchTree, BranchTreeNode } from '@/lib/git-service'
import { Repository } from '@/components/repository-card'

interface RepoContextType {
  repo: Repository | null
  branchTree: BranchTreeNode[]
  loading: boolean
  error: string | null
  cloneProgress: number
}

const RepoContext = createContext<RepoContextType | undefined>(undefined)

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const id = params.id as string
  
  const [repo, setRepo] = useState<Repository | null>(null)
  const [branchTree, setBranchTree] = useState<BranchTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cloneProgress, setCloneProgress] = useState(0)
  
  useEffect(() => {
    if (!id) return

    async function initRepo() {
      try {
        setLoading(true)
        setError(null)
        
        const session = await getSession()
        if (!session?.accessToken) {
          setError("Not authenticated or missing access token")
          setLoading(false)
          return
        }

        const token = session.accessToken as string
        const octokit = new Octokit({ auth: token })
        
        let repoData: Repository
        if (!isNaN(Number(id))) {
          const { data } = await octokit.request('GET /repositories/{id}', {
            id: Number(id)
          })
          repoData = data as Repository
        } else {
          const [owner, name] = id.split('-')
          const { data } = await octokit.rest.repos.get({ owner, repo: name })
          repoData = data as unknown as Repository
        }

        setRepo(repoData)

        // Clone using isomorphic-git
        await cloneRepository(repoData.owner.login, repoData.name, token, (p) => {
          setCloneProgress(p)
        })

        // // Get branches
        // const branchList = await getBranches(repoData.owner.login, repoData.name)
        // setBranches(branchList)

        // Get branch tree (hierarchy)
        const bTree = await resolveBranchTree(repoData.owner.login, repoData.name)
        setBranchTree(bTree)

      } catch (err: unknown) {
        console.error("Error initializing repo:", err)
        setError(err instanceof Error ? err.message : "Failed to load repository")
      } finally {
        setLoading(false)
      }
    }

    initRepo()
  }, [id])

  return (
    <RepoContext.Provider value={{ repo, branchTree, loading, error, cloneProgress }}>
      {children}
    </RepoContext.Provider>
  )
}

export function useRepo() {
  const context = useContext(RepoContext)
  if (context === undefined) {
    throw new Error('useRepo must be used within a RepoProvider')
  }
  return context
}
