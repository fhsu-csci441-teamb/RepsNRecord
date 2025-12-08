"use client";
import AuthGuard from "@/components/AuthGuard";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

type Photo = {
  _id: string;
  fileUrl: string;
  thumbUrl: string;
  description?: string;
  takenAt?: string;
  createdAt: string;
};

export default function PicturesPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch photos on mount and when month changes
  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [month, user]);

  const fetchPhotos = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/photos?month=${month}&userId=${user.uid}`);
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
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      // Create unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const userId = user.uid;

      // Upload full image to Firebase Storage
      const fileRef = ref(storage, `photos/${userId}/${fileName}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // Create thumbnail using canvas (client-side resize)
      const thumbBlob = await createThumbnail(file, 512, 512);
      const thumbRef = ref(storage, `photos/${userId}/thumbs/${fileName}`);
      await uploadBytes(thumbRef, thumbBlob);
      const thumbUrl = await getDownloadURL(thumbRef);

      // Get image dimensions
      const dimensions = await getImageDimensions(file);

      // Use the selected month as the taken_at date (set to first day of month at noon UTC)
      const takenAtDate = new Date(`${month}-15T12:00:00Z`);

      // Save metadata to MongoDB
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fileUrl,
          thumbUrl,
          mimeType: file.type,
          bytes: file.size,
          width: dimensions.width,
          height: dimensions.height,
          takenAt: takenAtDate.toISOString(),
          description: "Progress photo",
        }),
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

  const remove = async (photo: Photo) => {
    if (!user) return;

    try {
      // Delete from MongoDB
      const res = await fetch(`/api/photos?id=${photo._id}&userId=${user.uid}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Delete failed");
      }

      // Delete from Firebase Storage
      try {
        const fileRef = ref(storage, photo.fileUrl);
        const thumbRef = ref(storage, photo.thumbUrl);
        await deleteObject(fileRef);
        await deleteObject(thumbRef);
      } catch (storageErr) {
        console.warn("Firebase Storage deletion error:", storageErr);
        // Continue even if storage deletion fails
      }

      // Remove from local state
      setPhotos((p) => p.filter((x) => x._id !== photo._id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      console.error("Delete error:", err);
    }
  };

  const visible = photos.filter((p) => {
    if (!p.takenAt) return true;
    const photoMonth = p.takenAt.slice(0, 7);
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
              Uploading photo to Firebase Storage...
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
                <div key={p._id} className="relative group rounded-2xl overflow-hidden border bg-white shadow-sm">
                  <img
                    src={p.thumbUrl}
                    alt={p.description || "Progress"}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => remove(p)}
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

// Helper: Create thumbnail blob from image file
async function createThumbnail(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create thumbnail"));
        },
        "image/jpeg",
        0.8
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Helper: Get image dimensions
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
