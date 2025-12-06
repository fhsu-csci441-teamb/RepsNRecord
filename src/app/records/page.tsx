"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import AuthGuard from "@/components/AuthGuard";
import { Trophy, Award, Star, TrendingUp, Dumbbell } from "lucide-react";

interface PersonalRecord {
  id: number;
  exerciseName: string;
  recordType: string;
  value: number;
  achievedAt: string;
}

const BADGE_COLORS: { [key: string]: { bg: string; text: string; icon: string } } = {
  max_weight: { bg: "bg-gradient-to-r from-yellow-400 to-orange-500", text: "text-white", icon: "gold" },
  max_reps: { bg: "bg-gradient-to-r from-blue-400 to-purple-500", text: "text-white", icon: "blue" },
  max_volume: { bg: "bg-gradient-to-r from-green-400 to-teal-500", text: "text-white", icon: "green" },
};

const RECORD_TYPE_LABELS: { [key: string]: string } = {
  max_weight: "Heaviest Lift",
  max_reps: "Most Reps",
  max_volume: "Highest Volume",
};

export default function RecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedRecords, setGroupedRecords] = useState<{ [key: string]: PersonalRecord[] }>({});

  useEffect(() => {
    if (user?.uid) {
      fetchRecords();
    }
  }, [user]);

  const fetchRecords = async () => {
    try {
      const res = await fetch(`/api/personal-records?userId=${user?.uid}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
        
        const grouped = data.reduce((acc: { [key: string]: PersonalRecord[] }, record: PersonalRecord) => {
          if (!acc[record.exerciseName]) {
            acc[record.exerciseName] = [];
          }
          acc[record.exerciseName].push(record);
          return acc;
        }, {});
        setGroupedRecords(grouped);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getBadgeIcon = (recordType: string) => {
    switch (recordType) {
      case "max_weight":
        return <Trophy className="w-6 h-6" aria-hidden="true" />;
      case "max_reps":
        return <Star className="w-6 h-6" aria-hidden="true" />;
      case "max_volume":
        return <TrendingUp className="w-6 h-6" aria-hidden="true" />;
      default:
        return <Award className="w-6 h-6" aria-hidden="true" />;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="w-8 h-8 text-yellow-500" aria-hidden="true" />
              <h1 className="text-3xl font-bold text-gray-800">Personal Records</h1>
            </div>

            {loading ? (
              <div className="text-center py-12" role="status" aria-label="Loading records">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your records...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12" role="status">
                <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Personal Records Yet</h2>
                <p className="text-gray-500">Start logging workouts to track your personal bests!</p>
              </div>
            ) : (
              <div className="space-y-8" role="list" aria-label="Personal records by exercise">
                {Object.entries(groupedRecords).map(([exercise, exerciseRecords]) => (
                  <section 
                    key={exercise} 
                    className="bg-gray-50 rounded-xl p-6"
                    aria-labelledby={`exercise-${exercise.replace(/\s+/g, '-')}`}
                  >
                    <h2 
                      id={`exercise-${exercise.replace(/\s+/g, '-')}`}
                      className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"
                    >
                      <Dumbbell className="w-5 h-5 text-pink-500" aria-hidden="true" />
                      {exercise}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list">
                      {exerciseRecords.map((record) => (
                        <article
                          key={record.id}
                          className={`${BADGE_COLORS[record.recordType]?.bg || "bg-gray-400"} rounded-xl p-4 ${BADGE_COLORS[record.recordType]?.text || "text-white"} shadow-lg transform hover:scale-105 transition-transform`}
                          role="listitem"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getBadgeIcon(record.recordType)}
                            <span className="font-semibold text-sm">
                              {RECORD_TYPE_LABELS[record.recordType] || record.recordType}
                            </span>
                          </div>
                          <div className="text-3xl font-bold mb-1">
                            {record.value}
                            <span className="text-lg ml-1">
                              {record.recordType === "max_weight" ? "lbs" : record.recordType === "max_reps" ? "reps" : ""}
                            </span>
                          </div>
                          <div className="text-sm opacity-80">
                            <time dateTime={record.achievedAt}>
                              {formatDate(record.achievedAt)}
                            </time>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">How PRs are tracked:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                  <span><strong>Heaviest Lift:</strong> Your maximum weight for each exercise</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-500" aria-hidden="true" />
                  <span><strong>Most Reps:</strong> Your highest rep count in a single set</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" aria-hidden="true" />
                  <span><strong>Highest Volume:</strong> Sets x Reps x Weight</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
