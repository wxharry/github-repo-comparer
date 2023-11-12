import { validateAndExtractRepoInfo } from "~utils/utils"

chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
  if (req.name === "GetFullRepoName") {
    const res = validateAndExtractRepoInfo(window.location.href)
    sendResponse(res)
  }
  return true
})
