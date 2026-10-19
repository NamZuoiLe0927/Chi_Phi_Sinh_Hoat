import { z } from "zod";
import type { ValidationIssue } from "@/types/living-cost.types";

const idSchema = z.string().min(1);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD");
const dateTimeSchema = z.string().min(1);
const moneySchema = z.number().finite().nonnegative();
const noteSchema = z.string().nullable();

const cityTierSchema = z.enum(["HANOI_HCM", "DA_NANG_CAN_THO", "PROVINCE"]);
const lifestyleSchema = z.enum(["FRUGAL", "BALANCED", "COMFORT"]);
const budgetRuleSchema = z.enum(["RULE_50_30_20", "RULE_60_20_20", "CUSTOM"]);
const groupCodeSchema = z.enum(["NEEDS", "WANTS", "SAVINGS_DEBT"]);
const frequencySchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);
const paymentMethodSchema = z.enum([
  "CASH",
  "BANK_TRANSFER",
  "CREDIT_CARD",
  "E_WALLET",
]);
const transactionSourceSchema = z.enum([
  "MANUAL",
  "SMART_PARSER",
  "IMPORT",
  "DEMO",
]);
const paymentSourceSchema = z.enum(["CASH", "SAVINGS"]);
const dailyCategorySchema = z.enum([
  "FOOD",
  "TRANSPORT",
  "BILLS",
  "SHOPPING",
  "ENTERTAINMENT",
  "OTHER",
]);
const monthlyLedgerModeSchema = z.enum(["AUTO", "MANUAL"]);

export const profileSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  monthlyIncome: moneySchema,
  extraIncome: moneySchema,
  cityTier: cityTierSchema,
  lifestyle: lifestyleSchema,
  dependents: z.number().int().nonnegative(),
  budgetRule: budgetRuleSchema,
  savingsGoalAmount: moneySchema,
  inflationRate: z.number().finite().min(0).max(1),
  workHoursPerDay: z.number().finite().min(0).max(24),
  workDaysPerMonth: z.number().finite().min(0).max(31),
  commuteHoursPerDay: z.number().finite().min(0).max(24),
  currentSavings: moneySchema,
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});

export const categoryGroupSchema = z.object({
  id: idSchema,
  code: groupCodeSchema,
  name: z.string().min(1),
  description: z.string().nullable(),
  color: z.string().min(1),
  icon: z.string().min(1),
  sortOrder: z.number().int(),
});

export const expenseItemSchema = z.object({
  id: idSchema,
  profileId: idSchema,
  name: z.string().min(1),
  group: groupCodeSchema,
  icon: z.string().min(1),
  color: z.string().min(1),
  frequency: frequencySchema,
  unitPrice: moneySchema,
  quantityPerPeriod: z.number().finite().nonnegative(),
  isFixed: z.boolean(),
  isEnabled: z.boolean(),
  priority: z.number().int().min(1).max(5),
  note: noteSchema,
  sortOrder: z.number().int(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});

export const dailyTransactionSchema = z.object({
  id: idSchema,
  profileId: idSchema,
  expenseItemId: z.string().nullable(),
  title: z.string().min(1),
  amount: moneySchema,
  date: dateSchema,
  paymentMethod: paymentMethodSchema,
  paymentSource: paymentSourceSchema.optional(),
  categoryCode: dailyCategorySchema.optional(),
  note: noteSchema,
  source: transactionSourceSchema,
  createdAt: dateTimeSchema,
});

export const monthlyRecordSchema = z.object({
  id: idSchema,
  month: z.string().regex(/^\d{4}-\d{2}$/, "Tháng phải có định dạng YYYY-MM"),
  year: z.number().int(),
  monthIndex: z.number().int().min(1).max(12),
  income: moneySchema,
  manualNetBalance: z.number().finite().nullable(),
  note: z.string(),
  mode: monthlyLedgerModeSchema,
  isSettled: z.boolean(),
  updatedAt: dateTimeSchema,
});

export const backupMetadataSchema = z.object({
  version: z.number().int().nonnegative(),
  schemaVersion: z.number().int().nonnegative(),
  appVersion: z.string().min(1),
  exportedAt: dateTimeSchema,
  currency: z.literal("VND"),
});

export const backupPayloadSchema = z.object({
  metadata: backupMetadataSchema,
  profile: profileSchema,
  categoryGroups: z.array(categoryGroupSchema),
  expenseItems: z.array(expenseItemSchema),
  transactions: z.array(dailyTransactionSchema),
  initialSavingsFund: moneySchema.optional(),
  monthlyRecords: z.array(monthlyRecordSchema).optional(),
});

export function getBackupValidationIssues(
  error: z.ZodError,
): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
    code: issue.code,
  }));
}
