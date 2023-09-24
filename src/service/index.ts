import { Octokit } from "octokit";
import * as pageDetect from 'github-url-detection';

const API_TOKEN=process.env.PLASMO_PUBLIC_API_TOKEN

const octokit = new Octokit({ 
  auth: API_TOKEN,
});

const {owner, name} = pageDetect.utils.getRepositoryInfo();

export const GetOwnerRepoName = async () => {
  try {
    return {
      owner: owner,
      repo: name,
    }
  } catch (error) {
    return;
  }
};

export const fetchRepoData = async ({owner, repo}) => {
  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: owner,
      repo: repo,
    });
    return {
      "stars": res.data.stargazers_count,
      "forks": res.data.forks_count,
      "open_issues": res.data.open_issues_count,
      "created_at": res.data.created_at,
      "updated_at": res.data.updated_at,
      "owner": owner,
      "repo": repo,
    }
  } catch (error) {
    // TODO: analyze error code
    // console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchRepoListData = async (repoList) => {
  try {
    // Fetch data for all repos in parallel and await the results
    const results = await Promise.all(repoList.map(async (element) => {
      return await fetchRepoData(element);
    }));
    // Filter out any null results (or error objects) if necessary
    return results.filter(result => result !== null);
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}