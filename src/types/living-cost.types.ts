export type ISODateString = string;
export type ISODateTimeString = string;
export type VndAmount = number;
export type Percentage = number;
export type CurrencyCode = "VND";

export type CityTier = "HANOI_HCM" | "DA_NANG_CAN_THO" | "PROVINCE";

export type Lifestyle = "FRUGAL" | "BALANCED" | "COMFORT";

export type BudgetRule = "RULE_50_30_20" | "RULE_60_20_20" | "CUSTOM";

export type CategoryGroupCode = "NEEDS" | "WANTS" | "SAVINGS_DEBT";

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "E_WALLET";

export type RunwayStatus = "DANGER" | "WARNING" | "SAFE";

export type OptimizationStrategy =
  | "WANTS_FIRST"
  | "LOWEST_PRIORITY_FIRST"
  | "PROPORTIONAL"
  | "CUSTOM";

export type LifeEventType =
  | "INSTALLMENT_PURCHASE"
  | "UPGRADE_HOME"
  | "PET"
  | "RAISE_SALARY"
  | "NEW_BABY"
  | "CUSTOM";

export type AnalysisTabId = "SPENDING" | "HISTORY" | "SIMULATOR";

export type ViewMode = "MONEY" | "WORK_TIME";

export type DashboardViewId = "SETUP" | "HEALTH" | "ANALYSIS" | "LEDGER";

export type CalendarDayStatus = "NO_SPEND" | "WITHIN_BUDGET" | "OVER_BUDGET" | "FUTURE";

export type ExportFormat = "JSON" | "EXCEL" | "PDF";

export type LivingCostPresetId =
  | "STUDENT"
  | "SINGLE_PROFESSIONAL"
  | "SMALL_FAMILY"
  | "CUSTOM";

export type BudgetHealthStatus = "HEALTHY" | "WARNING" | "CRITICAL";

export type FinancialHealthGrade = "EXCELLENT" | "GOOD" | "FAIR" | "RISKY" | "CRITICAL";

export type TransactionSource = "MANUAL" | "SMART_PARSER" | "IMPORT" | "DEMO";

export type PaymentSource = "CASH" | "SAVINGS";

export type DailyExpenseCategoryCode =
  | "FOOD"
  | "TRANSPORT"
  | "BILLS"
  | "SHOPPING"
  | "ENTERTAINMENT"
  | "OTHER";

export type MonthlyLedgerMode = "AUTO" | "MANUAL";

export type MonthKey = string;

export type SortDirection = "asc" | "desc";

export interface DateRange {
  startDate: ISODateString;
  endDate: ISODateString;
}

export interface MoneyRange {
  min: VndAmount;
  max: VndAmount;
}

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description: string | null;
  icon: string | null;
  disabled: boolean;
}

export interface Profile {
  id: string;
  name: string;
  monthlyIncome: VndAmount;
  extraIncome: VndAmount;
  cityTier: CityTier;
  lifestyle: Lifestyle;
  dependents: number;
  budgetRule: BudgetRule;
  savingsGoalAmount: VndAmount;
  inflationRate: Percentage;
  workHoursPerDay: number;
  workDaysPerMonth: number;
  commuteHoursPerDay: number;
  currentSavings: VndAmount;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface CategoryGroup {
  id: string;
  code: CategoryGroupCode;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  sortOrder: number;
}

export interface ExpenseItem {
  id: string;
  profileId: string;
  name: string;
  group: CategoryGroupCode;
  icon: string;
  color: string;
  frequency: Frequency;
  unitPrice: VndAmount;
  quantityPerPeriod: number;
  isFixed: boolean;
  isEnabled: boolean;
  priority: number;
  note: string | null;
  sortOrder: number;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface DailyTransaction {
  id: string;
  profileId: string;
  expenseItemId: string | null;
  title: string;
  amount: VndAmount;
  date: ISODateString;
  paymentMethod: PaymentMethod;
  paymentSource: PaymentSource;
  categoryCode: DailyExpenseCategoryCode;
  note: string | null;
  source: TransactionSource;
  createdAt: ISODateTimeString;
}

/**
 * Stored monthly ledger row. AUTO months derive `totalSpent/netBalance` live
 * from daily transactions; MANUAL months store a signed override so the user
 * can type an exact +/− amount with a reason.
 */
export interface MonthlyRecord {
  id: string;
  month: MonthKey;
  year: number;
  monthIndex: number;
  income: VndAmount;
  manualNetBalance: VndAmount | null;
  note: string;
  mode: MonthlyLedgerMode;
  isSettled: boolean;
  updatedAt: ISODateTimeString;
}

export type MonthlyRecordPatch = Partial<
  Pick<
    MonthlyRecord,
    "income" | "manualNetBalance" | "note" | "mode" | "isSettled"
  >
>;

export interface MonthlyRecordResolved extends MonthlyRecord {
  totalSpent: VndAmount;
  netBalance: VndAmount;
  contributedNet: VndAmount;
  cumulativeVault: VndAmount;
}

export interface MonthlyLedgerSummary {
  year: number;
  initialFund: VndAmount;
  records: MonthlyRecordResolved[];
  totalDelta: VndAmount;
  currentVault: VndAmount;
  positiveMonths: number;
  negativeMonths: number;
  settledMonths: number;
}

export type ProfileDraft = Omit<Profile, "id" | "createdAt" | "updatedAt">;

export type ExpenseItemDraft = Omit<
  ExpenseItem,
  "id" | "profileId" | "createdAt" | "updatedAt"
>;

export type DailyTransactionDraft = Omit<
  DailyTransaction,
  "id" | "profileId" | "createdAt"
>;

export interface WorkTimeConversion {
  hours: number;
  minutes: number;
  totalMinutes: number;
  formatted: string;
}

export interface ExpenseItemComputed extends ExpenseItem {
  normalizedMonthlyCost: VndAmount;
  normalizedDailyCost: VndAmount;
  normalizedYearlyCost: VndAmount;
  groupName: string;
  groupColor: string;
  groupIcon: string;
  percentageOfIncome: Percentage;
  percentageOfTotalExpense: Percentage;
  workTime: WorkTimeConversion | null;
}

export interface CategoryGroupSummary {
  groupCode: CategoryGroupCode;
  groupName: string;
  description: string | null;
  color: string;
  icon: string;
  sortOrder: number;
  monthlyTotal: VndAmount;
  dailyTotal: VndAmount;
  yearlyTotal: VndAmount;
  percentageOfIncome: Percentage;
  percentageOfTotalExpense: Percentage;
  itemCount: number;
  enabledItemCount: number;
  items: ExpenseItemComputed[];
}

export interface MonthlyBreakdown {
  needs: VndAmount;
  wants: VndAmount;
  savingsDebt: VndAmount;
  total: VndAmount;
}

export interface BudgetRuleTarget {
  needs: Percentage;
  wants: Percentage;
  savingsDebt: Percentage;
}

export interface BudgetRuleDefinition {
  code: BudgetRule;
  label: string;
  description: string;
  target: BudgetRuleTarget;
  recommendedFor: Lifestyle[];
}

export interface BudgetRuleAnalysis {
  monthlyIncome: VndAmount;
  actual: MonthlyBreakdown;
  targetAmounts: MonthlyBreakdown;
  targetPercentages: BudgetRuleTarget;
  actualPercentages: BudgetRuleTarget;
  variance: MonthlyBreakdown;
  isNeedsOver: boolean;
  isWantsOver: boolean;
  isSavingsUnder: boolean;
  isOverBudget: boolean;
  remainingAmount: VndAmount;
  remainingDays: number;
  safeToSpendPerDay: VndAmount;
  status: BudgetHealthStatus;
}

export interface DailySafeToSpend {
  remainingBudget: VndAmount;
  remainingDays: number;
  amountPerDay: VndAmount;
  spentToday: VndAmount;
  remainingToday: VndAmount;
  status: "ON_TRACK" | "OVER_SPENT" | "NO_SPEND";
}

export interface FinancialHealthSnapshot {
  monthlyIncome: VndAmount;
  totalPlannedExpense: VndAmount;
  netCashflow: VndAmount;
  savingsRate: Percentage;
  dailyBurnRate: VndAmount;
  budgetRuleAnalysis: BudgetRuleAnalysis;
  safeToSpend: DailySafeToSpend;
  runway: RunwayResult;
  healthScore: number;
  healthGrade: FinancialHealthGrade;
}

export interface ElectricityTierDefinition {
  tier: number;
  label: string;
  fromKwh: number;
  toKwh: number | null;
  unitPrice: VndAmount;
}

export interface ElectricityTierUsage {
  tier: number;
  label: string;
  fromKwh: number;
  toKwh: number | null;
  kwh: number;
  unitPrice: VndAmount;
  subtotal: VndAmount;
}

export interface ElectricityBillInput {
  kwh: number;
  vatRate: Percentage;
  tiers: ElectricityTierDefinition[];
}

export interface ElectricityBillResult {
  kwh: number;
  tiers: ElectricityTierUsage[];
  subtotal: VndAmount;
  vatRate: Percentage;
  vatAmount: VndAmount;
  total: VndAmount;
  averagePricePerKwh: VndAmount;
}

export interface LatteFactorInput {
  itemName: string;
  monthlySaving: VndAmount;
  annualInterestRate: Percentage;
  projectionYears: number[];
}

export interface LatteFactorProjection {
  year: number;
  months: number;
  monthlyRate: Percentage;
  totalContributed: VndAmount;
  futureValue: VndAmount;
  interestEarned: VndAmount;
}

export interface LatteFactorResult {
  input: LatteFactorInput;
  projections: LatteFactorProjection[];
  oneYear: VndAmount;
  fiveYears: VndAmount;
  tenYears: VndAmount;
}

export interface SavingsProjectionPoint {
  year: number;
  contributed: VndAmount;
  interest: VndAmount;
  balance: VndAmount;
}

export interface CompoundInterestInput {
  monthlyContribution: VndAmount;
  annualInterestRate: Percentage;
  years: number;
  initialAmount: VndAmount;
}

export interface CompoundInterestResult {
  input: CompoundInterestInput;
  projection: SavingsProjectionPoint[];
  finalBalance: VndAmount;
  totalContributed: VndAmount;
  totalInterest: VndAmount;
}

export interface OptimizationOptions {
  targetMonthlyExpense: VndAmount;
  strategy: OptimizationStrategy;
  prioritizeGroups: CategoryGroupCode[];
  minPriority: number;
  maxReductionRate: Percentage;
  preserveFixedItems: boolean;
  preserveSavingsItems: boolean;
}

export interface OptimizationSuggestion {
  expenseItemId: string;
  name: string;
  groupCode: CategoryGroupCode;
  groupName: string;
  priority: number;
  frequency: Frequency;
  currentQuantity: number;
  suggestedQuantity: number;
  currentMonthlyCost: VndAmount;
  suggestedMonthlyCost: VndAmount;
  monthlySavings: VndAmount;
  reductionRate: Percentage;
}

export interface OptimizationResult {
  targetMonthlyExpense: VndAmount;
  currentMonthlyExpense: VndAmount;
  achievedMonthlyExpense: VndAmount;
  totalMonthlySavings: VndAmount;
  isTargetAchieved: boolean;
  strategy: OptimizationStrategy;
  suggestions: OptimizationSuggestion[];
  skippedItemIds: string[];
}

export interface OptimizationAppliedChange {
  expenseItemId: string;
  name: string;
  previousQuantity: number;
  nextQuantity: number;
  previousMonthlyCost: VndAmount;
  nextMonthlyCost: VndAmount;
  monthlySavings: VndAmount;
}

export interface WorkTimeProfile {
  workHoursPerDay: number;
  workDaysPerMonth: number;
  commuteHoursPerDay: number;
}

export interface RealHourlyWageInput extends WorkTimeProfile {
  monthlyIncome: VndAmount;
  workRelatedExpenses: VndAmount;
}

export interface RealHourlyWageResult {
  monthlyIncome: VndAmount;
  workRelatedExpenses: VndAmount;
  netIncome: VndAmount;
  dailyWorkHours: number;
  monthlyWorkHours: number;
  realHourlyWage: VndAmount;
}

export interface RunwayInput {
  currentSavings: VndAmount;
  monthlyExpense: VndAmount;
  survivalMonthlyExpense: VndAmount;
}

export interface RunwayScenario {
  monthlyCost: VndAmount;
  months: number;
  days: number;
  totalDays: number;
}

export interface RunwayResult {
  currentSavings: VndAmount;
  standard: RunwayScenario;
  survival: RunwayScenario;
  status: RunwayStatus;
  safeMonthsThreshold: number;
  warningMonthsThreshold: number;
}

export interface LifeEventPreset {
  id: string;
  type: LifeEventType;
  label: string;
  description: string;
  icon: string;
  monthlyIncomeDelta: VndAmount;
  monthlyExpenseDelta: VndAmount;
  durationMonths: number | null;
  lifestyleCreepRate: Percentage;
  isCustom: boolean;
}

export interface LifeEventSelection {
  presetId: string;
  enabled: boolean;
  monthlyIncomeDelta: VndAmount | null;
  monthlyExpenseDelta: VndAmount | null;
  durationMonths: number | null;
}

export interface CustomLifeEvent {
  id: string;
  label: string;
  monthlyIncomeDelta: VndAmount;
  monthlyExpenseDelta: VndAmount;
  durationMonths: number | null;
}

export interface SimulationAdjustment {
  incomeDelta: VndAmount;
  expenseDelta: VndAmount;
  savingsDelta: VndAmount;
  lifestyleCreepAmount: VndAmount;
  appliedEventIds: string[];
}

export interface SimulationSnapshot {
  monthlyIncome: VndAmount;
  monthlyExpense: VndAmount;
  monthlySavings: VndAmount;
  netCashflow: VndAmount;
  savingsRate: Percentage;
}

export interface SimulationComparisonPoint {
  year: number;
  baseline: VndAmount;
  simulated: VndAmount;
}

export interface WhatIfSimulationResult {
  baseline: SimulationSnapshot;
  simulated: SimulationSnapshot;
  adjustment: SimulationAdjustment;
  yearlyProjection: SimulationComparisonPoint[];
}

export interface SimulationApplyPayload {
  incomeDelta: VndAmount;
  expenseItemChanges: Array<{
    expenseItemId: string;
    quantityPerPeriod: number;
  }>;
  temporaryMonthlyExpenseDelta: VndAmount;
  newExpenseItems?: ExpenseItemDraft[];
}

export interface ParsedAmount {
  raw: string;
  value: VndAmount;
  multiplier: number;
  divisor: number;
}

export interface ParsedTransactionDraft {
  id: string;
  title: string;
  amount: VndAmount;
  category: string;
  groupCode: CategoryGroupCode;
  rawText: string;
  confidence: Percentage;
  matchedKeyword: string | null;
  paymentMethod: PaymentMethod;
}

export interface TextParserOptions {
  defaultPaymentMethod: PaymentMethod;
  defaultGroupCode: CategoryGroupCode;
  maxItems: number;
  locale: "vi-VN";
}

export interface TextParserResult {
  rawInput: string;
  drafts: ParsedTransactionDraft[];
  unparsedSegments: string[];
  totalAmount: VndAmount;
}

export interface CategoryKeywordRule {
  groupCode: CategoryGroupCode;
  category: string;
  keywords: string[];
  icon: string;
  color: string;
}

export interface CalendarDay {
  date: ISODateString;
  dayOfMonth: number;
  totalSpent: VndAmount;
  transactionCount: number;
  safeToSpend: VndAmount;
  status: CalendarDayStatus;
  intensity: number;
  isToday: boolean;
  isWeekend: boolean;
}

export interface SavingStreak {
  current: number;
  longest: number;
  lastSafeDate: ISODateString | null;
}

export interface CalendarHeatmapSummary {
  month: number;
  year: number;
  days: CalendarDay[];
  noSpendDays: number;
  withinBudgetDays: number;
  overBudgetDays: number;
  totalSpent: VndAmount;
  averagePerDay: VndAmount;
  savingStreak: SavingStreak;
}

export interface BackupMetadata {
  version: number;
  schemaVersion: number;
  appVersion: string;
  exportedAt: ISODateTimeString;
  currency: CurrencyCode;
}

export interface BackupPayload {
  metadata: BackupMetadata;
  profile: Profile;
  categoryGroups: CategoryGroup[];
  expenseItems: ExpenseItem[];
  transactions: DailyTransaction[];
  initialSavingsFund?: VndAmount;
  monthlyRecords?: MonthlyRecord[];
}

export interface ValidationIssue {
  path: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data: T | null;
  issues: ValidationIssue[];
}

export interface ImportResult {
  success: boolean;
  importedProfile: boolean;
  importedExpenseItems: number;
  importedTransactions: number;
  importedMonthlyRecords: number;
  issues: ValidationIssue[];
}

export interface ExportOptions {
  format: ExportFormat;
  includeTransactions: boolean;
  includePlannedBudget: boolean;
  includeCharts: boolean;
  dateRange: DateRange;
  fileName: string;
}

export interface CategoryDistributionDatum {
  name: string;
  value: VndAmount;
  percentage: Percentage;
  color: string;
  groupCode: CategoryGroupCode;
}

export interface BudgetRuleComparisonDatum {
  groupCode: CategoryGroupCode;
  label: string;
  color: string;
  actualPercentage: Percentage;
  targetPercentage: Percentage;
  actualAmount: VndAmount;
  targetAmount: VndAmount;
  isOver: boolean;
}

export interface SavingsProjectionDatum {
  year: number;
  contributed: VndAmount;
  balance: VndAmount;
  interest: VndAmount;
  simulatedBalance: VndAmount | null;
}

export interface CashflowDatum {
  month: ISODateString;
  income: VndAmount;
  expense: VndAmount;
  savings: VndAmount;
  net: VndAmount;
}

export interface DualLineDatum {
  year: number;
  baseline: VndAmount;
  simulated: VndAmount;
}

export interface SankeyNodeDatum {
  id: string;
  label: string;
  color: string;
  amount: VndAmount;
}

export interface SankeyLinkDatum {
  source: string;
  target: string;
  value: VndAmount;
}

export interface SankeyData {
  nodes: SankeyNodeDatum[];
  links: SankeyLinkDatum[];
}

export interface SunburstNodeDatum {
  name: string;
  value: VndAmount;
  color: string;
  children: SunburstNodeDatum[];
}

export interface HeatmapCellDatum {
  date: ISODateString;
  value: VndAmount;
  status: CalendarDayStatus;
  intensity: number;
}

export interface FilterState {
  groupCodes: CategoryGroupCode[];
  frequencies: Frequency[];
  enabledOnly: boolean;
  searchQuery: string;
  dateRange: DateRange | null;
}

export interface SortState {
  field: "name" | "amount" | "priority" | "group" | "frequency";
  direction: SortDirection;
}

export interface UIState {
  activeView: DashboardViewId;
  activeTab: AnalysisTabId;
  viewMode: ViewMode;
  isCommandPaletteOpen: boolean;
  isOptimizationOpen: boolean;
  isWhatIfOpen: boolean;
  isDataManagerOpen: boolean;
  selectedExpenseItemId: string | null;
  filters: FilterState;
  sort: SortState;
}

export interface QuickSetupInput {
  monthlyIncome: VndAmount;
  savingsGoalPercentage: Percentage;
  presetId: LivingCostPresetId;
}

export interface LivingCostPreset {
  id: LivingCostPresetId;
  label: string;
  description: string;
  icon: string;
  incomeRange: MoneyRange;
  expenseMultiplier: number;
  recommendedSavingsRate: Percentage;
}

export interface LivingCostState {
  profile: Profile;
  categoryGroups: CategoryGroup[];
  expenseItems: ExpenseItem[];
  transactions: DailyTransaction[];
  initialSavingsFund: VndAmount;
  monthlyRecords: MonthlyRecord[];
  ui: UIState;
  simulation: WhatIfSimulationResult | null;
  simulationExpenseDelta: VndAmount;
  lastOptimization: OptimizationResult | null;
  lastOptimizationChanges: OptimizationAppliedChange[];
  hydrated: boolean;
  updatedAt: ISODateTimeString;
}

export interface LivingCostActions {
  updateProfile: (patch: Partial<ProfileDraft>) => void;
  applyQuickSetup: (input: QuickSetupInput) => void;
  addExpenseItem: (input: ExpenseItemDraft) => ExpenseItem;
  updateExpenseItem: (id: string, patch: Partial<ExpenseItemDraft>) => void;
  removeExpenseItem: (id: string) => void;
  toggleExpenseItem: (id: string, enabled: boolean) => void;
  reorderExpenseItems: (orderedIds: string[]) => void;
  addTransaction: (input: DailyTransactionDraft) => DailyTransaction;
  updateTransaction: (id: string, patch: Partial<DailyTransactionDraft>) => void;
  removeTransaction: (id: string) => void;
  addParsedTransactions: (drafts: ParsedTransactionDraft[]) => DailyTransaction[];
  setInitialSavingsFund: (amount: VndAmount) => void;
  updateMonthlyRecord: (month: MonthKey, patch: MonthlyRecordPatch) => void;
  applyOptimization: (result: OptimizationResult) => void;
  revertOptimization: () => void;
  setSimulation: (simulation: WhatIfSimulationResult | null) => void;
  applySimulation: (payload: SimulationApplyPayload) => void;
  resetSimulation: () => void;
  loadDemoData: () => void;
  importBackup: (payload: unknown) => ImportResult;
  exportBackup: () => BackupPayload;
  setActiveTab: (tab: AnalysisTabId) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveView: (view: DashboardViewId) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSort: (sort: SortState) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setOptimizationOpen: (open: boolean) => void;
  setWhatIfOpen: (open: boolean) => void;
  setDataManagerOpen: (open: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  resetAll: () => void;
}

export type LivingCostStore = LivingCostState & LivingCostActions;

export type CategoryGroupDTO = CategoryGroup;

export type ProfileDTO = Profile;

export type ExpenseItemDTO = ExpenseItem;

export type DailyTransactionDTO = DailyTransaction;

export type CreateProfileInput = ProfileDraft;

export type UpdateProfileInput = Partial<ProfileDraft>;

export type CreateExpenseItemInput = ExpenseItemDraft;

export type UpdateExpenseItemInput = Partial<ExpenseItemDraft>;

export type CreateTransactionInput = DailyTransactionDraft;

export type UpdateTransactionInput = Partial<DailyTransactionDraft>;

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  field: string | null;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FrequencyDefinition {
  value: Frequency;
  label: string;
  shortLabel: string;
  monthlyMultiplier: number;
  dailyMultiplier: number;
  yearlyMultiplier: number;
}

export interface PaymentMethodDefinition {
  value: PaymentMethod;
  label: string;
  icon: string;
  color: string;
}

export interface CityTierDefinition {
  value: CityTier;
  label: string;
  costMultiplier: number;
  description: string;
}

export interface LifestyleDefinition {
  value: Lifestyle;
  label: string;
  costMultiplier: number;
  description: string;
}

export interface CategoryDefinition {
  code: CategoryGroupCode;
  name: string;
  description: string;
  color: string;
  icon: string;
  targetPercentage: Percentage;
}

export interface NavigationItem {
  id: AnalysisTabId;
  label: string;
  icon: string;
  description: string;
}

export interface DashboardTabDefinition {
  id: AnalysisTabId;
  label: string;
  icon: string;
  description: string;
  badge: string | null;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  align: "left" | "center" | "right";
  width: string | number | null;
  sortable: boolean;
  render: ((row: T) => string | number) | null;
}

export interface DashboardSummary {
  profile: Profile;
  financialHealth: FinancialHealthSnapshot;
  categorySummaries: CategoryGroupSummary[];
  expenseItems: ExpenseItemComputed[];
  transactions: DailyTransaction[];
  calendar: CalendarHeatmapSummary;
  latteFactor: LatteFactorResult | null;
  workTime: RealHourlyWageResult | null;
}
