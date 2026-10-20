import { execSync } from "node:child_process";

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: "OPEN" | "CLOSED";
  stateReason?: string;
  author: { login: string };
  assignees?: { login: string }[];
}

export interface GitHubComment {
  id: number;
  body: string;
  author: { login: string };
  createdAt: string;
}

export interface GitHubReaction {
  user: { login: string };
  content: string; // e.g. "+1"
}

export interface GitHubClient {
  isDryRun: boolean;
  findIssueByMarker(marker: string): Promise<GitHubIssue | null>;
  createIssue(title: string, body: string, assignees: string[], labels: string[]): Promise<number>;
  updateIssueBody(issueNumber: number, body: string): Promise<void>;
  getComments(issueNumber: number): Promise<GitHubComment[]>;
  createComment(issueNumber: number, body: string): Promise<number>;
  getCommentReactions(commentId: number): Promise<GitHubReaction[]>;
  closeIssue(issueNumber: number, reason?: string): Promise<void>;
  isPrMerged(prNumber: number): Promise<boolean>;
  getCheckRuns(commitSha: string): Promise<Record<string, string>>;
}

export class GhCliClient implements GitHubClient {
  public isDryRun = false;
  private repo: string;

  constructor(repo: string) {
    this.repo = repo;
  }

  private runGh(cmd: string, input?: string): string {
    if (cmd.startsWith("api ")) {
      return execSync(`gh ${cmd}`, { encoding: "utf-8", input }).trim();
    }
    return execSync(`gh ${cmd} -R ${this.repo}`, { encoding: "utf-8", input }).trim();
  }

  async findIssueByMarker(marker: string): Promise<GitHubIssue | null> {
    try {
      const output = this.runGh(`issue list --state all --limit 100 --json number,title,body,state,stateReason,author,assignees`);
      const issues: GitHubIssue[] = JSON.parse(output);
      return issues.find((iss) => iss.body && iss.body.includes(marker)) || null;
    } catch {
      return null;
    }
  }

  async createIssue(title: string, body: string, assignees: string[], labels: string[]): Promise<number> {
    const assigneeFlags = assignees.length > 0 ? `--assignee "${assignees.join(",")}"` : "";
    const labelFlags = labels.length > 0 ? `--label "${labels.join(",")}"` : "";
    const safeTitle = title.replace(/"/g, '\\"');
    const output = this.runGh(`issue create --title "${safeTitle}" --body-file - ${assigneeFlags} ${labelFlags}`, body);
    const match = output.match(/\/issues\/(\d+)$/);
    if (!match) throw new Error(`Could not parse issue number from: ${output}`);
    return parseInt(match[1], 10);
  }

  async updateIssueBody(issueNumber: number, body: string): Promise<void> {
    this.runGh(`issue edit ${issueNumber} --body-file -`, body);
  }

  async getComments(issueNumber: number): Promise<GitHubComment[]> {
    try {
      const output = this.runGh(`api repos/${this.repo}/issues/${issueNumber}/comments --jq ".[].id"`);
      if (!output) return [];
      const commentRaw = this.runGh(`api repos/${this.repo}/issues/${issueNumber}/comments`);
      const comments = JSON.parse(commentRaw);
      return comments.map((c: any) => ({
        id: c.id,
        body: c.body,
        author: { login: c.user?.login || "" },
        createdAt: c.created_at,
      }));
    } catch {
      return [];
    }
  }

  async createComment(issueNumber: number, body: string): Promise<number> {
    const output = this.runGh(`issue comment ${issueNumber} --body-file -`, body);
    const match = output.match(/#issuecomment-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getCommentReactions(commentId: number): Promise<GitHubReaction[]> {
    try {
      const output = this.runGh(`api repos/${this.repo}/issues/comments/${commentId}/reactions`);
      const reactions = JSON.parse(output);
      return reactions.map((r: any) => ({
        user: { login: r.user?.login || "" },
        content: r.content,
      }));
    } catch {
      return [];
    }
  }

  async closeIssue(issueNumber: number, reason: string = "completed"): Promise<void> {
    this.runGh(`issue close ${issueNumber} --reason ${reason}`);
  }

  async isPrMerged(prNumber: number): Promise<boolean> {
    try {
      const output = this.runGh(`pr view ${prNumber} --json state -q .state`);
      return output === "MERGED";
    } catch {
      return false;
    }
  }

  async getCheckRuns(commitSha: string): Promise<Record<string, string>> {
    try {
      const output = this.runGh(`api repos/${this.repo}/commits/${commitSha}/check-runs`);
      const data = JSON.parse(output);
      const results: Record<string, string> = {};
      for (const run of data.check_runs || []) {
        results[run.name] = run.conclusion || run.status;
      }
      return results;
    } catch {
      return {};
    }
  }
}

export class DryRunGitHubClient implements GitHubClient {
  public isDryRun = true;
  private issueCounter = 100;
  private commentCounter = 500;
  private issues: Map<number, GitHubIssue> = new Map();
  private comments: Map<number, GitHubComment[]> = new Map();

  async findIssueByMarker(marker: string): Promise<GitHubIssue | null> {
    console.log(`[DRY-RUN] Search issues for marker: ${marker}`);
    for (const iss of this.issues.values()) {
      if (iss.body.includes(marker)) return iss;
    }
    return null;
  }

  async createIssue(title: string, body: string, assignees: string[], labels: string[]): Promise<number> {
    const num = ++this.issueCounter;
    console.log(`[DRY-RUN] Would create Issue #${num}: "${title}" (labels: [${labels.join(", ")}], assignees: [${assignees.join(", ")}])`);
    this.issues.set(num, {
      number: num,
      title,
      body,
      state: "OPEN",
      author: { login: "github-actions[bot]" },
      assignees: assignees.map((login) => ({ login })),
    });
    return num;
  }

  async updateIssueBody(issueNumber: number, body: string): Promise<void> {
    console.log(`[DRY-RUN] Would update Issue #${issueNumber} body`);
    const iss = this.issues.get(issueNumber);
    if (iss) iss.body = body;
  }

  async getComments(issueNumber: number): Promise<GitHubComment[]> {
    return this.comments.get(issueNumber) || [];
  }

  async createComment(issueNumber: number, body: string): Promise<number> {
    const num = ++this.commentCounter;
    console.log(`[DRY-RUN] Would post comment to Issue #${issueNumber}: ${body.slice(0, 80)}...`);
    const list = this.comments.get(issueNumber) || [];
    list.push({
      id: num,
      body,
      author: { login: "github-actions[bot]" },
      createdAt: new Date().toISOString(),
    });
    this.comments.set(issueNumber, list);
    return num;
  }

  async getCommentReactions(_commentId: number): Promise<GitHubReaction[]> {
    return [];
  }

  async closeIssue(issueNumber: number, reason: string = "completed"): Promise<void> {
    console.log(`[DRY-RUN] Would close Issue #${issueNumber} with reason: ${reason}`);
    const iss = this.issues.get(issueNumber);
    if (iss) {
      iss.state = "CLOSED";
      iss.stateReason = reason;
    }
  }

  async isPrMerged(prNumber: number): Promise<boolean> {
    console.log(`[DRY-RUN] Checked PR #${prNumber} merged status -> mock true`);
    return true;
  }

  async getCheckRuns(_commitSha: string): Promise<Record<string, string>> {
    return { lint: "success", build: "success", secrets: "success" };
  }
}
