import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { prisma } from "../prisma";
import { applicationCreateSchema, applicationUpdateSchema, listQuerySchema } from "../schemas";

export const applicationsRouter = Router();
applicationsRouter.use(requireAuth);

// GET /api/applications?status=&q=&page=&limit=
applicationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, q, page, limit } = listQuerySchema.parse(req.query);
    const where = {
      userId: req.userId!,
      ...(status && { status }),
      ...(q && {
        OR: [
          { company: { contains: q, mode: "insensitive" as const } },
          { position: { contains: q, mode: "insensitive" as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  })
);

// GET /api/applications/stats  -> { WISHLIST: 2, APPLIED: 5, ... }
applicationsRouter.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const rows = await prisma.application.groupBy({
      by: ["status"],
      where: { userId: req.userId! },
      _count: { _all: true },
    });
    const stats: Record<string, number> = {
      WISHLIST: 0,
      APPLIED: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    };
    for (const row of rows) stats[row.status] = row._count._all;
    res.json(stats);
  })
);

applicationsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = applicationCreateSchema.parse(req.body);
    const created = await prisma.application.create({
      data: { ...data, url: data.url || null, userId: req.userId! },
    });
    res.status(201).json(created);
  })
);

applicationsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Identifiant invalide" });

    const data = applicationUpdateSchema.parse(req.body);
    const { count } = await prisma.application.updateMany({
      where: { id, userId: req.userId! },
      data: { ...data, ...("url" in data && { url: data.url || null }) },
    });
    if (count === 0) return res.status(404).json({ error: "Candidature introuvable" });

    res.json(await prisma.application.findUnique({ where: { id } }));
  })
);

applicationsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Identifiant invalide" });

    const { count } = await prisma.application.deleteMany({ where: { id, userId: req.userId! } });
    if (count === 0) return res.status(404).json({ error: "Candidature introuvable" });

    res.status(204).end();
  })
);
