"use client";
import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";

type Photo = { id: string; url: string; month: string };

export default function PicturesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file); // preview only for now
    setPhotos((p) => [{ id: crypto.randomUUID(), url, month }, ...p]);
    e.target.value = "";
  };

  const remove = (id: string) => setPhotos((p) => p.filter((x) => x.id !== id));
  const visible = photos.filter((p) => p.month === month);

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
                className="rounded-2xl border border-orange-200/70 bg-white/70 p-2"
              />
            </div>
          </div>

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
                  <img src={p.url} alt="Progress" className="w-full h-48 object-cover" />
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
