"use client";
// components/GitHubPanel.tsx
// ─── Assignment 7: Async Fetch · Three-State UI ────────────
//
// Data source : GitHub REST API (public, no key, no CORS)
//   Profile   → https://api.github.com/users/devinepal
//   Repos     → https://api.github.com/users/devinepal/repos?sort=pushed&per_page=6
//
// States      : loading (skeleton) · error (graceful UI) · success (data)
// Extra       : refresh control, prefers-reduced-motion (via CSS),
//               aria-busy, aria-live, role="alert"
// Hooks used  : useState, useEffect  (React — Week 4 pattern)

import { useState, useEffect } from 'react'

// ── Types ────────────────────────────────────────────────────
interface GitHubUser {
  login:      string
  name:       string | null
  avatar_url: string
  bio:        string | null
  location:   string | null
  public_repos: number
  followers:  number
  following:  number
  html_url:   string
  created_at: string
}

interface GitHubRepo {
  id:          number
  name:        string
  description: string | null
  html_url:    string
  stargazers_count: number
  forks_count: number
  language:    string | null
  pushed_at:   string
}

interface GitHubData {
  user:  GitHubUser
  repos: GitHubRepo[]
}

// ── Constants ────────────────────────────────────────────────
const GH_USERNAME = 'devinepal'
const USER_URL    = `https://api.github.com/users/${GH_USERNAME}`
const REPOS_URL   = `https://api.github.com/users/${GH_USERNAME}/repos?sort=pushed&per_page=6`

// ── Helpers ──────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30)  return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}yr ago`
}

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="gh-skeleton" aria-label="Loading GitHub data…" aria-busy="true">
      {/* Profile skeleton */}
      <div className="gh-profile-skeleton">
        <div className="skel skel-avatar" />
        <div className="gh-profile-text-skeleton">
          <div className="skel skel-h1" />
          <div className="skel skel-h2" />
          <div className="skel skel-line" />
          <div className="skel skel-line skel-short" />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="gh-stats-skeleton">
        {[1,2,3].map(i => (
          <div key={i} className="skel skel-stat" />
        ))}
      </div>

      {/* Repo cards skeleton */}
      <div className="gh-repos-skeleton">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="skel skel-card" />
        ))}
      </div>
    </div>
  )
}

// ── Error UI ─────────────────────────────────────────────────
function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="gh-error" role="alert" aria-live="assertive">
      <div className="gh-error-icon" aria-hidden="true">⚠</div>
      <h3>Couldn&apos;t load GitHub data</h3>
      <p className="gh-error-msg">{message}</p>
      <p>This could be a network issue or a GitHub API rate limit. Try again in a moment.</p>
      <button className="btn-primary gh-retry-btn" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export default function GitHubPanel() {
  const [data,       setData]       = useState<GitHubData | null>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // ── Fetch function (reused by initial load + refresh button) ──
  async function fetchGitHub(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true)
      setError(null)
    } else {
      setLoading(true)
      setError(null)
    }

    try {
      // Parallel fetch — both requests fire at the same time
      const [userRes, reposRes] = await Promise.all([
        fetch(USER_URL),
        fetch(REPOS_URL),
      ])

      // Check HTTP status explicitly — fetch doesn't throw on 4xx/5xx
      if (!userRes.ok)  throw new Error(`GitHub API error: HTTP ${userRes.status}`)
      if (!reposRes.ok) throw new Error(`GitHub API error: HTTP ${reposRes.status}`)

      const [user, repos]: [GitHubUser, GitHubRepo[]] = await Promise.all([
        userRes.json(),
        reposRes.json(),
      ])

      setData({ user, repos })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
    } finally {
      // Always exits loading — prevents a stuck spinner
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ── Initial load on mount ─────────────────────────────────
  useEffect(() => {
    fetchGitHub(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render: loading state ─────────────────────────────────
  if (loading) return <Skeleton />

  // ── Render: error state ───────────────────────────────────
  if (error) return <ErrorPanel message={error} onRetry={() => fetchGitHub(false)} />

  // ── Render: success state ─────────────────────────────────
  const { user, repos } = data!

  return (
    <div className="gh-panel">

      {/* ── PROFILE ───────────────────────── */}
      <div className="gh-profile">
        <img
          src={user.avatar_url}
          alt={`${user.login} GitHub avatar`}
          className="gh-avatar"
          width={88} height={88}
        />
        <div className="gh-profile-info">
          <h2 className="gh-name">{user.name ?? user.login}</h2>
          <a
            href={user.html_url}
            className="gh-login"
            target="_blank"
            rel="noopener noreferrer"
          >
            @{user.login}
          </a>
          {user.bio      && <p className="gh-bio">{user.bio}</p>}
          {user.location && (
            <p className="gh-location">
              <span aria-hidden="true">📍</span> {user.location}
            </p>
          )}
        </div>

        {/* Refresh button */}
        <button
          className="gh-refresh-btn"
          onClick={() => fetchGitHub(true)}
          disabled={refreshing}
          aria-busy={refreshing}
          aria-label="Refresh GitHub data"
        >
          <span className={`gh-refresh-icon ${refreshing ? 'spinning' : ''}`} aria-hidden="true">
            ↻
          </span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── STATS ────────────────────────── */}
      <div className="gh-stats" role="list" aria-label="GitHub statistics">
        {[
          { label: 'Public repos', value: user.public_repos },
          { label: 'Followers',    value: user.followers    },
          { label: 'Following',    value: user.following    },
        ].map(({ label, value }) => (
          <div className="gh-stat" role="listitem" key={label}>
            <span className="gh-stat-value">{value}</span>
            <span className="gh-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── REPOS ────────────────────────── */}
      <div className="gh-repos-header">
        <span className="section-label">Repositories</span>
        <h3>Recent pushes</h3>
      </div>

      <div
        className="gh-repos"
        aria-live="polite"
        aria-label="GitHub repositories"
      >
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            className="gh-repo-card"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${repo.name} — ${repo.description ?? 'No description'}`}
          >
            <div className="gh-repo-top">
              <span className="gh-repo-name">{repo.name}</span>
              {repo.language && (
                <span className="gh-lang">{repo.language}</span>
              )}
            </div>
            {repo.description && (
              <p className="gh-repo-desc">{repo.description}</p>
            )}
            <div className="gh-repo-meta">
              <span title="Stars">⭐ {repo.stargazers_count}</span>
              <span title="Forks">🍴 {repo.forks_count}</span>
              <span className="gh-repo-time">
                pushed {timeAgo(repo.pushed_at)}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Last fetched timestamp */}
      <p className="gh-timestamp" aria-live="polite">
        Data fetched at {new Date().toLocaleTimeString()}
      </p>
    </div>
  )
}
