// Written by: Simranjit Sandhu
// Tested by: Simranjit Sandhu
// Debugged by: Simranjit Sandhu
// Unit test for trainer client-workouts API route

describe('GET /api/trainer/client-workouts', () => {
  it('returns 403 if trainer lacks export permission', async () => {
    await jest.isolateModules(async () => {
      // mock auth to return trainer-1
      jest.doMock('@/lib/auth', () => ({
        getUidFromRequest: async () => 'trainer-1',
        requireAuth: (uid: string | null) => null,
      }));
      // mock postgres queries to produce a trainer role, active client, but permission denied
      const queryMock = jest.fn(async (sql) => {
        if (sql.includes('SELECT role FROM user_roles')) return { rows: [{ role: 'trainer' }] };
        if (sql.includes('WHERE trainer_id = $1 AND client_id = $2 AND status')) return { rows: [{ status: 'active' }] };
        if (sql.includes('SELECT allow_export')) return { rows: [{ allowExport: false }] };
        return { rows: [] };
      });
      jest.doMock('@/lib/postgres', () => ({ query: queryMock }));
      jest.doMock('@/lib/mongodb', () => ({ dbConnect: async () => {} }));
      jest.doMock('@/models/WorkoutDay', () => ({ find: () => ({ sort: () => ({ limit: () => ({ lean: () => Promise.resolve([]) }) }) }) }));

      const { GET } = require('./route');
      const fakeReq = { url: 'http://localhost/api/trainer/client-workouts?trainerId=trainer-1&clientId=user-abc' };
      const res = await GET(fakeReq);
      expect(res.status).toBe(403);
    });
  });

  it('returns 401 if no auth provided', async () => {
    await jest.isolateModules(async () => {
      jest.doMock('@/lib/auth', () => ({
        getUidFromRequest: async () => null,
        requireAuth: (uid: string | null) => {
          if (!uid) return { status: 401, json: async () => ({ error: 'Unauthorized' }) };
          return null;
        },
      }));
      jest.doMock('@/lib/postgres', () => ({ query: async () => ({ rows: [] }) }));
      jest.doMock('@/lib/mongodb', () => ({ dbConnect: async () => {} }));
      jest.doMock('@/models/WorkoutDay', () => ({ find: () => ({ sort: () => ({ limit: () => ({ lean: () => Promise.resolve([]) }) }) }) }));

      const { GET } = require('./route');
      const fakeReq = { url: 'http://localhost/api/trainer/client-workouts?trainerId=trainer-1&clientId=user-abc' };
      const res = await GET(fakeReq);
      expect(res.status).toBe(401);
    });
  });

  it('returns 403 if uid does not match trainerId', async () => {
    await jest.isolateModules(async () => {
      // auth returns different trainer ID than requested
      jest.doMock('@/lib/auth', () => ({
        getUidFromRequest: async () => 'trainer-2',
        requireAuth: (uid: string | null) => null,
      }));
      jest.doMock('@/lib/postgres', () => ({ query: async () => ({ rows: [] }) }));
      jest.doMock('@/lib/mongodb', () => ({ dbConnect: async () => {} }));
      jest.doMock('@/models/WorkoutDay', () => ({ find: () => ({ sort: () => ({ limit: () => ({ lean: () => Promise.resolve([]) }) }) }) }));

      const { GET } = require('./route');
      const fakeReq = { url: 'http://localhost/api/trainer/client-workouts?trainerId=trainer-1&clientId=user-abc' };
      const res = await GET(fakeReq);
      expect(res.status).toBe(403);
    });
  });

  it('returns workouts for trainer when permission allowed', async () => {
    await jest.isolateModules(async () => {
      jest.doMock('@/lib/auth', () => ({
        getUidFromRequest: async () => 'trainer-1',
        requireAuth: (uid: string | null) => null,
      }));
      const mockWorkouts = [
        { date: '2025-11-25', exerciseName: 'Squat', sets: 3, reps: 5, weight: 135 }
      ];
      const queryMock = jest.fn(async (sql) => {
        if (sql.includes('SELECT role FROM user_roles')) return { rows: [{ role: 'trainer' }] };
        if (sql.includes('WHERE trainer_id = $1 AND client_id = $2 AND status')) return { rows: [{ status: 'active' }] };
        if (sql.includes('SELECT allow_export')) return { rows: [{ allowExport: true }] };
        return { rows: [] };
      });
      jest.doMock('@/lib/postgres', () => ({ query: queryMock }));
      jest.doMock('@/lib/mongodb', () => ({ dbConnect: async () => {} }));
      jest.doMock('@/models/WorkoutDay', () => ({ find: () => ({ sort: () => ({ limit: () => ({ lean: () => Promise.resolve(mockWorkouts) }) }) }) }));

      const { GET } = require('./route');
      const fakeReq = { url: 'http://localhost/api/trainer/client-workouts?trainerId=trainer-1&clientId=user-abc' };
      const res = await GET(fakeReq);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(Array.isArray(json)).toBeTruthy();
    });
  });
});

