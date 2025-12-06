describe('GET /api/progress', () => {
  it('returns monthly counts for the requested year', async () => {
    await jest.isolateModules(async () => {
      const mockWorkouts = [
        { date: '2025-11-01' },
        { date: '2025-11-10' },
        { date: '2025-10-05' },
      ];

      jest.doMock('@/lib/mongodb', () => ({ dbConnect: async () => {} }));
      jest.doMock('@/models/WorkoutDay', () => ({
        find: jest.fn(() => ({ select: () => ({ lean: () => Promise.resolve(mockWorkouts) }) }))
      }));

      const { GET } = require('./route');
      const fakeReq = { url: 'http://localhost/api/progress?userId=user-123&year=2025' };
      const res = await GET(fakeReq);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      // Should include counts for Oct and Nov
      const nov = data.find((d) => d.month === 'Nov');
      const oct = data.find((d) => d.month === 'Oct');
      expect(nov.count).toBe(2);
      expect(oct.count).toBe(1);
    });
  });
});
