"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export function useList(resource: string, params: Record<string, any> = {}) {
  return useQuery({
    queryKey: [resource, "list", params],
    queryFn: async () => (await api.get(`/${resource}`, { params })).data,
  });
}

export function useItem(resource: string, id?: string) {
  return useQuery({
    queryKey: [resource, "item", id],
    queryFn: async () => (await api.get(`/${resource}/${id}`)).data.item,
    enabled: !!id,
  });
}

export function useCreate(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await api.post(`/${resource}`, data)).data.item,
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useUpdate(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      (await api.patch(`/${resource}/${id}`, data)).data.item,
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useCreateMultipart(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) =>
      (await api.post(`/${resource}`, formData, { headers: { "Content-Type": "multipart/form-data" } })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function usePatchAction(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, path, data }: { id: string; path: string; data: any }) =>
      (await api.patch(`/${resource}/${id}/${path}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useDelete(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/${resource}/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}
