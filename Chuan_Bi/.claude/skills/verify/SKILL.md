---
name: verify
description: "Quality assurance and testing skill for Chi_Phi_Sinh_Hoat. Audits boundary contracts, verifies financial computation accuracy, executes unit tests, and verifies safety compliance. Use when asked to 'verify expenses code', 'run financial tests', 'audit calculations', or 'validate living expense tracking'."
---

# Expense Tracker Verification Skill

This skill guides QA auditing, calculation verification, and boundary compliance checks for living expense tracking applications (`Chi_Phi_Sinh_Hoat`).

## Verification Protocol

### 1. Boundary & Contract Verification
- Co-read `_workspace/01_analysis_requirements.md` and `_workspace/02_build_manifest.md`.
- Pairwise audit:
  - Do model property names match schema fields exactly?
  - Does the storage layer serialize and deserialize all required fields without dropping data?
  - Are date formats strictly validated against ISO 8601 strings?

### 2. Financial Calculation Integrity
Execute and check:
- **Summation Accuracy**: `sum(items)` matches expected totals across multiple currency amounts without floating-point drift.
- **Category Filter Accuracy**: Filtered sums include all matching entries and exclude others.
- **Budget Alerts**: Spending strictly exceeding budget returns accurate over-budget warnings; exact budget matches do not falsely trigger alerts.
- **Edge Cases**:
  - Empty expense lists return 0 total and empty summaries gracefully.
  - Zero-amount items handled without divide-by-zero errors in percentage calculations.
  - Leap day (`2024-02-29`) and year-end boundary transitions.

### 3. Safety Compliance Audit
- Audit modified files against [Rule_Project.md](file:///e:/HocCode/Python/Learn%20code%20c%C6%A1%20b%E1%BA%A3n%20n%C3%A2ng%20cao/Chi_Phi_Sinh_Hoat/Rule_Project.md):
  - Ensure zero files or folders were deleted or marked for removal.
  - Confirm user data files are intact.

### 4. Test Suite Execution
Run tests using Python's built-in `unittest` runner:
```powershell
python -m unittest discover -s tests -p "test_*.py"
```

### 5. Verdict Deliverable
Write findings to `_workspace/03_qa_report.md`:
```markdown
# QA Verification Report
- **Overall Verdict**: PASS | FIX_REQUIRED | BLOCKED
- **Test Suite Results**: Total passed, failed, errors
- **Calculation Verification**: Verified test scenarios
- **Safety Compliance**: Adherence to Rule_Project.md verified
- **Defects Identified**: Exact file:line and required fix (if any)
```
