import { type User, type InsertUser, type Onboarding, type InsertOnboarding } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createOnboarding(onboarding: InsertOnboarding): Promise<Onboarding>;
  getOnboarding(id: string): Promise<Onboarding | undefined>;
  getAllOnboardings(): Promise<Onboarding[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private onboardings: Map<string, Onboarding>;

  constructor() {
    this.users = new Map();
    this.onboardings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createOnboarding(insertOnboarding: InsertOnboarding): Promise<Onboarding> {
    const id = randomUUID();
    const onboarding: Onboarding = { ...insertOnboarding, id };
    this.onboardings.set(id, onboarding);
    return onboarding;
  }

  async getOnboarding(id: string): Promise<Onboarding | undefined> {
    return this.onboardings.get(id);
  }

  async getAllOnboardings(): Promise<Onboarding[]> {
    return Array.from(this.onboardings.values());
  }
}

export const storage = new MemStorage();
