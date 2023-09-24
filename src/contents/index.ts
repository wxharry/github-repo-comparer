import { GetOwnerRepoName } from "~service";


chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
    if (req.name == 'GetFullRepoName'){
        GetOwnerRepoName()
        .then(res => {
            sendResponse(res);
        })
        .catch(error => {
            console.error("Error fetching repo data:", error);
            sendResponse({ error: "Failed to fetch repo data" });
        });                
    }
    // Indicate that the response will be sent asynchronously
    return true;
})
