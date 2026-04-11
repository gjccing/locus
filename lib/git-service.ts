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

export async function hasCloned({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  try {
    const stats = await fs.promises.stat(`${dir}/.git`)
    return stats.isDirectory()
  } catch {
    return false
  }
}

const gitCache = new Map<string, { [key: string]: string }>()
function getGitCache(dir: string) {
  if (!gitCache.has(dir)) gitCache.set(dir, {})
  return gitCache.get(dir)!
}

export async function clone({
  owner,
  repo,
  accessToken,
}: {
  owner: string
  repo: string
  accessToken: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const url = `https://github.com/${owner}/${repo}.git`
  await git.clone({
    fs,
    http,
    dir,
    url,
    cache: getGitCache(dir),
    corsProxy: "https://cors.isomorphic-git.org",
    headers: { Authorization: `Basic ${btoa(accessToken)}` },
    depth: 1,
    singleBranch: false,
    noCheckout: true,
  })
}

export async function fetch({
  owner,
  repo,
  accessToken,
}: {
  owner: string
  repo: string
  accessToken: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const url = `https://github.com/${owner}/${repo}.git`
  await git.fetch({
    fs,
    http,
    dir,
    url,
    cache: getGitCache(dir),
    corsProxy: "https://cors.isomorphic-git.org",
    headers: { Authorization: `Basic ${btoa(accessToken)}` },
    depth: 1000000000,
    tags: true,
    prune: true,
    pruneTags: true,
  })
}

export async function listBranches({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  return await git.listBranches({ fs, dir })
}

export async function listTags({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  return await git.listTags({ fs, dir })
}

export async function listRefs({
  owner,
  repo,
  filepath,
}: {
  owner: string
  repo: string
  filepath: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  return await git.listRefs({ fs, dir, filepath })
}

export async function isExistInRef({
  owner,
  repo,
  ref,
  target,
}: {
  owner: string
  repo: string
  ref: string
  target: string
}) {
  try {
    const fs = getFS()
    const dir = `/${owner}/${repo}`
    let found = false
    await git.walk({
      fs,
      dir,
      trees: [git.TREE({ ref })],
      map: async (filepath, [treeEntry]) => {
        if (treeEntry && filepath === target) {
          found = true
          return null
        }
      },
    })
    return found
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw err
  }
}

export async function overrideByOriginBranches({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const gitDir = `${dir}/.git`
  const headsDir = `${gitDir}/refs/heads`

  const [remoteBranches, localBranches] = await Promise.all([
    git.listBranches({ fs, dir, remote: "origin" }),
    git.listBranches({ fs, dir }),
  ])

  await Promise.all(
    localBranches.map((branch) => fs.promises.unlink(`${headsDir}/${branch}`))
  )
  await Promise.all(
    remoteBranches.map(async (branch: string) => {
      if (branch === "HEAD") return
      const sha = await git.resolveRef({
        fs,
        dir,
        ref: `remotes/origin/${branch}`,
      })

      const branchPath = `${headsDir}/${branch}`
      if (branch.includes("/")) {
        const segments = branch.split("/")
        segments.pop()
        let currentPath = headsDir
        for (const segment of segments) {
          currentPath += `/${segment}`
          await fs.promises.mkdir(currentPath)
        }
      }
      await fs.promises.writeFile(branchPath, `${sha}\n`)
    })
  )
}

export async function checkoutOrphanBranch({
  owner,
  repo,
  branch,
}: {
  owner: string
  repo: string
  branch: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  await git.writeRef({
    fs,
    dir,
    ref: "HEAD",
    value: `refs/heads/${branch}`,
    symbolic: true,
    force: true,
  })
}

export async function cleanWorkspace({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  async function deleteRecursive(target: string) {
    const stats = await fs.promises.stat(target)
    if (stats.isDirectory()) {
      const entries = await fs.promises.readdir(target)
      // 優先處理子項目
      for (const entry of entries) {
        await deleteRecursive(`${target}/${entry}`)
      }
      // 子項目清空後，刪除目錄本身
      await fs.promises.rmdir(target)
    } else {
      // 如果是檔案直接刪除
      await fs.promises.unlink(target)
    }
  }

  const trackedFiles = await git.listFiles({ fs, dir })
  for (const filepath of trackedFiles) {
    await git.remove({ fs, dir, filepath })
  }

  const localEntries = await fs.promises.readdir(dir)
  for (const entry of localEntries) {
    if (entry === ".git") continue // 絕對不能刪除 .git
    try {
      await deleteRecursive(`${dir}/${entry}`)
    } catch (err) {
      console.warn(err)
    }
  }
}

export async function writeFile({
  owner,
  repo,
  filepath,
  content,
}: {
  owner: string
  repo: string
  filepath: string
  content: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const fullPath = `${dir}/${filepath}`

  // Ensure directories exist
  const parts = filepath.split("/")
  let current = dir
  for (let i = 0; i < parts.length - 1; i++) {
    current += `/${parts[i]}`
    try {
      await fs.promises.mkdir(current)
    } catch {
      // Ignore if directory already exists
    }
  }

  await fs.promises.writeFile(fullPath, content)
}

export async function commit({
  owner,
  repo,
  message,
  author,
  filepath,
}: {
  owner: string
  repo: string
  message: string
  author: { name: string; email: string }
  filepath: string | string[]
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  await git.add({ fs, dir, filepath })
  await git.commit({
    fs,
    dir,
    message,
    author,
  })
}

export async function checkout({
  owner,
  repo,
  branch,
  noCheckout,
}: {
  owner: string
  repo: string
  branch: string
  noCheckout?: boolean
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  await git.checkout({
    fs,
    dir,
    ref: branch,
    noCheckout,
  })
}

export async function push({
  owner,
  repo,
  accessToken,
  ref,
  remoteRef,
}: {
  owner: string
  repo: string
  accessToken: string
  ref?: string
  remoteRef?: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const url = `https://github.com/${owner}/${repo}.git`
  return await git.push({
    fs,
    http,
    dir,
    url,
    ref,
    remoteRef,
    corsProxy: "https://cors.isomorphic-git.org",
    headers: { Authorization: `Basic ${btoa(accessToken)}` },
  })
}

export async function deleteBranch({
  owner,
  repo,
  branch,
}: {
  owner: string
  repo: string
  branch: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  await git.deleteBranch({ fs, dir, ref: branch })
}

export async function deleteRemoteRef({
  owner,
  repo,
  accessToken,
  ref,
}: {
  owner: string
  repo: string
  accessToken: string
  ref: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const url = `https://github.com/${owner}/${repo}.git`
  return await git.push({
    fs,
    http,
    dir,
    url,
    ref,
    remoteRef: ref,
    corsProxy: "https://cors.isomorphic-git.org",
    headers: { Authorization: `Basic ${btoa(accessToken)}` },
    force: true,
    delete: true,
  })
}

export async function renameBranch({
  owner,
  repo,
  oldName,
  newName,
}: {
  owner: string
  repo: string
  oldName: string
  newName: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  await git.renameBranch({ fs, dir, oldref: oldName, ref: newName })
}

export async function deleteTag({
  owner,
  repo,
  tag,
}: {
  owner: string
  repo: string
  tag: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  await git.deleteTag({ fs, dir, ref: tag })
}

export async function renameTag({
  owner,
  repo,
  oldName,
  newName,
}: {
  owner: string
  repo: string
  oldName: string
  newName: string
}) {
  const fs = getFS()
  const dir = `/${owner}/${repo}`
  const sha = await git.resolveRef({ fs, dir, ref: oldName })
  await git.writeRef({ fs, dir, ref: `refs/tags/${newName}`, value: sha })
  await git.deleteTag({ fs, dir, ref: oldName })
}
