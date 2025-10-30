"use client";
import AuthGuard from "@/components/AuthGuard";
import { useState, useEffect } from "react";

type Photo = {
  id: string;
  file_url: string;
  thumb_url: string;
  description?: string;
  taken_at?: string;
  created_at: string;
};

const BACKEND_URL = "http://localhost:3000";

export default function PicturesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch photos on mount and when month changes
  useEffect(() => {
    fetchPhotos();
  }, [month]);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/photos?month=${month}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      const data = await res.json();
      setPhotos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
      console.error("Fetch error:", err);
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      // Use the selected month as the taken_at date (set to first day of month at noon UTC)
      const takenAtDate = new Date(`${month}-15T12:00:00Z`);
      formData.append("takenAt", takenAtDate.toISOString());
      formData.append("description", "Progress photo");

      const res = await fetch(`${BACKEND_URL}/api/photos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      const newPhoto = await res.json();
      setPhotos((p) => [newPhoto, ...p]);
      e.target.value = ""; // Reset input
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/photos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Delete failed");
      }

      // Remove from local state only after successful deletion
      setPhotos((p) => p.filter((x) => x.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      console.error("Delete error:", err);
    }
  };

  const visible = photos.filter((p) => {
    if (!p.taken_at) return true;
    const photoMonth = p.taken_at.slice(0, 7);
    return photoMonth === month;
  });

  return (
    <AuthGuard>
      <main className="min-h-screen p-6 bg-gradient-to-b from-pink-100 via-orange-100 to-white">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-pink-700">Month</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-2xl border border-pink-200/70 bg-white/70 p-3 outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700">Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={onUpload}
                disabled={uploading}
                className="rounded-2xl border border-orange-200/70 bg-white/70 p-2 disabled:opacity-50"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <strong>Error:</strong> {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {uploading && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
              Uploading photo...
            </div>
          )}

          <div className="rounded-3xl border border-orange-200/60 bg-white/85 backdrop-blur p-4 shadow-lg">
            <h2 className="text-xl font-bold text-pink-600 mb-3">
              Progress Photos — {month}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {visible.length === 0 && (
                <div className="col-span-full text-center text-neutral-500 py-10">
                  No photos for this month.
                </div>
              )}
              {visible.map((p) => (
                <div key={p.id} className="relative group rounded-2xl overflow-hidden border bg-white shadow-sm">
                  <img
                    src={`${BACKEND_URL}${p.thumb_url}`}
                    alt={p.description || "Progress"}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => remove(p.id)}
                    className="absolute top-2 right-2 bg-white/90 text-pink-600 px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
