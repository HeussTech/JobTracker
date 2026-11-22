import bcrypt from "bcryptjs";
import { Router } from "express";
import { signToken } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { prisma } from "../prisma";
import { credentialsSchema } from "../schemas";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Cet email est déjà utilisé" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    res.status(201).json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !valid) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    res.json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
  })
);
