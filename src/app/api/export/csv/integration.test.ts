describe('Integration: POST /api/workouts -> GET /api/export/csv', () => {
  it('creates a workout and exports a CSV with the row', async () => {
    const created = [];

    // Isolate modules and mock DB
    await jest.isolateModules(async () => {
      jest.doMock('@/lib/mongodb', () => ({ dbConnect: async () => {} }));
      // Avoid importing real mongoose which pulls in ESM-only libraries in tests
      jest.doMock('mongoose', () => ({
        connection: { readyState: 0 },
        connect: async () => {},
        model: () => ({}),
        models: {},
      }));
      jest.doMock('@/lib/auth', () => ({
        getUidFromRequest: async () => 'user-abc',
        requireAuth: (uid: string | null) => null,
      }));
      jest.doMock('@/models/WorkoutDay', () => ({
        find: jest.fn(() => ({ sort: () => ({ lean: () => Promise.resolve(created) }) })),
        create: jest.fn(async (doc) => { created.push(doc); return doc; }),
      }));

      const { POST: postWorkout } = require('../../workouts/route');
      const { GET: getCsv } = require('./route');

      // Simulate POST /api/workouts
      const body = { userId: 'user-abc', date: '2025-11-25', exerciseName: 'Bench', sets: 3, reps: 5, weight: 95 };
      const fakePostReq = { json: async () => body };
      const postRes = await postWorkout(fakePostReq);
      // postRes should be a NextResponse with status 201
      expect(postRes.status).toBe(201);

      // Mock find to return the created workout
      const WorkoutDay = require('@/models/WorkoutDay');
      WorkoutDay.find.mockReturnValue({ sort: () => ({ lean: () => Promise.resolve([body]) }) });

      // GET CSV
      const fakeGetReq = { url: 'http://localhost/api/export/csv?userId=user-abc' };
      const csvRes = await getCsv(fakeGetReq);
      expect(csvRes.status).toBe(200);
      const csvText = await csvRes.text();
      expect(csvText).toContain('Date,Exercise,Sets,Reps,Weight,Notes');
      // Date should be formatted as MM/DD/YYYY
      expect(csvText).toContain('11/25/2025');
      expect(csvText).toContain('Bench');
    });
  });
});
