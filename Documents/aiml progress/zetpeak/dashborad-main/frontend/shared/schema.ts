import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const onboarding = pgTable("onboarding", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull(),
  websiteUrl: text("website_url").notNull(),
  currency: text("currency").notNull(),
  industries: text("industries").array().notNull(),
  businessNeeds: text("business_needs").array().notNull(),
  timezone: text("timezone").notNull(),
  availableDays: text("available_days").array().notNull(),
  availableTimeStart: text("available_time_start").notNull(),
  availableTimeEnd: text("available_time_end").notNull(),
  eventTypeLabel: text("event_type_label").notNull(),
  teamMemberLabel: text("team_member_label").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOnboardingSchema = createInsertSchema(onboarding).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOnboarding = z.infer<typeof insertOnboardingSchema>;
export type Onboarding = typeof onboarding.$inferSelect;
