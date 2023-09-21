import { Octokit } from "octokit";

const API_TOKEN=process.env.PLASMO_PUBLIC_API_TOKEN

const octokit = new Octokit({ 
  auth: API_TOKEN,
});

export const fetchRepoData = async (owner, repo) => {
  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: owner,
      repo: repo,
    });
    return {
      "stars": res.data.stargazers_count,
      "forks": res.data.forks_count,
      "watches": res.data.watchers_count,
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};