export function calculateFilter(input: string) {
  let type = ""; // baseString
  let filter = "";
  let skip = 0;
  let limit = 0;
  let isMultiple = true;

  const parseSkipLimit = (filter: string) => {
    let skip = 0;
    let limit = 0;
    const skipMatch = filter.match(/skip\s*=\s*(\d+)/i);
    const limitMatch = filter.match(/limit\s*=\s*(\d+)/i);
    if (skipMatch) {
      skip = Number.parseInt(skipMatch[1], 10);
    }
    if (limitMatch) {
      limit = Number.parseInt(limitMatch[1], 10);
    }
    return { limit, skip };
  };

  const parseFilter = (input: string, startChar: string, endChar: string) => {
    const filterStart = input.indexOf(startChar);
    if (filterStart > 0) {
      type = input.slice(0, filterStart);
      const filterEnd = input.indexOf(endChar, filterStart);
      if (filterEnd > filterStart) {
        filter = input.slice(filterStart + 1, filterEnd);
        const { limit: l, skip: s } = parseSkipLimit(filter);
        skip = s;
        limit = l;
        filter = filter
          .replace(/skip\s*=\s*\d+/i, "")
          .replace(/limit\s*=\s*\d+/i, "")
          .trim();
      }
    }
  };

  if (input.includes("[")) {
    parseFilter(input, "[", "]");
  } else if (input.includes("(")) {
    isMultiple = false;
    parseFilter(input, "(", ")");
  } else {
    type = input;
  }

  return { filter, isMultiple, limit, skip, type };
}
