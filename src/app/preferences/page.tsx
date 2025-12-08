// Written by: Simranjit Sandhu
// Tested by: Simranjit Sandhu
// Debugged by: Simranjit Sandhu
// User preferences page - profile settings and trainer connection

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { auth } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";
import { Settings, Bell, Mail, Scale, Palette, Save, Download, Users, Check, X } from "lucide-react";

interface Preferences {
  theme: string;
  notificationsEnabled: boolean;
  emailReminders: boolean;
  weeklySummary: boolean;
  weightUnit: string;
}

interface ConnectionRequest {
  id: number;
  fromUserId: string;
  fromRole: string;
  message: string | null;
  createdAt: string;
}

export default function PreferencesPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "light",
    notificationsEnabled: true,
    emailReminders: false,
    weeklySummary: true,
    weightUnit: "lbs",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [myTrainer, setMyTrainer] = useState<string | null>(null);
  const [trainerPermissions, setTrainerPermissions] = useState<{ allowExport: boolean; allowPhotos: boolean } | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchPreferences();
      fetchConnectionRequests();
      checkMyTrainer();
      fetchTrainerPermissions();
    }
  }, [user]);

  // Apply theme preference to document
  useEffect(() => {
    if (preferences.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [preferences.theme]);

  const fetchConnectionRequests = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/connections?userId=${user?.uid}&type=received`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setConnectionRequests(data);
      } else {
        console.error("Error response:", res.status);
      }
    } catch (error) {
      console.error("Error fetching connection requests:", error);
    }
  };

  const checkMyTrainer = async () => {
    try {
      const res = await fetch(`/api/trainer/share?visitorId=${user?.uid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hasTrainer) {
          setMyTrainer(data.trainerId);
        }
      }
    } catch (error) {
      console.error("Error checking trainer:", error);
    }
  };

  const fetchTrainerPermissions = async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(`/api/trainer/permissions?clientId=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Assume one trainer for now, pick the first permissions entry
          const p = data[0];
          setTrainerPermissions({ allowExport: p.allowExport, allowPhotos: p.allowPhotos });
        } else {
          setTrainerPermissions(null);
        }
      }
    } catch (error) {
      console.error("Error fetching trainer permissions:", error);
    }
  };

  const updateTrainerPermissions = async (allowExport: boolean, allowPhotos: boolean) => {
    if (!user?.uid || !myTrainer) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/trainer/permissions`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ clientId: user.uid, trainerId: myTrainer, allowExport, allowPhotos }),
      });
      if (res.ok) {
        const data = await res.json();
        setTrainerPermissions({ allowExport: data.allowExport ?? allowExport, allowPhotos: data.allowPhotos ?? allowPhotos });
      }
    } catch (error) {
      console.error("Error updating trainer permissions:", error);
    }
  };

  const respondToRequest = async (requestId: number, action: "accept" | "decline") => {
    setRespondingTo(requestId);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/connections", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action, userId: user?.uid }),
      });
      if (res.ok) {
        setConnectionRequests((prev) => prev.filter((r) => r.id !== requestId));
        if (action === "accept") {
          setMessage("Trainer connection accepted!");
          checkMyTrainer();
        } else {
          setMessage("Request declined");
        }
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error responding to request:", error);
    } finally {
      setRespondingTo(null);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`/api/preferences?userId=${user?.uid}`);
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const savePreferences = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setMessage("");

    try {
      // Get Firebase ID token for auth
      const token = await user.getIdToken();
      
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.uid, email: user.email, ...preferences }),
      });

      if (res.ok) {
        setMessage("Preferences saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage("Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    if (!user?.uid) return;
    setExporting(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/export/csv?userId=${user.uid}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `workouts-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to export data");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <Settings className="w-8 h-8 text-pink-500" aria-hidden="true" />
              <h1 className="text-3xl font-bold text-gray-800">Preferences</h1>
            </div>

            {message && (
              <div 
                className={`mb-6 p-4 rounded-lg ${
                  message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
                role="alert"
                aria-live="polite"
              >
                {message}
              </div>
            )}

            <div className="space-y-6">
              <section aria-labelledby="user-id-heading">
                <h2 id="user-id-heading" className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" aria-hidden="true" />
                  Your User ID
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Share this ID with trainers to connect:</p>
                  <div 
                    className="bg-white p-3 rounded border border-blue-300 font-mono text-sm break-all cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(user?.uid || '');
                    }}
                    title="Click to copy"
                  >
                    <span className="text-blue-600 font-semibold">{user?.uid}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click to copy to clipboard</p>
                </div>
              </section>
              <section aria-labelledby="trainer-heading">
                <h2 id="trainer-heading" className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" aria-hidden="true" />
                  Trainer Connection
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {myTrainer ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Check className="w-5 h-5 text-green-500" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-green-700">Connected to a Trainer</p>
                        <p className="text-sm text-green-600">Trainer ID: {myTrainer.slice(0, 12)}...</p>
                      </div>
                    </div>
                  ) : connectionRequests.length > 0 ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        You have {connectionRequests.length} pending trainer request(s):
                      </p>
                      <div className="space-y-3">
                        {connectionRequests.map((req) => (
                          <div key={req.id} className="p-4 bg-white border border-pink-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-800">
                                  Trainer Request
                                </p>
                                <p className="text-sm text-gray-500">
                                  From: {req.fromUserId.slice(0, 12)}...
                                </p>
                                {req.message && (
                                  <p className="text-sm text-gray-600 mt-2 italic">"{req.message}"</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  Sent {new Date(req.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => respondToRequest(req.id, "accept")}
                                  disabled={respondingTo === req.id}
                                  className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
                                >
                                  <Check className="w-4 h-4" aria-hidden="true" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => respondToRequest(req.id, "decline")}
                                  disabled={respondingTo === req.id}
                                  className="flex items-center gap-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 text-sm"
                                >
                                  <X className="w-4 h-4" aria-hidden="true" />
                                  Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No trainer connected. When a trainer invites you, you'll see the request here.
                    </p>
                  )}
                  {myTrainer && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Trainer Permissions</h3>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-700">Allow trainer to export my workouts (CSV)</div>
                        <input
                          type="checkbox"
                          checked={trainerPermissions?.allowExport ?? true}
                          onChange={(e) => updateTrainerPermissions(e.target.checked, trainerPermissions?.allowPhotos ?? false)}
                          className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">Include photos in trainer exports (ZIP)</div>
                        <input
                          type="checkbox"
                          checked={trainerPermissions?.allowPhotos ?? false}
                          onChange={(e) => updateTrainerPermissions(trainerPermissions?.allowExport ?? true, e.target.checked)}
                          className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section aria-labelledby="appearance-heading">
                <h2 id="appearance-heading" className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" aria-hidden="true" />
                  Appearance
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label htmlFor="theme-select" className="block text-sm font-medium text-gray-600 mb-2">
                    Theme
                  </label>
                  <select
                    id="theme-select"
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </section>

              <section aria-labelledby="notifications-heading">
                <h2 id="notifications-heading" className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  Notifications
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Enable notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.notificationsEnabled}
                      onChange={(e) => setPreferences({ ...preferences, notificationsEnabled: e.target.checked })}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                      aria-describedby="notifications-desc"
                    />
                  </label>
                  <span id="notifications-desc" className="sr-only">Toggle push notifications</span>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      Email reminders
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.emailReminders}
                      onChange={(e) => setPreferences({ ...preferences, emailReminders: e.target.checked })}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Weekly summary emails</span>
                    <input
                      type="checkbox"
                      checked={preferences.weeklySummary}
                      onChange={(e) => setPreferences({ ...preferences, weeklySummary: e.target.checked })}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                    />
                  </label>
                </div>
              </section>

              <section aria-labelledby="units-heading">
                <h2 id="units-heading" className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5" aria-hidden="true" />
                  Units
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label htmlFor="weight-unit" className="block text-sm font-medium text-gray-600 mb-2">
                    Weight Unit
                  </label>
                  <select
                    id="weight-unit"
                    value={preferences.weightUnit}
                    onChange={(e) => setPreferences({ ...preferences, weightUnit: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </section>

              <section aria-labelledby="data-heading">
                <h2 id="data-heading" className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5" aria-hidden="true" />
                  Data Export
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 mb-4">Download all your workout data as a CSV file.</p>
                  <button
                    onClick={exportData}
                    disabled={exporting}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    aria-busy={exporting}
                  >
                    <Download className="w-5 h-5" aria-hidden="true" />
                    {exporting ? "Exporting..." : "Export to CSV"}
                  </button>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={savePreferences}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all disabled:opacity-50 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                aria-busy={saving}
              >
                <Save className="w-5 h-5" aria-hidden="true" />
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
