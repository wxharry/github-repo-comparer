export const validateAndExtractRepoInfo = (str) => {
  // Regex to match the format 'xxx/xxx', a GitHub repo link format, or other GitHub URLs (pulls, issues, actions, etc.)
  const regex =
    /^(?:https?:\/\/github\.com\/)?([^\/]+)\/([^\/]+)(?:\/[^\/]+)?(?:\/\d+)?$/

  const match = str.match(regex)
  if (match) {
    return {
      owner: match[1],
      repo: match[2]
    }
  }
  return null
}
