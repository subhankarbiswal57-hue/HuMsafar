"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Camera, CheckCircle2 } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateMultipart } from "@/lib/crudHooks";

const CATEGORIES = [
  { value: "POTHOLE", label: "Pothole" },
  { value: "STREETLIGHT", label: "Streetlight outage" },
  { value: "DRAINAGE", label: "Drainage / flooding" },
  { value: "SIGNAGE", label: "Damaged signage" },
  { value: "TRAFFIC_SIGNAL", label: "Traffic signal fault" },
  { value: "OTHER", label: "Other" },
];

const schema = z.object({
  title: z.string().min(3, "Give it a short title"),
  description: z.string().min(5, "Please describe the issue"),
  category: z.enum(["POTHOLE", "STREETLIGHT", "DRAINAGE", "SIGNAGE", "TRAFFIC_SIGNAL", "OTHER"]),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});
type FormData = z.infer<typeof schema>;

function ReportContent() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "POTHOLE" },
  });
  const create = useCreateMultipart("complaints");
  const [photos, setPhotos] = useState<File[]>([]);
  const [locating, setLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const lat = watch("latitude");
  const lng = watch("longitude");

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude, { shouldValidate: true });
        setValue("longitude", pos.coords.longitude, { shouldValidate: true });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function onSubmit(values: FormData) {
    const form = new FormData();
    Object.entries(values).forEach(([k, v]) => form.append(k, String(v)));
    photos.forEach((p) => form.append("photos", p));
    create.mutate(form, { onSuccess: () => setSubmitted(true) });
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CheckCircle2 className="mx-auto mb-3 text-accent" size={40} />
        <h1 className="mb-1 text-xl font-bold">Report submitted</h1>
        <p className="mb-4 text-sm text-gray-500">Thanks — the relevant team has been notified. You can track its status under My Reports.</p>
        <Button onClick={() => setSubmitted(false)}>Report another issue</Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Report an issue</h1>
      <p className="mb-6 text-sm text-gray-500">Help us keep the city's roads and transit assets safe.</p>
      <Card>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Title" placeholder="e.g. Pothole near bus stop" {...register("title")} error={errors.title?.message} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Category</label>
            <select {...register("category")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
            <textarea
              rows={4}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
              placeholder="Describe what you saw, when, and how severe it is"
              {...register("description")}
            />
            {errors.description && <span className="text-xs text-danger">{errors.description.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={useMyLocation} loading={locating}>
                <MapPin size={16} /> Use my current location
              </Button>
              {lat && lng && <span className="self-center text-xs text-gray-500">{Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Latitude" type="number" step="0.00001" {...register("latitude")} error={errors.latitude?.message} />
              <Input label="Longitude" type="number" step="0.00001" {...register("longitude")} error={errors.longitude?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Photos (optional, up to 5)</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <Camera size={18} />
              {photos.length ? `${photos.length} photo(s) selected` : "Tap to add photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 5))}
              />
            </label>
          </div>

          {create.isError && (
            <p className="text-sm text-danger">{(create.error as any)?.response?.data?.error ?? "Submission failed"}</p>
          )}
          <Button type="submit" loading={create.isPending}>Submit report</Button>
        </form>
      </Card>
    </div>
  );
}

export default function ReportPage() {
  return (
    <AuthGuard>
      <AppShell>
        <ReportContent />
      </AppShell>
    </AuthGuard>
  );
}
