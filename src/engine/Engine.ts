/**
 * Scribe of Eras - Generalized Engine (src/engine/Engine.ts)
 * Covers Calendar, Invariant Evaluation, Provisions, and Versioned Save.
 */

export interface WorkDefinition {
  schema_version: string;
  work_id: string;
  title: string;
  era: string;
  gdd_version: string;
  config: {
    blocks_per_day: number;
    costs_shown_before_commit: boolean;
    hidden_costs_allowed: boolean;
  };
  roles: Array<{ id: string; name: string; interest: string; required_interaction: string }>;
  state: {
    quantities: Record<string, number>;
  };
  evidence: Array<{
    id: string;
    source: string;
    reliability: string;
    visible_in_stage: string;
    establishes: string;
    facts: string[];
    limits?: string;
    block_cost: number;
  }>;
  actions: Array<{
    id: string;
    stage: string;
    label: string;
    block_cost: number;
    roles?: string[];
    grants_evidence: string[];
    prerequisites?: string[];
    required_for_stage_completion: boolean;
  }>;
  stages: Array<{
    id: string;
    name: string;
    objective: string;
    deliverable: string;
    completion: {
      evidence_all_of?: string[];
      actions_all_of: string[];
    };
  }>;
  design_choices: Array<{
    id: string;
    label: string;
    time_cost: number;
    strength: string;
    limitation: string;
    handles_cases: string[];
  }>;
  cases: Array<{
    id: string;
    label: string;
    capability: string;
    evidence: string[];
    expected: Record<string, unknown>;
  }>;
  invariants: Array<{
    id: string;
    kind: string;
    lhs: string;
    op: string;
    rhs: string;
  }>;
  deliverable: {
    title: string;
    provenance_rules: string[];
  };
}

/**
 * Calendar & Time Blocks Engine
 */
export function getBlockName(block: number): string {
  switch (block) {
    case 1: return 'Morning (1/4)';
    case 2: return 'Midday (2/4)';
    case 3: return 'Afternoon (3/4)';
    case 4: return 'Evening (4/4)';
    default: return 'Night';
  }
}

/**
 * Safe Expression Evaluator for Invariants
 */
type Token =
  | { type: 'num'; value: number }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '%' }
  | { type: 'paren'; value: '(' | ')' };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%') {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        numStr += expr[i++];
      }
      const value = Number(numStr);
      if (!Number.isFinite(value)) throw new Error(`Invalid number: ${numStr}`);
      tokens.push({ type: 'num', value });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let ident = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        ident += expr[i++];
      }
      tokens.push({ type: 'ident', value: ident });
      continue;
    }
    throw new Error(`Unexpected character in expression: "${ch}"`);
  }
  return tokens;
}

function evalArithmetic(expr: string, quantities: Record<string, number>): number {
  const tokens = tokenize(expr);
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];
  const consume = (): Token => tokens[pos++];

  function parseExpression(): number {
    let left = parseTerm();
    while (true) {
      const t = peek();
      if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
        consume();
        const right = parseTerm();
        left = t.value === '+' ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseUnary();
    while (true) {
      const t = peek();
      if (t?.type === 'op' && (t.value === '*' || t.value === '/' || t.value === '%')) {
        consume();
        const right = parseUnary();
        if ((t.value === '/' || t.value === '%') && right === 0) {
          throw new Error('Division or modulo by zero');
        }
        left = t.value === '*' ? left * right : t.value === '/' ? left / right : left % right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseUnary(): number {
    const t = peek();
    if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
      consume();
      const val = parseUnary();
      return t.value === '-' ? -val : val;
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const t = consume();
    if (!t) throw new Error('Unexpected end of expression');
    if (t.type === 'num') return t.value;
    if (t.type === 'ident') {
      if (!Object.prototype.hasOwnProperty.call(quantities, t.value)) {
        throw new Error(`Unknown quantity: ${t.value}`);
      }
      const val = quantities[t.value];
      if (!Number.isFinite(val)) {
        throw new Error(`Non-finite quantity value for: ${t.value}`);
      }
      return val;
    }
    if (t.type === 'paren' && t.value === '(') {
      const val = parseExpression();
      const close = consume();
      if (close?.type !== 'paren' || close.value !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      return val;
    }
    throw new Error('Unexpected token in expression');
  }

  const result = parseExpression();
  if (pos < tokens.length) {
    throw new Error('Unexpected trailing tokens in expression');
  }
  return result;
}

export function evaluateInvariant(
  lhsExpr: string,
  op: string,
  rhsExpr: string,
  quantities: Record<string, number>,
): boolean {
  try {
    const evaluatedLhs = evalArithmetic(lhsExpr, quantities);
    const evaluatedRhs = evalArithmetic(rhsExpr, quantities);

    switch (op) {
      case '==': return evaluatedLhs === evaluatedRhs;
      case '<=': return evaluatedLhs <= evaluatedRhs;
      case '>=': return evaluatedLhs >= evaluatedRhs;
      default:
        console.warn(`Unsupported invariant operator: ${op}`);
        return false;
    }
  } catch (err) {
    console.error('Invariant evaluation error:', err);
    return false;
  }
}

/**
 * Provisions (Bread Contract)
 */
export function calculateProvision(workActive: boolean, workApSpentToday: number): { breadChange: number; provision: number; sustenance: number; note: string } {
  const sustenance = 1;
  const provision = workActive && workApSpentToday >= 1 ? 1 : 0;
  return {
    breadChange: provision - sustenance,
    provision,
    sustenance,
    note: `Sustenance: -${sustenance} bread · Work provision: +${provision} bread`,
  };
}

/**
 * Versioned Save with Guarded Storage
 */
const SAVE_VERSION = '1.1';

export function saveGameState<T>(key: string, data: T): boolean {
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage is unavailable; save skipped.');
    return false;
  }
  try {
    const envelope = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch (err) {
    console.error('Failed to save game state:', err);
    return false;
  }
}

export function loadGameState<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn('Malformed save; ignoring it.');
      return null;
    }
    if ('version' in parsed && 'data' in parsed) {
      const version = (parsed as { version: unknown }).version;
      if (version !== SAVE_VERSION && version !== '1.0') {
        console.warn(`Unsupported save version: ${String(version)}`);
        return null;
      }
      return (parsed as { data: T }).data;
    }
    // Accept the prototype's original unwrapped JSON saves so existing progress survives migration.
    return parsed as T;
  } catch (err) {
    console.error('Failed to parse save envelope:', err);
    return null;
  }
}
