/**
 * Lightweight, zero-dependency TOML parser specifically designed for sprints.toml schema.
 */

export interface RawTomlFile {
  schema_version: number;
  repository: string;
  default_branch: string;
  bot_login: string;
  approvers: string[];
  activation_agreements: number;
  decision?: RawDecision[];
  sprint?: RawSprint[];
}

export interface RawDecision {
  id: string;
  summary: string;
  why: string;
  blocks: string;
  safe_meanwhile: string;
}

export interface RawSprint {
  id: string;
  title: string;
  order: number;
  kind?: string;
  next?: string;
  risk_level: number;
  assignees: string[];
  objective: string;
  starting_state?: string;
  dependencies?: string;
  risk?: string;
  deliverables?: string;
  exit_gate?: string;
  effort?: string;
  blocked_by?: string[];
  acceptance_criteria?: string[];
  checks_required?: boolean;
  required_checks?: string[];
  required_prs?: number[];
  task?: RawTask[];
}

export interface RawTask {
  key: string;
  title: string;
  required?: boolean;
  issue?: number;
}

export function parseSprintsToml(content: string): RawTomlFile {
  const lines = content.split(/\r?\n/);
  const result: RawTomlFile = {
    schema_version: 0,
    repository: "",
    default_branch: "main",
    bot_login: "",
    approvers: [],
    activation_agreements: 2,
    decision: [],
    sprint: [],
  };

  let currentSection: "root" | "decision" | "sprint" | "task" = "root";
  let currentDecision: RawDecision | null = null;
  let currentSprint: RawSprint | null = null;
  let currentTask: RawTask | null = null;

  let inMultilineArray = false;
  let multilineArrayKey = "";
  let multilineArrayBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (inMultilineArray) {
      if (line.includes("]")) {
        const part = line.substring(0, line.indexOf("]"));
        if (part.trim()) {
          multilineArrayBuffer.push(part);
        }
        inMultilineArray = false;
        const fullArrayStr = `[${multilineArrayBuffer.join(" ")}]`;
        assignKeyValue(multilineArrayKey, parseTomlValue(fullArrayStr));
        multilineArrayKey = "";
        multilineArrayBuffer = [];
      } else {
        multilineArrayBuffer.push(line);
      }
      continue;
    }

    if (!line || line.startsWith("#")) {
      continue;
    }

    // Check array-of-tables header
    if (line.startsWith("[[") && line.endsWith("]]")) {
      const sectionName = line.slice(2, -2).trim();
      if (sectionName === "decision") {
        currentSection = "decision";
        currentDecision = { id: "", summary: "", why: "", blocks: "", safe_meanwhile: "" };
        result.decision!.push(currentDecision);
      } else if (sectionName === "sprint") {
        currentSection = "sprint";
        currentSprint = {
          id: "",
          title: "",
          order: 0,
          risk_level: 1,
          assignees: [],
          objective: "",
          task: [],
        };
        result.sprint!.push(currentSprint);
        currentTask = null;
      } else if (sectionName === "sprint.task") {
        currentSection = "task";
        if (!currentSprint) {
          throw new Error(`[[sprint.task]] encountered before [[sprint]] on line ${i + 1}`);
        }
        currentTask = { key: "", title: "", required: true };
        currentSprint.task!.push(currentTask);
      } else {
        throw new Error(`Unknown section [[${sectionName}]] on line ${i + 1}`);
      }
      continue;
    }

    // Check key = value
    const eqIdx = line.indexOf("=");
    if (eqIdx !== -1) {
      const key = line.substring(0, eqIdx).trim();
      const valStr = line.substring(eqIdx + 1).trim();

      if (valStr.startsWith("[") && !valStr.endsWith("]")) {
        inMultilineArray = true;
        multilineArrayKey = key;
        multilineArrayBuffer = [valStr.substring(1)];
        continue;
      }

      const val = parseTomlValue(valStr);
      assignKeyValue(key, val);
    }
  }

  function assignKeyValue(key: string, val: unknown) {
    if (currentSection === "root") {
      (result as Record<string, unknown>)[key] = val;
    } else if (currentSection === "decision" && currentDecision) {
      (currentDecision as Record<string, unknown>)[key] = val;
    } else if (currentSection === "sprint" && currentSprint) {
      (currentSprint as Record<string, unknown>)[key] = val;
    } else if (currentSection === "task" && currentTask) {
      (currentTask as Record<string, unknown>)[key] = val;
    }
  }

  return result;
}

function parseTomlValue(valStr: string): unknown {
  const trimmed = valStr.trim();

  // Boolean
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  // Number
  if (/^-?\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }

  // Quoted string
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  // Array
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    // Split by comma respecting quotes
    const items: string[] = [];
    let current = "";
    let inQuote = false;
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if (ch === '"' && (i === 0 || inner[i - 1] !== "\\")) {
        inQuote = !inQuote;
        current += ch;
      } else if (ch === "," && !inQuote) {
        if (current.trim()) items.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    if (current.trim()) items.push(current.trim());
    return items.map((it) => parseTomlValue(it));
  }

  return trimmed;
}
