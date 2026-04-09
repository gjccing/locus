import FS from "@isomorphic-git/lightning-fs"
import git from "isomorphic-git"
import http from "isomorphic-git/http/web"

let fs: FS | undefined = undefined

export function getFS() {
  if (!fs) {
    fs = new FS("context-editor-fs")
  }
  return fs
}

export async function hasCloned(owner: string, repo: string) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  try {
    const stats = await fs.promises.stat(`${dir}/.git`)
    return stats.isDirectory()
  } catch {
    return false
  }
}

export async function cloneRepository(
  owner: string,
  repo: string,
  accessToken: string,
  onProgress?: (progress: number) => void
) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const url = `https://github.com/${owner}/${repo}.git`

  await git.clone({
    fs,
    http,
    dir,
    corsProxy: "https://cors.isomorphic-git.org",
    headers: { Authorization: `Basic ${btoa(accessToken)}` },
    onProgress: (p: { loaded: number; total?: number }) => {
      if (onProgress && p.total) {
        onProgress(Math.round((p.loaded / p.total) * 100))
      }
    },
    url,
    singleBranch: false,
    noCheckout: true,
  })
}

export async function fetchAllBranches(owner: string, repo: string) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const branches = (
    await git.listBranches({ fs, dir, remote: "origin" })
  ).filter((name) => name !== "HEAD")
  await Promise.all(
    branches.map((branch) =>
      git.checkout({ fs, dir, ref: branch, noCheckout: true })
    )
  )
  return branches
}

export async function fetchAllTags(owner: string, repo: string) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  return await git.listTags({ fs, dir })
}

export async function getCurrentBranch(owner: string, repo: string) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  return (await git.currentBranch({ fs, dir })) || undefined
}

export async function checkoutBranch(
  owner: string,
  repo: string,
  branch: string
) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  await git.checkout({
    fs,
    dir,
    ref: branch,
    noCheckout: true,
  })
}

export async function fetchRepository(
  owner: string,
  repo: string,
  accessToken: string,
  onProgress?: (progress: number) => void
) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const url = `https://github.com/${owner}/${repo}.git`
  await git.fetch({
    fs,
    http,
    dir,
    url,
    corsProxy: "https://cors.isomorphic-git.org",
    headers: { Authorization: `Basic ${btoa(accessToken)}` },
    onProgress: (p: { loaded: number; total?: number }) => {
      if (onProgress && p.total) {
        onProgress(Math.round((p.loaded / p.total) * 100))
      }
    },
  })
}

export async function pushRepository(
  owner: string,
  repo: string,
  accessToken: string,
  onProgress?: (progress: number) => void
) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const url = `https://github.com/${owner}/${repo}.git`
  await git.push({
    fs,
    http,
    dir,
    url,
    corsProxy: "https://cors.isomorphic-git.org",
    headers: { Authorization: `Basic ${btoa(accessToken)}` },
    onProgress: (p: { loaded: number; total?: number }) => {
      if (onProgress && p.total) {
        onProgress(Math.round((p.loaded / p.total) * 100))
      }
    },
  })
}
