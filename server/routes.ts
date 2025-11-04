import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOnboardingSchema, insertResourceSchema, insertResourceBookingSchema } from "@shared/schema";
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

  // ========== RESOURCE ROUTES ==========

  // POST /api/resources - Create new resource
  app.post("/api/resources", async (req, res) => {
    try {
      const result = insertResourceSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }

      const resource = await storage.createResource(result.data);
      return res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/resources - Get all resources
  app.get("/api/resources", async (req, res) => {
    try {
      const { type, status, search } = req.query;
      const resources = await storage.getAllResources({
        type: type as string,
        status: status as string,
        search: search as string,
      });
      return res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/resources/:id - Get resource by ID
  app.get("/api/resources/:id", async (req, res) => {
    try {
      const resource = await storage.getResource(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }

      return res.json(resource);
    } catch (error) {
      console.error("Error fetching resource:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT /api/resources/:id - Update resource
  app.put("/api/resources/:id", async (req, res) => {
    try {
      const result = insertResourceSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }

      const resource = await storage.updateResource(req.params.id, result.data);
      
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }

      return res.json(resource);
    } catch (error) {
      console.error("Error updating resource:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE /api/resources/:id - Delete resource
  app.delete("/api/resources/:id", async (req, res) => {
    try {
      await storage.deleteResource(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting resource:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========== RESOURCE BOOKING ROUTES ==========

  // POST /api/resource-bookings - Create new resource booking
  app.post("/api/resource-bookings", async (req, res) => {
    try {
      const result = insertResourceBookingSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }

      // Check if resource is available during requested time
      const isAvailable = await storage.checkResourceAvailability(
        result.data.resourceId,
        result.data.startTime,
        result.data.endTime
      );

      if (!isAvailable) {
        return res.status(409).json({ 
          error: "Resource is not available during the requested time" 
        });
      }

      const booking = await storage.createResourceBooking(result.data);
      return res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating resource booking:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/resource-bookings - Get all resource bookings
  app.get("/api/resource-bookings", async (req, res) => {
    try {
      const { resourceId, startDate, endDate } = req.query;
      const bookings = await storage.getResourceBookings({
        resourceId: resourceId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      return res.json(bookings);
    } catch (error) {
      console.error("Error fetching resource bookings:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT /api/resource-bookings/:id/cancel - Cancel resource booking
  app.put("/api/resource-bookings/:id/cancel", async (req, res) => {
    try {
      const booking = await storage.cancelResourceBooking(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      return res.json(booking);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/resources/:id/stats - Get resource usage statistics
  app.get("/api/resources/:id/stats", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const stats = await storage.getResourceStats(
        req.params.id,
        startDate as string,
        endDate as string
      );
      return res.json(stats);
    } catch (error) {
      console.error("Error fetching resource stats:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========== APPOINTMENTS ROUTES (in-memory) ==========
  app.get("/api/appointments", async (_req, res) => {
    try {
      const items = await storage.getAppointments();
      return res.json(items);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const body = req.body as any;
      // Minimal validation
      if (!body || !body.customerName || !body.email || !body.serviceName || !body.date || !body.time) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const created = await storage.createAppointment({
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        serviceName: body.serviceName,
        date: body.date,
        time: body.time,
        status: body.status || 'upcoming',
        notes: body.notes,
      });
      return res.status(201).json(created);
    } catch (error) {
      console.error("Error creating appointment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
