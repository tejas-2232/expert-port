/**
 * Fetches public GitHub events at build time for the activity feed.
 * Returns a normalized list of { text, url, date } for display.
 */

const GITHUB_USER = 'tejas-2232';
const EVENTS_URL = `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=15`;

export interface GitHubActivityItem {
  text: string;
  url: string;
  date: Date;
  type: 'push' | 'create' | 'star' | 'fork' | 'pr' | 'issue' | 'other';
}

function parseEvent(event: {
  type: string;
  repo?: { name: string; url?: string };
  payload?: {
    ref?: string;
    ref_type?: string;
    size?: number;
    commits?: unknown[];
    action?: string;
    pull_request?: { html_url: string };
    issue?: { html_url: string };
  };
  created_at: string;
}): GitHubActivityItem | null {
  const repoName = event.repo?.name ?? 'repo';
  const repoUrl = event.repo?.url
    ? event.repo.url.replace('api.github.com/repos/', 'github.com/')
    : `https://github.com/${repoName}`;
  const date = new Date(event.created_at);

  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload?.commits;
      const count = Array.isArray(commits) ? commits.length : (event.payload?.size ?? 0);
      const branch = event.payload?.ref?.replace('refs/heads/', '') ?? 'main';
      const commitText =
        count <= 0 ? 'Pushed to' : count === 1 ? 'Pushed 1 commit to' : `Pushed ${count} commits to`;
      return {
        text: `${commitText} ${repoName} (${branch})`,
        url: `${repoUrl}/commits/${branch}`,
        date,
        type: 'push',
      };
    }
    case 'CreateEvent': {
      const refType = event.payload?.ref_type ?? 'resource';
      const ref = event.payload?.ref ?? '';
      return {
        text: `Created ${refType} ${ref ? ref + ' in ' : ''}${repoName}`,
        url: repoUrl,
        date,
        type: 'create',
      };
    }
    case 'WatchEvent':
      return {
        text: `Starred ${repoName}`,
        url: repoUrl,
        date,
        type: 'star',
      };
    case 'ForkEvent':
      return {
        text: `Forked ${repoName}`,
        url: repoUrl,
        date,
        type: 'fork',
      };
    case 'PullRequestEvent': {
      const action = event.payload?.action ?? 'opened';
      const prUrl = event.payload?.pull_request?.html_url ?? repoUrl;
      return {
        text: `${action} a PR in ${repoName}`,
        url: prUrl,
        date,
        type: 'pr',
      };
    }
    case 'IssuesEvent': {
      const action = event.payload?.action ?? 'opened';
      const issueUrl = event.payload?.issue?.html_url ?? repoUrl;
      return {
        text: `${action} an issue in ${repoName}`,
        url: issueUrl,
        date,
        type: 'issue',
      };
    }
    default:
      return null;
  }
}

export async function getGitHubActivity(): Promise<GitHubActivityItem[]> {
  try {
    const res = await fetch(EVENTS_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return [];
    const events: unknown[] = await res.json();
    const items: GitHubActivityItem[] = [];
    for (const ev of events) {
      const item = parseEvent(ev as Parameters<typeof parseEvent>[0]);
      if (item) items.push(item);
      if (items.length >= 8) break;
    }
    return items;
  } catch {
    return [];
  }
}

/** Format date as "2h ago", "3d ago", "Jan 15", etc. */
export function formatActivityDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
