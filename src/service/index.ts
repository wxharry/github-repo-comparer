import { Octokit } from "octokit";
import * as pageDetect from 'github-url-detection';

const API_TOKEN=process.env.PLASMO_PUBLIC_API_TOKEN

const octokit = new Octokit({ 
  auth: API_TOKEN,
});

const {owner, name} = pageDetect.utils.getRepositoryInfo();

export const fetchRepoData = async () => {
  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: owner,
      repo: name,
    });
    return [{
      "stars": res.data.stargazers_count,
      "forks": res.data.forks_count,
      "open_issues": res.data.open_issues_count,
      "created_at": res.data.created_at,
      "updated_at": res.data.updated_at,
      "owner": owner,
      "repo": name,
    }]
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};