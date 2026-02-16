/**
 * GitHub profile stats and contribution heatmap data.
 * Fetched at build time via the GitHub REST API.
 */

const GITHUB_USER = 'tejas-2232';
const PROFILE_URL = `https://api.github.com/users/${GITHUB_USER}`;
const EVENTS_URL = `https://api.github.com/users/${GITHUB_USER}/events/public`;

// ── Types ────────────────────────────────────────

export interface GitHubStats {
  publicRepos: number;
  followers: number;
  following: number;
  publicGists: number;
  profileUrl: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionData {
  weeks: ContributionWeek[];
  totalContributions: number;
  monthLabels: { label: string; colIndex: number }[];
}

// ── Profile stats ────────────────────────────────

export async function getGitHubStats(): Promise<GitHubStats | null> {
  try {
    const res = await fetch(PROFILE_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      publicRepos: data.public_repos ?? 0,
      followers: data.followers ?? 0,
      following: data.following ?? 0,
      publicGists: data.public_gists ?? 0,
      profileUrl: data.html_url ?? `https://github.com/${GITHUB_USER}`,
    };
  } catch {
    return null;
  }
}

// ── Contribution heatmap ─────────────────────────

interface RawEvent {
  type: string;
  created_at: string;
  payload?: {
    commits?: unknown[];
    size?: number;
  };
}

async function fetchAllEvents(): Promise<RawEvent[]> {
  const allEvents: RawEvent[] = [];
  for (let page = 1; page <= 3; page++) {
    try {
      const res = await fetch(`${EVENTS_URL}?per_page=100&page=${page}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!res.ok) break;
      const events = await res.json();
      if (!Array.isArray(events) || events.length === 0) break;
      allEvents.push(...events);
    } catch {
      break;
    }
  }
  return allEvents;
}

function countContributions(event: RawEvent): number {
  if (event.type === 'PushEvent') {
    const commits = event.payload?.commits;
    return Array.isArray(commits) ? Math.max(commits.length, 1) : (event.payload?.size ?? 1);
  }
  return 1;
}

function computeLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function getContributionData(): Promise<ContributionData> {
  const events = await fetchAllEvents();

  const countsByDate: Record<string, number> = {};
  for (const event of events) {
    const dateStr = event.created_at?.slice(0, 10);
    if (!dateStr) continue;
    countsByDate[dateStr] = (countsByDate[dateStr] ?? 0) + countContributions(event);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDay = today.getDay();

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (12 * 7 + todayDay));

  const weeks: ContributionWeek[] = [];
  let totalContributions = 0;
  let currentWeek: ContributionDay[] = [];
  const current = new Date(startDate);

  while (current <= today) {
    const dateStr = toDateString(current);
    const count = countsByDate[dateStr] ?? 0;
    totalContributions += count;

    currentWeek.push({
      date: dateStr,
      count,
      level: computeLevel(count),
    });

    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }

    current.setDate(current.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push({ days: currentWeek });
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < weeks.length; w++) {
    const firstDay = weeks[w].days[0];
    if (firstDay) {
      const month = new Date(firstDay.date + 'T00:00:00').getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: monthNames[month], colIndex: w });
        lastMonth = month;
      }
    }
  }

  return { weeks, totalContributions, monthLabels };
}

/** Format a YYYY-MM-DD string for heatmap tooltips. */
export function formatHeatmapDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
