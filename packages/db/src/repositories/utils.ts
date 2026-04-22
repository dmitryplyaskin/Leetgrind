export function definedValues<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export function slugifySkillTitle(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\+/g, " plus ")
    .replace(/#/g, " sharp ")
    .replace(/&/g, " and ")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length > 0) {
    return slug;
  }

  let hash = 0;

  for (const char of title.trim()) {
    hash = (Math.imul(hash, 31) + (char.codePointAt(0) ?? 0)) >>> 0;
  }

  return `skill-${hash.toString(36)}`;
}
