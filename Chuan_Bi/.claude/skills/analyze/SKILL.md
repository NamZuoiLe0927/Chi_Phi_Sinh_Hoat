---
name: analyze
description: "Requirement analysis skill for living expenses and personal budget management. Designs expense schemas, category taxonomies, budget thresholds, and analytical reports. Use when asked to 'analyze requirements', 'plan expense categories', 'design budget models', or 'scope financial features' for Chi_Phi_Sinh_Hoat."
---

# Expense Tracker Analysis Skill

This skill defines the standard procedure for analyzing requirements, modeling financial data, and producing technical specifications for living expense tracking applications (`Chi_Phi_Sinh_Hoat`).

## Workflow

### 1. Requirements Scoping
1. Determine the scope of expense tracking:
   - Personal daily living expenses (food, rent, utilities, transport).
   - Periodic recurring expenses (monthly subscriptions, loan repayments, insurance).
   - Budgets & targets (monthly spending limits per category, savings goals).
   - Reporting needs (daily breakdown, monthly aggregation, category distribution).
2. Clarify input and output interfaces:
   - CLI commands, interactive console, or web/GUI interface.
   - Storage format: SQLite database or structured JSON/CSV files.

### 2. Domain Data Modeling
Define clear entity relationships and schemas:

```markdown
### Entity: ExpenseItem
- `id`: unique string/integer identifier
- `date`: ISO 8601 formatted date string (`YYYY-MM-DD`)
- `amount`: non-negative numeric value (VND / currency unit)
- `category`: standardized taxonomy enum (e.g., Food, Housing, Utilities, Transportation, Entertainment, Health, Education, Other)
- `description`: descriptive note detailing the expenditure
- `payment_method`: Cash, Bank Transfer, Credit Card, E-Wallet
- `created_at`: timestamp of record creation
```

### 3. Financial Calculation Rules
- **Aggregation**: Total spending = Sum of all valid `amount` entries within target date range `[start_date, end_date]`.
- **Category Ratio**: `(Category Total / Total Spending) * 100%`.
- **Budget Variance**: `Budget Limit - Actual Spending` (flag if negative / over budget).

### 4. Output Deliverable
Persist the completed specification to:
`_workspace/01_analysis_requirements.md`

Include:
- Functional Requirements list
- Data Schema & Constraints
- Acceptance Criteria for verification
