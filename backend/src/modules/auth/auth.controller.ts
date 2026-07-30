import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../utils/validate";
import * as authService from "./auth.service";
import { loginSchema, registerSchema, updateProfileSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await authService.getProfile(req.auth!.userId);
  res.status(200).json(user);
});

authRouter.patch("/me", requireAuth, validateBody(updateProfileSchema), async (req, res) => {
  const user = await authService.updateProfile(req.auth!.userId, req.body);
  res.status(200).json(user);
});
