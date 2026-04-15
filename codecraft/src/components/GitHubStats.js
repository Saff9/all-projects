// src/components/GitHubStats.js
import { FaStar, FaCodeBranch, FaExclamationCircle, FaFileCode, FaHistory } from 'react-icons/fa';

async function fetchRepoData(repo) {
  const token = process.env.GITHUB_TOKEN;
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers,
    next: { revalidate: 3600 }, // revalidate every hour
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function GitHubStats({ repo }) {
  const data = await fetchRepoData(repo);

  if (!data) {
    return (
      <div className="mt-8 p-4 bg-craft-surface rounded-xl border border-craft-border text-craft-muted">
        Unable to load GitHub stats for <code>{repo}</code>.
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-craft-surface rounded-xl border border-craft-border">
      <h3 className="text-craft-mint font-semibold mb-4">Project Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-craft-text">
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-400" /> {data.stargazers_count}
        </div>
        <div className="flex items-center gap-1">
          <FaCodeBranch /> {data.forks_count}
        </div>
        <div className="flex items-center gap-1">
          <FaExclamationCircle /> {data.open_issues_count}
        </div>
        <div className="flex items-center gap-1">
          <FaFileCode /> {data.language}
        </div>
        <div className="flex items-center gap-1">
          <FaHistory /> {new Date(data.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
