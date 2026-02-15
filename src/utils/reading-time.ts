/** Words per minute for average reading speed. */
const WPM = 200;

/**
 * Returns estimated reading time in minutes from raw markdown/text.
 * Strips frontmatter and code blocks for a better word count.
 */
export function getReadingTimeMinutes(content: string | undefined): number {
  if (!content || typeof content !== 'string') return 1;
  const stripped = content
    .replace(/^---[\s\S]*?---/m, '') // frontmatter
    .replace(/```[\s\S]*?```/g, '') // fenced code blocks
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*?|__?/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // link text only
  const words = stripped.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WPM));
}

export function formatReadingTime(minutes: number): string {
  return minutes === 1 ? '1 min read' : `${minutes} min read`;
}
