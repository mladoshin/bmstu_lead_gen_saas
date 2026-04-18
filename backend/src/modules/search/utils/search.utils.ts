export class SearchUtils {
  static extractDomain(url: string): string | undefined {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return undefined;
    }
  }

  static deduplicate<T extends { domain?: string; name: string; city: string }>(items: T[]): T[] {
    const seen = new Set<string>();
    return items.filter(c => {
      const key = c.domain ?? `${c.name}|${c.city}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
