import { Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import * as complaintService from "../services/complaint.service";
import { fileToPublicUrl } from "../utils/upload";
import { prisma } from "../config/prisma";

const LIST_PRIVILEGED_ROLES = ["ADMIN", "PLANNER", "ENGINEER", "RESEARCHER"];

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const q = (req as any).validatedQuery ?? req.query;
  const isPrivileged = req.user && LIST_PRIVILEGED_ROLES.includes(req.user.role);
  const wantsMine = q.mine === "true" || q.mine === true;
  const reporterId = !isPrivileged || wantsMine ? req.user?.sub : undefined;

  const result = await complaintService.listComplaints({
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 20,
    status: q.status,
    category: q.category,
    reporterId,
  });
  res.json(result);
});

const PRIVILEGED_ROLES = ["ADMIN", "PLANNER", "ENGINEER", "RESEARCHER"];

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const complaint = await complaintService.getComplaint(req.params.id);
  const isOwner = complaint.reporterId && complaint.reporterId === req.user?.sub;
  const isPrivileged = req.user && PRIVILEGED_ROLES.includes(req.user.role);
  if (!isOwner && !isPrivileged) {
    return res.status(403).json({ error: "You can only view your own complaints" });
  }
  res.json({ complaint });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const photoUrls = files.map((f) => fileToPublicUrl(f.filename));
  const complaint = await complaintService.createComplaint(req.body, photoUrls, req.user?.sub);
  await prisma.auditLog.create({
    data: { userId: req.user?.sub, action: "CREATE", entity: "Complaint", entityId: complaint.id },
  });
  res.status(201).json({ complaint });
});

export const updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const complaint = await complaintService.updateComplaintStatus(req.params.id, req.body.status, req.body.resolutionNotes);
  await prisma.auditLog.create({
    data: { userId: req.user?.sub, action: "UPDATE_STATUS", entity: "Complaint", entityId: complaint.id, metadata: req.body },
  });
  res.json({ complaint });
});

export const stats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json(await complaintService.complaintStats());
});
