/**
 * GitHub profile stats and contribution heatmap data.
 * Heatmap is parsed from the GitHub contributions page for a full year
 * of accurate data (including private contributions if the user has that
 * setting enabled on their profile). Falls back to the Events API (~90 days)
 * if the contributions page is unavailable.
 */

const GITHUB_USER = 'tejas-2232';
const PROFILE_URL = `https://api.github.com/users/${GITHUB_USER}`;
const CONTRIBUTIONS_URL = `https://github.com/users/${GITHUB_USER}/contributions`;
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

// ── Contributions page parser (full year) ────────

interface ParsedDay {
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
}

async function fetchYearContributions(): Promise<{
  days: Map<string, ParsedDay>;
  total: number | null;
} | null> {
  try {
    const res = await fetch(CONTRIBUTIONS_URL, {
      headers: { Accept: 'text/html' },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const days = new Map<string, ParsedDay>();

    // Parse <td> elements with data-date and data-level attributes
    const rx =
      /<td\b[^>]*?\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*?\bdata-level="(\d)"[^>]*?(?:\/>|>([\s\S]*?)<\/td>)/gi;
    let m;
    while ((m = rx.exec(html)) !== null) {
      const date = m[1];
      const level = Math.min(parseInt(m[2], 10), 4) as 0 | 1 | 2 | 3 | 4;
      const inner = m[3] ?? '';
      const cm = inner.match(/(\d+)\s+contribution/i);
      const count = cm ? parseInt(cm[1], 10) : estimateFromLevel(level);
      days.set(date, { level, count });
    }

    // Handle reverse attribute order (data-level before data-date)
    if (days.size === 0) {
      const rx2 =
        /<td\b[^>]*?\bdata-level="(\d)"[^>]*?\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*?(?:\/>|>([\s\S]*?)<\/td>)/gi;
      while ((m = rx2.exec(html)) !== null) {
        const level = Math.min(parseInt(m[1], 10), 4) as 0 | 1 | 2 | 3 | 4;
        const date = m[2];
        const inner = m[3] ?? '';
        const cm = inner.match(/(\d+)\s+contribution/i);
        const count = cm ? parseInt(cm[1], 10) : estimateFromLevel(level);
        days.set(date, { level, count });
      }
    }

    // Try to extract the total from the page header
    const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i);
    const total = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ''), 10) : null;

    return days.size > 0 ? { days, total } : null;
  } catch {
    return null;
  }
}

function estimateFromLevel(level: number): number {
  return [0, 1, 3, 6, 10][level] ?? 0;
}

// ── Events API fallback (~90 days) ───────────────

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

// ── Shared utilities ─────────────────────────────

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Build contribution data (full year) ──────────

export async function getContributionData(): Promise<ContributionData> {
  // Try GitHub contributions page first (full year, accurate)
  const pageData = await fetchYearContributions();

  // Fall back to Events API if contributions page failed
  let eventCounts: Record<string, number> | null = null;
  if (!pageData) {
    const events = await fetchAllEvents();
    eventCounts = {};
    for (const event of events) {
      const dateStr = event.created_at?.slice(0, 10);
      if (!dateStr) continue;
      eventCounts[dateStr] = (eventCounts[dateStr] ?? 0) + countContributions(event);
    }
  }

  // Build a ~52-week grid ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setDate(oneYearAgo.getDate() + 1);

  // Align start to the Sunday at or before oneYearAgo
  const startDate = new Date(oneYearAgo);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks: ContributionWeek[] = [];
  let totalContributions = 0;
  let currentWeek: ContributionDay[] = [];
  const current = new Date(startDate);

  while (current <= today) {
    const dateStr = toDateString(current);

    let level: 0 | 1 | 2 | 3 | 4;
    let count: number;

    if (pageData) {
      const dayData = pageData.days.get(dateStr);
      level = (dayData?.level ?? 0) as 0 | 1 | 2 | 3 | 4;
      count = dayData?.count ?? 0;
    } else {
      count = eventCounts?.[dateStr] ?? 0;
      level = computeLevel(count);
    }

    totalContributions += count;
    currentWeek.push({ date: dateStr, count, level });

    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }

    current.setDate(current.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push({ days: currentWeek });
  }

  // Prefer the page total if available (more accurate)
  if (pageData?.total != null) {
    totalContributions = pageData.total;
  }

  // Month labels
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
