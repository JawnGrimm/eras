#!/usr/bin/env python3
"""Validate a Scribe of Eras Work definition and optionally emit GDD tables.

Usage:
    python validate_work.py storehouse_reckoning.json            # validate
    python validate_work.py storehouse_reckoning.json --tables   # also print Markdown tables

Exit code 1 if there are errors. Warnings are design smells, not failures.
"""
import argparse
import ast
import json
import math
import operator
import sys
from pathlib import Path

OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul}
CMP = {"==": operator.eq, "<=": operator.le, ">=": operator.ge}


def safe_eval(expr, names):
    """Evaluate +, -, * over integer constants and known quantity names only."""
    def ev(n):
        if isinstance(n, ast.Expression):
            return ev(n.body)
        if isinstance(n, ast.Constant) and type(n.value) is int:
            return n.value
        if isinstance(n, ast.Name):
            if n.id not in names:
                raise KeyError(f"unknown quantity '{n.id}'")
            return names[n.id]
        if isinstance(n, ast.BinOp) and type(n.op) in OPS:
            return OPS[type(n.op)](ev(n.left), ev(n.right))
        if isinstance(n, ast.UnaryOp) and isinstance(n.op, ast.USub):
            return -ev(n.operand)
        raise ValueError(f"unsupported expression: {expr}")
    return ev(ast.parse(expr, mode="eval"))


def load_schema_validator(schema_path):
    try:
        import jsonschema  # noqa: F401
    except ImportError:
        return None
    from jsonschema import Draft202012Validator
    return Draft202012Validator(json.loads(Path(schema_path).read_text()))


def action_cost(action, register):
    c = action["ap_cost"]
    return c if isinstance(c, int) else register["setup_ap"]


def register_total(d, reg, full):
    """Minimum AP for a straight-through run with this register. Returns (total, extras)."""
    base = 0
    for a in d["actions"]:
        if a["required_for_stage_completion"] or (full and a["required_for_full_adoption"]):
            base += action_cost(a, reg)
    extras = 0
    for t in d["tests"]:
        if not t["required_for_adoption"]:
            continue
        sup = next((s for s in reg["test_support"] if s["test_id"] == t["id"]), None)
        if sup:
            extras += sup.get("extra_ap") or 0
    return base + extras, extras


def check(d, schema_path):
    errors, warnings, info = [], [], []

    # 1. JSON Schema
    v = load_schema_validator(schema_path)
    if v is None:
        warnings.append("jsonschema not installed; structural schema check skipped (pip install jsonschema).")
    else:
        for e in sorted(v.iter_errors(d), key=lambda e: list(e.path)):
            loc = "/".join(str(p) for p in e.path) or "(root)"
            errors.append(f"schema: {loc}: {e.message}")
        if errors:
            return errors, warnings, info  # references below assume valid structure

    # 2. Unique ids and reference integrity
    def ids(key):
        out = [x["id"] for x in d[key]]
        dup = {i for i in out if out.count(i) > 1}
        for i in dup:
            errors.append(f"duplicate id in {key}: {i}")
        return set(out)

    roles, ev_ids, act_ids = ids("roles"), ids("evidence"), ids("actions")
    test_ids, reg_ids = ids("tests"), ids("register_designs")
    quantities = d["state"]["quantities"]

    for e in d["evidence"]:
        for f in e["facts"]:
            if f not in quantities:
                errors.append(f"evidence {e['id']}: unknown fact '{f}'")
        if "test_id" in e and e["test_id"] not in test_ids:
            errors.append(f"evidence {e['id']}: unknown test '{e['test_id']}'")

    granted = {}
    for a in d["actions"]:
        for r in a.get("roles", []):
            if r not in roles:
                errors.append(f"action {a['id']}: unknown role '{r}'")
        for p in a.get("prerequisites", []):
            if p not in act_ids:
                errors.append(f"action {a['id']}: unknown prerequisite '{p}'")
        for g in a["grants_evidence"]:
            if g not in ev_ids:
                errors.append(f"action {a['id']}: grants unknown evidence '{g}'")
            granted.setdefault(g, []).append(a["id"])
        if a.get("repeatable") and "gate" not in a:
            warnings.append(f"action {a['id']}: repeatable with no gate")
        if "test_id" in a and a["test_id"] not in test_ids:
            errors.append(f"action {a['id']}: unknown test '{a['test_id']}'")

    for e in ev_ids:
        if e not in granted:
            errors.append(f"evidence {e} is never granted by any action (player can never see it)")

    # 3. Stage completion consistency
    stage_actions = {s["id"]: s["completion"]["actions_all_of"] for s in d["stages"]}
    for s in d["stages"]:
        c = s["completion"]
        for aid in c["actions_all_of"]:
            if aid not in act_ids:
                errors.append(f"stage {s['id']}: unknown action '{aid}'")
        reachable = {g for aid in c["actions_all_of"] if aid in act_ids
                     for g in next(a for a in d["actions"] if a["id"] == aid)["grants_evidence"]}
        for eid in c.get("evidence_all_of", []):
            if eid not in reachable:
                errors.append(f"stage {s['id']}: requires evidence {eid} but no required action grants it")
    flagged = {a["id"] for a in d["actions"] if a["required_for_stage_completion"]}
    listed = {aid for acts in stage_actions.values() for aid in acts}
    for aid in sorted(flagged - listed):
        errors.append(f"action {aid} is flagged required_for_stage_completion but is in no stage's actions_all_of")
    for aid in sorted(listed - flagged):
        errors.append(f"action {aid} is in a stage's actions_all_of but not flagged required_for_stage_completion")

    # 4. State invariants
    for inv in d["invariants"]:
        if inv["kind"] != "arithmetic":
            continue
        try:
            lhs, rhs = safe_eval(inv["lhs"], quantities), safe_eval(inv["rhs"], quantities)
        except (KeyError, ValueError) as ex:
            errors.append(f"invariant {inv['id']}: {ex}")
            continue
        if not CMP[inv["op"]](lhs, rhs):
            errors.append(f"invariant {inv['id']} FAILS: {inv['lhs']} = {lhs} {inv['op']} {inv['rhs']} = {rhs}")
        else:
            info.append(f"{inv['id']} ok: {lhs} {inv['op']} {rhs}")

    # 5. Tests, outcomes, responsibility refs
    for t in d["tests"]:
        for eid in t["evidence"]:
            if eid not in ev_ids:
                errors.append(f"test {t['id']}: unknown evidence '{eid}'")
    if d["adoption"]["tests_required"] == "all":
        for t in d["tests"]:
            if not t["required_for_adoption"]:
                errors.append(f"adoption.tests_required is 'all' but test {t['id']} is not required_for_adoption")
    for o in d["outcomes"]:
        for eid in o["evidence_refs"]:
            if eid not in ev_ids:
                errors.append(f"outcome {o['id']}: unknown evidence '{eid}'")
    for q in d["responsibility_questions"]:
        for eid in q["supported_by"]:
            if eid not in ev_ids:
                errors.append(f"responsibility {q['id']}: unknown evidence '{eid}'")
        if q["answer"] != "unestablished" and q["answer"] not in roles:
            errors.append(f"responsibility {q['id']}: answer '{q['answer']}' is neither 'unestablished' nor a role")
    for r in d["register_designs"]:
        for s in r["test_support"]:
            if s["test_id"] not in test_ids:
                errors.append(f"register {r['id']}: unknown test '{s['test_id']}'")

    # 6. AP budget
    ap = d["config"]["ap_per_day"]
    for full in (False, True):
        label = "full adoption" if full else "stage completion"
        for r in d["register_designs"]:
            total, extras = register_total(d, r, full)
            days = math.ceil(total / ap)
            info.append(f"min AP to {label} with {r['label']}: {total} AP (incl. {extras} supplement) = {days} day(s), "
                        f"{days * ap - total} AP of slack")
    best_full = min(register_total(d, r, True)[0] for r in d["register_designs"])
    min_days = math.ceil(best_full / ap)
    tg = d["targets"]
    if min_days > tg["expected_days_min"]:
        errors.append(f"minimum path to full adoption needs {min_days} days but target minimum is {tg['expected_days_min']}")
    slack = min_days * ap - best_full
    if slack == 0:
        warnings.append(f"the minimum path fills {min_days} days exactly (0 AP slack); a single revision pass adds a day.")

    # 7. Design smells
    regs = d["register_designs"]
    for a_ in regs:
        for b_ in regs:
            if a_["id"] == b_["id"]:
                continue
            ta, tb = register_total(d, a_, True)[0], register_total(d, b_, True)[0]
            oa, ob = a_["ongoing_per_entry_ap"], b_["ongoing_per_entry_ap"]
            if ta <= tb and (oa is None or ob is None or oa <= ob):
                undefined = " (ongoing cost is undefined for at least one)" if oa is None or ob is None else ""
                warnings.append(f"register '{a_['id']}' is never worse than '{b_['id']}': {ta} vs {tb} AP over the required "
                                f"tests{undefined}. Give '{b_['id']}' a real advantage or '{a_['id']}' an ongoing cost, "
                                "and foreshadow the tests so the choice is fair.")
    rq = d["responsibility_questions"]
    if len(rq) >= 2 and all(q["answer"] == "unestablished" for q in rq):
        warnings.append("every responsibility question resolves to 'unestablished'; players will learn a reflex. "
                        "Add a case where the evidence supports an attribution (and penalise over-hedging).")
    for ev in d["state"]["timeline"]:
        if ev["order"] is None:
            warnings.append(f"timeline: order of '{ev['id']}' is undecided ({ev.get('notes', 'no note')})")
    unbounded = [a["id"] for a in d["actions"] if a.get("repeatable") and a.get("max_uses") is None]
    if unbounded and d["provisions"]["max_provisioned_days"] is None:
        warnings.append("provision loop: repeatable actions with no max_uses (" + ", ".join(unbounded) +
                        ") and no max_provisioned_days; a player can stall the Work for daily bread. Cap one of them.")
    proposed = [f"action {a['id']}" for a in d["actions"] if a.get("source_status") == "proposed"]
    proposed += [f"register {r['id']}/{s['test_id']} extra_ap" for r in regs for s in r["test_support"]
                 if s.get("source_status") == "proposed"]
    if proposed:
        info.append("values proposed by design review, not stated in the GDD: " + "; ".join(proposed))
    for note in d.get("reconciliation_notes", []):
        info.append("reconcile: " + note)
    return errors, warnings, info


def tables(d):
    ev_by_action = {}
    for a in d["actions"]:
        for g in a["grants_evidence"]:
            ev_by_action[g] = a
    out = ["### Evidence", "",
           "| ID | Source | What it establishes | Retrieval / action | AP |", "|---|---|---|---|---:|"]
    for e in d["evidence"]:
        a = ev_by_action.get(e["id"])
        out.append(f"| {e['id']} | {e['source']} | {e['establishes']} | {a['label'] if a else '-'} | "
                   f"{action_cost(a, d['register_designs'][0]) if a else '-'} |")
    for s in d["stages"]:
        out += ["", f"### Stage {s['id']} - {s['name']}", "",
                "| ID | Action | AP | Evidence granted | Needed to finish stage | Needed for full adoption |",
                "|---|---|---:|---|:---:|:---:|"]
        for a in d["actions"]:
            if a["stage"] != s["id"]:
                continue
            c = a["ap_cost"]
            cost = c if isinstance(c, int) else " / ".join(f"{r['setup_ap']} ({r['id']})" for r in d["register_designs"])
            out.append(f"| {a['id']} | {a['label']} | {cost} | {', '.join(a['grants_evidence']) or '-'} | "
                       f"{'yes' if a['required_for_stage_completion'] else 'no'} | "
                       f"{'yes' if a['required_for_full_adoption'] else 'no'} |")
    return "\n".join(out)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("work", help="Work definition JSON")
    p.add_argument("--schema", default=str(Path(__file__).with_name("work_schema.json")))
    p.add_argument("--tables", action="store_true", help="print Markdown tables for the GDD")
    args = p.parse_args()

    data = json.loads(Path(args.work).read_text())
    errors, warnings, info = check(data, args.schema)

    for title, rows in (("ERRORS", errors), ("WARNINGS", warnings), ("INFO", info)):
        if rows:
            print(f"\n{title} ({len(rows)})")
            for r in rows:
                print(f"  - {r}")
    if args.tables and not errors:
        print("\n" + tables(data))
    print("\nRESULT:", "FAIL" if errors else "PASS", f"({len(errors)} errors, {len(warnings)} warnings)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
