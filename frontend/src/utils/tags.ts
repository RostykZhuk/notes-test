export const parseTags = (input: string) =>
  input
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag, index, all) => tag.length > 0 && all.indexOf(tag) === index);

export const tagsToString = (tags: string[]) => tags.join(', ');
