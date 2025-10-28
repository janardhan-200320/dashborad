import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOnboardingSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/onboarding - Create new onboarding
  app.post("/api/onboarding", async (req, res) => {
    try {
      const result = insertOnboardingSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }

      const onboarding = await storage.createOnboarding(result.data);
      return res.status(201).json(onboarding);
    } catch (error) {
      console.error("Error creating onboarding:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/onboarding/:id - Get onboarding by ID
  app.get("/api/onboarding/:id", async (req, res) => {
    try {
      const onboarding = await storage.getOnboarding(req.params.id);
      
      if (!onboarding) {
        return res.status(404).json({ error: "Onboarding not found" });
      }

      return res.json(onboarding);
    } catch (error) {
      console.error("Error fetching onboarding:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/onboardings - Get all onboardings
  app.get("/api/onboardings", async (_req, res) => {
    try {
      const onboardings = await storage.getAllOnboardings();
      return res.json(onboardings);
    } catch (error) {
      console.error("Error fetching onboardings:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
