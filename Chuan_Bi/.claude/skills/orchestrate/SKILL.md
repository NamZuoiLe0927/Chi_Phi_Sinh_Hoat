---
name: orchestrate
description: "Coordinates the end-to-end development and maintenance of the Chi_Phi_Sinh_Hoat (Living Expenses Tracker) application. Invoked when user requests to 'build expense tracker', 'tinh chi phi sinh hoat', 'quan ly chi tieu', 'organize expenses', as well as follow-up operations like 'update expense feature', 'rerun financial tests', 'fix expense logic', or 'improve expense calculations'."
---

# Chi_Phi_Sinh_Hoat Orchestrator

## Execution Mode: Pipeline Collaboration (Analyst → Builder → QA)

This orchestrator coordinates the specialist agent team to analyze, implement, and verify living expense tracking features for Python projects.

## Team Composition

| Role | `agentType` / Name | Skill | Deliverable |
|---|---|---|---|
| Domain Analyst | `analyst` | `analyze` | `_workspace/01_analysis_requirements.md` |
| Software Engineer | `builder` | `build` | `_workspace/02_build_manifest.md` + source code |
| QA Verifier | `qa` | `verify` | `_workspace/03_qa_report.md` |

## Operational Workflow

### Step 0: Context Verification (Handling Follow-up Requests)
1. Inspect `_workspace/`:
   - If absent: Initialize directory fresh from scratch.
   - If present and user requests revisions: Re-run only the affected agent phase.
   - If present but user supplies an entirely new task: Archive current `_workspace/` to `_workspace_{ts}/` and initialize fresh.

### Step 1: Scope Initialization
1. Identify the user's specific living expense tracking objective (e.g., adding monthly budgets, daily expense logging, category analytics, export to CSV).
2. Ensure working directory conforms to [Rule_Project.md](file:///e:/HocCode/Python/Learn%20code%20c%C6%A1%20b%E1%BA%A3n%20n%C3%A2ng%20cao/Chi_Phi_Sinh_Hoat/Rule_Project.md) with strict non-destructive constraints.

### Step 2: Requirements Analysis (`analyst`)
1. Invoke `analyst` with task requirements and existing project context.
2. The `analyst` models domain schemas, calculations, and constraints.
3. Deliverable: `_workspace/01_analysis_requirements.md`.

### Step 3: Implementation (`builder`)
1. Ingest requirements from `_workspace/01_analysis_requirements.md`.
2. The `builder` writes or refines Python code under `src/` and test scaffolding under `tests/`.
3. Adhere to non-destructive modification policies (use `Edit` tool; never delete existing files).
4. Deliverable: `_workspace/02_build_manifest.md`.

### Step 4: Verification & Audit (`qa`)
1. Co-read `_workspace/01_analysis_requirements.md` and `_workspace/02_build_manifest.md`.
2. The `qa` agent validates financial calculation accuracy, audits boundary interfaces, and runs test suites.
3. If defects or regressions are discovered:
   - Issue precise fix request to `builder` (`file:line` + concrete fix).
   - Re-run verification until `PASS` verdict is achieved (max 2 iterations).
4. Deliverable: `_workspace/03_qa_report.md`.

### Step 5: Deliverable Finalization
1. Synthesize final changes and deliver summary report to the user.
2. Retain `_workspace/` for historical provenance and audit tracking.

## Error Handling

| Scenario | Remediation Protocol |
|---|---|
| Incomplete requirements | `analyst` records open questions in specification under `Unresolved Questions` and requests clarification. |
| Code build / syntax error | `qa` captures exact traceback and directs `builder` to perform surgical edits. |
| Accidental deletion risk | Intercept immediately per `Rule_Project.md`; reject command and switch to non-destructive approach. |
| Unresolved test failures | After 2 retries, document failing edge case in `_workspace/03_qa_report.md` and escalate to user. |

## Test Scenarios

### Happy Path
1. User requests adding a monthly budget limit feature.
2. `analyst` defines `Budget` entity and variance formula in `01_analysis_requirements.md`.
3. `builder` implements model and budget checker logic in `src/models/budget.py` and `src/services/expense_service.py`.
4. `qa` executes unit tests verifying variance calculations and passes with `PASS`.
5. Expected outcome: Functional budget feature with passing tests and audit trail preserved.

### Failure Path
1. `builder` introduces an integer division bug causing percentage calculations to truncate.
2. `qa` detects calculation divergence during boundary test execution.
3. `qa` reports defect: `src/services/expense_service.py:line 45: replace // with /`.
4. `builder` applies surgical fix; `qa` re-tests and confirms `PASS`.
