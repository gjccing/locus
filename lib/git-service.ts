import FS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

let fs: FS | undefined = undefined;

export function getFS() {
  if (!fs) {
    fs = new FS('context-editor-fs');
  }
  return fs;
}

export async function cloneRepository(
  owner: string, 
  repo: string, 
  accessToken: string,
  onProgress?: (progress: number) => void
) {
  const fs = getFS();
  const dir = `/${owner}/${repo}`;
  
  // Check if directory exists and has .git
  let isCloned = false;
  try {
    const stats = await fs.promises.stat(`${dir}/.git`);
    isCloned = stats.isDirectory();
  } catch {
    isCloned = false;
  }

  const url = `https://github.com/${owner}/${repo}.git`;
  const common = {
    fs,
    http,
    dir,
    corsProxy: 'https://cors.isomorphic-git.org',
    headers: { Authorization: `Basic ${btoa(accessToken)}` },
    onProgress: (p: { loaded: number; total?: number }) => {
      if (onProgress && p.total) {
        onProgress(Math.round((p.loaded / p.total) * 100));
      }
    }
  };

  if (!isCloned) {
    await git.clone({
      ...common,
      url,
      singleBranch: false,
    });
  } else {
    // Already exists, fetch to get latest branches
    await git.fetch({
      ...common,
      singleBranch: false,
    });
  }
}

export async function getFileTree(owner: string, repo: string) {
  const fs = getFS();
  const dir = `/${owner}/${repo}`;
  
  const files = await git.listFiles({ fs, dir });
  return files;
}

export async function getBranches(owner: string, repo: string) {
  const fs = getFS();
  const dir = `/${owner}/${repo}`;
  const branches = await git.listBranches({ fs, dir, remote: 'origin' });
  return branches;
}

export interface BranchTreeNode {
  id: string; // Commit SHA or Branch Name
  name: string;
  type: 'commit' | 'branch';
  children?: BranchTreeNode[];
}

export async function resolveBranchTree(owner: string, repo: string): Promise<BranchTreeNode[]> {
  const fs = getFS();
  const dir = `/${owner}/${repo}`;
  const branchNames = (await git.listBranches({ fs, dir, remote: 'origin' }))
    .filter(name => name !== "HEAD")
  // Get history for each branch
  const histories = await Promise.all(branchNames.map(async name => {
    try {
      const log = await git.log({ fs, dir, ref: `origin/${name}`, depth: 100 });
      return { name, path: log.map(c => c.oid).reverse() }; // oldest to newest
    } catch {
      return { name, path: [] };
    }
  }));
  // Build a trie of commits
  interface InternalNode {
    id: string;
    name: string;
    type: 'commit' | 'branch';
    children: Map<string, InternalNode>;
    branches: string[];
  }

  const root: Map<string, InternalNode> = new Map();

  histories.forEach(({ name, path }) => {
    let previousNode: InternalNode | null = null
    let currentLevel = root;
    path.forEach((sha, index) => {
      if (!currentLevel.has(sha)) {
        currentLevel.set(sha, {
          id: sha,
          name: sha.substring(0, 7),
          type: 'commit',
          children: new Map(),
          branches: []
        });
      }
      const node = currentLevel.get(sha)!;
      if (previousNode) {
        previousNode.children.set(sha, node)
      }
      if (index === path.length - 1) {
        node.branches.push(name);
      }
      previousNode = node
      currentLevel = node.children;
    });
  });
  // Convert trie to the requested BranchTreeNode structure and simplify
  function convertAndSimplify(nodesMap: Map<string, InternalNode>): BranchTreeNode[] {
    const result: BranchTreeNode[] = [];

    nodesMap.forEach((internalNode) => {
      // If internal node has only one child and no branches, collapse it
      let current = internalNode;
      while (current.children.size === 1 && current.branches.length === 0) {
        const nextSha = current.children.keys().next().value;
        if (nextSha === undefined) break;
        const nextNode = current.children.get(nextSha);
        if (!nextNode) break;
        current = nextNode;
      }

      const node: BranchTreeNode = {
        id: current.id,
        name: current.name,
        type: 'commit',
        children: []
      };

      // Add branches pointing here
      current.branches.forEach(b => {
        node.children?.push({
          id: b,
          name: b,
          type: 'branch'
        });
      });

      // Recurse for children
      const childNodes = convertAndSimplify(current.children);
      if (childNodes.length > 0) {
        node.children?.push(...childNodes);
      }

      // If after recursion it has only one branch and it's a leaf, maybe it's not a "folder"
      // But the user wants a tree, so we keep it.
      result.push(node);
    });

    return result;
  }

  return convertAndSimplify(root);
}

export async function readFile(owner: string, repo: string, filepath: string) {
  const fs = getFS();
  const dir = `/${owner}/${repo}`;
  const content = await fs.promises.readFile(`${dir}/${filepath}`, 'utf8');
  return content;
}

interface GitTreeItem {
  id: string;
  name: string;
  children?: GitTreeItem[];
}

export function buildHierarchicalTree(files: string[]): GitTreeItem[] {
  const root: GitTreeItem[] = [];
  const map: Record<string, GitTreeItem> = {};

  files.forEach(path => {
    const parts = path.split('/');
    let currentPath = '';

    parts.forEach((part, index) => {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = index === parts.length - 1;

      if (!map[currentPath]) {
        const item: GitTreeItem = {
          id: currentPath,
          name: part,
          children: isLast ? undefined : [],
        };
        map[currentPath] = item;

        if (parentPath === '') {
          root.push(item);
        } else {
          const parent = map[parentPath];
          if (parent && parent.children) {
            parent.children.push(item);
          }
        }
      }
    });
  });

  return root;
}
