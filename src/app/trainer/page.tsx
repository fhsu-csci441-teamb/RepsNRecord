"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import AuthGuard from "@/components/AuthGuard";
import { Users, Eye, Calendar, Dumbbell, TrendingUp, UserPlus, X, Mail, Check, Search, Send, Clock } from "lucide-react";

interface Client {
  clientId: string;
  status: string;
  addedAt: string;
}

interface ClientWorkout {
  id: number;
  date: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
}

interface SharedExport {
  id: number;
  clientId: string;
  exportType: string;
  message: string | null;
  dataSummary: {
    totalWorkouts: number;
    totalPhotos: number;
    recentWorkouts: any[];
    sharedAt: string;
  };
  createdAt: string;
  viewedAt: string | null;
}

export default function TrainerDashboardPage() {
  const { user, role } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientWorkouts, setClientWorkouts] = useState<ClientWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("user");
  const [newClientId, setNewClientId] = useState("");
  const [addingClient, setAddingClient] = useState(false);
  const [sharedExports, setSharedExports] = useState<SharedExport[]>([]);
  const [showInbox, setShowInbox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  // Helper to add Firebase token to fetch requests
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    let token: string | null = null;
    if (user?.getIdToken) {
      token = await user.getIdToken();
    }
    
    // Safely merge headers - handle both object and Headers instance
    const existingHeaders = options.headers instanceof Headers 
      ? Object.fromEntries(options.headers.entries())
      : (options.headers as Record<string, string>) || {};
    
    const headers = {
      ...existingHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    
    console.log("[fetchWithAuth] Adding token to request. Token present:", !!token);
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    // Use role from useAuth and fetch relevant data if trainer
    if (!user) return;
    setUserRole(role ?? "user");
    setLoading(false);
    if (role === "trainer") {
      fetchClients();
      fetchSharedExports();
      fetchSentRequests();
    }
  }, [user, role]);

  const fetchSentRequests = async () => {
    try {
      const res = await fetchWithAuth(`/api/connections?userId=${user?.uid}&type=sent`);
      if (res.ok) {
        const data = await res.json();
        setSentRequests(data.filter((r: any) => r.status === "pending"));
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  };

  const searchUsers = async () => {
    if (searchQuery.length < 3) {
      console.log("[UI] Search query too short:", searchQuery.length, "chars");
      return;
    }
    console.log("[UI] Starting search for:", searchQuery, "User:", user?.uid);
    setSearching(true);
    try {
      const url = `/api/users/search?q=${searchQuery}&searcherId=${user?.uid}`;
      console.log("[UI] Fetching:", url);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log("[UI] Search results:", data);
        setSearchResults(data);
      } else {
        console.error("[UI] Search returned status:", res.status);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const sendConnectionRequest = async (toUserId: string) => {
    setSendingRequest(toUserId);
    try {
      // Get Firebase ID token for authentication
      let token: string | null = null;
      if (user?.getIdToken) {
        token = await user.getIdToken();
      }

      console.log("[Trainer] Sending connection request:", {
        fromUserId: user?.uid,
        toUserId,
        fromRole: "trainer",
        hasToken: !!token,
      });

      const res = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          fromUserId: user?.uid,
          toUserId,
          fromRole: "trainer",
          message: "I'd like to be your trainer and help track your progress!",
        }),
      });
      if (res.ok) {
        setSearchResults((prev) => prev.filter((u) => u.id !== toUserId));
        fetchSentRequests();
        alert("Connection request sent!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send request");
      }
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setSendingRequest(null);
    }
  };

  const fetchSharedExports = async () => {
    try {
      const res = await fetchWithAuth(`/api/trainer/share?visitorId=${user?.uid}&role=trainer`);
      if (res.ok) {
        const data = await res.json();
        setSharedExports(data);
      }
    } catch (error) {
      console.error("Error fetching shared exports:", error);
    }
  };

  const markAsViewed = async (exportId: number) => {
    try {
      await fetch("/api/trainer/share", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exportId, trainerId: user?.uid }),
      });
      setSharedExports((prev) =>
        prev.map((e) => (e.id === exportId ? { ...e, viewedAt: new Date().toISOString() } : e))
      );
    } catch (error) {
      console.error("Error marking as viewed:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetchWithAuth(`/api/trainer/clients?trainerId=${user?.uid}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchClientWorkouts = async (clientId: string) => {
    setWorkoutsLoading(true);
    setSelectedClient(clientId);
    try {
      const res = await fetchWithAuth(`/api/trainer/client-workouts?trainerId=${user?.uid}&clientId=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClientWorkouts(data);
      }
    } catch (error) {
      console.error("Error fetching client workouts:", error);
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const addClient = async () => {
    if (!newClientId.trim()) return;
    setAddingClient(true);
    try {
      const res = await fetchWithAuth("/api/trainer/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId: user?.uid, clientId: newClientId }),
      });
      if (res.ok) {
        setNewClientId("");
        fetchClients();
      }
    } catch (error) {
      console.error("Error adding client:", error);
    } finally {
      setAddingClient(false);
    }
  };

  const removeClient = async (clientId: string) => {
    try {
      await fetchWithAuth(`/api/trainer/clients?trainerId=${user?.uid}&clientId=${clientId}`, {
        method: "DELETE",
      });
      fetchClients();
      if (selectedClient === clientId) {
        setSelectedClient(null);
        setClientWorkouts([]);
      }
    } catch (error) {
      console.error("Error removing client:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 flex items-center justify-center">
          <div className="text-center" role="status" aria-label="Loading">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white font-semibold">Loading...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (userRole !== "trainer") {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Trainer Dashboard</h1>
              <p className="text-gray-600 mb-6">
                This dashboard is only available for trainers. Your current role is: <strong>{userRole}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Contact an administrator to upgrade your account to trainer status.
              </p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-pink-500" aria-hidden="true" />
                <h1 className="text-3xl font-bold text-gray-800">Trainer Dashboard</h1>
              </div>
              <button
                onClick={() => setShowInbox(!showInbox)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showInbox
                    ? "bg-pink-500 text-white"
                    : "bg-pink-100 text-pink-600 hover:bg-pink-200"
                }`}
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
                Client Updates
                {sharedExports.filter((e) => !e.viewedAt).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {sharedExports.filter((e) => !e.viewedAt).length}
                  </span>
                )}
              </button>
            </div>

            {showInbox && (
              <div className="mb-8 bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  Progress Updates from Clients
                </h2>

                {sharedExports.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No progress updates from clients yet.</p>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {sharedExports.map((share) => (
                      <div
                        key={share.id}
                        className={`p-4 rounded-lg border ${
                          share.viewedAt ? "bg-white border-gray-200" : "bg-pink-50 border-pink-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">
                                Client: {share.clientId.slice(0, 8)}...
                              </span>
                              {!share.viewedAt && (
                                <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">New</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Sent {new Date(share.createdAt).toLocaleDateString()} at{" "}
                              {new Date(share.createdAt).toLocaleTimeString()}
                            </p>
                            {share.message && (
                              <p className="mt-2 text-gray-700 italic">"{share.message}"</p>
                            )}
                          </div>
                          {!share.viewedAt && (
                            <button
                              onClick={() => markAsViewed(share.id)}
                              className="p-2 text-pink-500 hover:bg-pink-100 rounded-lg"
                              aria-label="Mark as read"
                            >
                              <Check className="w-5 h-5" aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        {share.dataSummary && (
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg text-center">
                              <p className="text-2xl font-bold text-pink-600">{share.dataSummary.totalWorkouts}</p>
                              <p className="text-xs text-gray-500">Total Workouts</p>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg text-center">
                              <p className="text-2xl font-bold text-orange-600">{share.dataSummary.totalPhotos}</p>
                              <p className="text-xs text-gray-500">Progress Photos</p>
                            </div>
                          </div>
                        )}

                        {share.dataSummary?.recentWorkouts?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-600 mb-2">Recent Workouts:</p>
                            <div className="space-y-1">
                              {share.dataSummary.recentWorkouts.slice(0, 3).map((w: any, i: number) => (
                                <div key={i} className="text-sm text-gray-600 flex justify-between">
                                  <span>{w.exerciseName}</span>
                                  <span className="text-gray-400">
                                    {w.sets}x{w.reps} @ {w.weight}lbs
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <aside className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" aria-hidden="true" />
                    Your Clients ({clients.length})
                  </h2>

                  <div className="mb-4">
                    <label htmlFor="search-client" className="block text-sm font-medium text-gray-600 mb-1">
                      Find & Invite Clients
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="search-client"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                        placeholder="Search by user ID or email..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={searchUsers}
                        disabled={searching || searchQuery.length < 3}
                        className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        aria-label="Search users"
                      >
                        <Search className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Enter at least 3 characters to search</p>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-600 mb-2">Search Results:</p>
                      <ul className="space-y-2">
                        {searchResults.map((user) => (
                          <li key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">{user.displayId}</span>
                            <button
                              onClick={() => sendConnectionRequest(user.id)}
                              disabled={sendingRequest === user.id}
                              className="flex items-center gap-1 px-2 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 disabled:opacity-50"
                            >
                              <Send className="w-3 h-3" aria-hidden="true" />
                              {sendingRequest === user.id ? "Sending..." : "Invite"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sentRequests.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-700 mb-2 flex items-center gap-1">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        Pending Invites ({sentRequests.length})
                      </p>
                      <ul className="space-y-1">
                        {sentRequests.map((req) => (
                          <li key={req.id} className="text-xs text-yellow-600">
                            {req.toUserId.slice(0, 12)}... - waiting for response
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {clients.length === 0 ? (
                    <p className="text-gray-500 text-sm">No clients yet. Add a client using their ID above.</p>
                  ) : (
                    <ul className="space-y-2" role="list" aria-label="Client list">
                      {clients.map((client) => (
                        <li
                          key={client.clientId}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedClient === client.clientId
                              ? "bg-pink-100 border-2 border-pink-500"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          <button
                            onClick={() => fetchClientWorkouts(client.clientId)}
                            className="flex-1 text-left focus:outline-none"
                            aria-pressed={selectedClient === client.clientId}
                          >
                            <span className="font-medium text-gray-700">{client.clientId.slice(0, 8)}...</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeClient(client.clientId);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                            aria-label={`Remove client ${client.clientId.slice(0, 8)}`}
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </aside>

              <main className="lg:col-span-2">
                {!selectedClient ? (
                  <div className="bg-gray-50 rounded-xl p-12 text-center">
                    <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Select a Client</h2>
                    <p className="text-gray-500">Choose a client from the list to view their workout history.</p>
                  </div>
                ) : workoutsLoading ? (
                  <div className="bg-gray-50 rounded-xl p-12 text-center" role="status" aria-label="Loading workouts">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading workouts...</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" aria-hidden="true" />
                      Client Workout History (Read-Only)
                    </h2>

                    {clientWorkouts.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">This client has no recorded workouts yet.</p>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto" role="list" aria-label="Workout history">
                        {clientWorkouts.map((workout) => (
                          <article
                            key={workout.id}
                            className="bg-white rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-100 rounded-lg">
                                  <Dumbbell className="w-5 h-5 text-pink-500" aria-hidden="true" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800">{workout.exerciseName}</h3>
                                  <p className="text-sm text-gray-500">
                                    <time dateTime={workout.date}>{formatDate(workout.date)}</time>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-600">
                                    <strong>{workout.sets}</strong> sets
                                  </span>
                                  <span className="text-gray-600">
                                    <strong>{workout.reps}</strong> reps
                                  </span>
                                  <span className="text-gray-600">
                                    <strong>{workout.weight}</strong> lbs
                                  </span>
                                </div>
                                {workout.notes && (
                                  <p className="text-xs text-gray-400 mt-1">{workout.notes}</p>
                                )}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={async () => {
                          if (!selectedClient) return;
                          const res = await fetchWithAuth(`/api/export/csv?userId=${selectedClient}&requesterId=${user?.uid}`);
                          if (res.ok) {
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `workouts-${selectedClient}-${new Date().toISOString().split("T")[0]}.csv`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            a.remove();
                          } else {
                            const data = await res.json();
                            alert(data.error || "Failed to download CSV");
                          }
                        }}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Download CSV
                      </button>
                      <button
                        onClick={async () => {
                          if (!selectedClient) return;
                          const res = await fetchWithAuth(`/api/export/zip?userId=${selectedClient}&requesterId=${user?.uid}&includePhotos=true`);
                          if (res.ok) {
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `repsnrecord-${selectedClient}-${new Date().toISOString().split("T")[0]}.zip`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            a.remove();
                          } else {
                            const data = await res.json();
                            alert(data.error || "Failed to download ZIP");
                          }
                        }}
                        className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                      >
                        Download ZIP (with photos if allowed)
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700 flex items-center gap-2">
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span>This is a read-only view. Trainers cannot modify client workout data.</span>
                      </p>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
