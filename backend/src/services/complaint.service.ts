import { prisma } from "../config/prisma";
import { ApiError } from "../middleware/errorHandler";

interface ListParams {
  page: number;
  limit: number;
  status?: string;
  category?: string;
  reporterId?: string;
}

export async function listComplaints({ page, limit, status, category, reporterId }: ListParams) {
  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (reporterId) where.reporterId = reporterId;

  const [items, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { reporter: { select: { firstName: true, lastName: true, email: true } } },
    }),
    prisma.complaint.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getComplaint(id: string) {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { reporter: { select: { firstName: true, lastName: true, email: true } } },
  });
  if (!complaint) throw new ApiError(404, "Complaint not found");
  return complaint;
}

export async function createComplaint(data: any, photoUrls: string[], reporterId?: string) {
  return prisma.complaint.create({
    data: { ...data, photoUrls, reporterId },
  });
}

export async function updateComplaintStatus(id: string, status: string, resolutionNotes?: string) {
  try {
    return await prisma.complaint.update({
      where: { id },
      data: { status: status as any, resolutionNotes },
    });
  } catch (e: any) {
    if (e.code === "P2025") throw new ApiError(404, "Complaint not found");
    throw e;
  }
}

export async function complaintStats() {
  const byStatus = await prisma.complaint.groupBy({ by: ["status"], _count: { _all: true } });
  const byCategory = await prisma.complaint.groupBy({ by: ["category"], _count: { _all: true } });
  const total = await prisma.complaint.count();
  return { total, byStatus, byCategory };
}
