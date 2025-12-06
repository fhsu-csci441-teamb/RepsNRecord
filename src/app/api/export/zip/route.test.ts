describe('GET /api/export/zip', () => {
  it('returns a zip buffer with workouts.csv and photos manifest (mocked)', async () => {
    await jest.isolateModules(async () => {
      const mockPhotos = [
        { id: 'p1', fileUrl: 'http://example.com/p1.jpg', thumbUrl: '/uploads/p1.thumb.jpg', mimeType: 'image/jpeg', description: 'desc', takenAt: '2025-11-25', createdAt: new Date().toISOString() }
      ];
      const mockWorkouts = [
        { date: '2025-11-25', exerciseName: 'Squat', sets: 3, reps: 5, weight: 135, notes: '' }
      ];

      jest.doMock('@/lib/auth', () => ({
        getUidFromRequest: async () => 'test-user-123',
        requireAuth: (uid: string | null) => null,
      }));
      jest.doMock('@/lib/postgres', () => ({
        query: jest.fn(async (sql, params) => ({ rows: mockPhotos }))
      }));
      // Mock archiver to avoid streaming and node stream compatibility issues in jsdom
      jest.doMock('archiver', () => {
        return function archiverMock() {
          const listeners: Record<string, Function[]> = { data: [], end: [], error: [] };
          const chunks: Buffer[] = [];
          return {
            on(event: string, cb: Function) {
              listeners[event] = listeners[event] || [];
              listeners[event].push(cb);
            },
            append(data: any, _opts: any) {
              const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
              chunks.push(buf);
            },
            finalize() {
              // Emit all chunks and end using setTimeout as setImmediate may not be available
              setTimeout(() => {
                for (const c of chunks) {
                  for (const cb of listeners['data'] || []) cb(c);
                }
                for (const cb of listeners['end'] || []) cb();
              }, 0);
            }
          };
        };
      });

      jest.doMock('@/lib/mongodb', () => ({ dbConnect: async () => {} }));
      jest.doMock('@/models/WorkoutDay', () => ({
        find: jest.fn(() => ({ sort: () => ({ lean: () => Promise.resolve(mockWorkouts) }) }))
      }));

      global.fetch = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => Buffer.from('FAKEIMAGE') });

      const { GET } = require('./route');
      const fakeReq = { url: 'http://localhost/api/export/zip?userId=test-user-123&includePhotos=true' };
      const res = await GET(fakeReq);
      expect(res.status).toBe(200);
      expect(res.headers['Content-Type'] || res.headers['content-type']).toBe('application/zip');
      const buf = await res.arrayBuffer();
      expect(buf.length).toBeGreaterThan(0);
    });
  });

  it('does not fetch photos when trainer permission disallows photos', async () => {
    await jest.isolateModules(async () => {
      const mockPhotos = [
        { id: 'p1', fileUrl: 'http://example.com/p1.jpg', thumbUrl: '/uploads/p1.thumb.jpg', mimeType: 'image/jpeg', description: 'desc', takenAt: '2025-11-25', createdAt: new Date().toISOString() }
      ];
      const mockWorkouts = [
        { date: '2025-11-25', exerciseName: 'Squat', sets: 3, reps: 5, weight: 135, notes: '' }
      ];

      jest.doMock('@/lib/auth', () => ({
        getUidFromRequest: async () => 'trainer-1',
        requireAuth: (uid: string | null) => null,
      }));
      const queryMock = jest.fn(async (sql, params) => {
        if (sql.includes('SELECT role FROM user_roles')) return { rows: [{ role: 'trainer' }] };
        if (sql.includes('FROM trainer_permissions')) return { rows: [{ allowExport: true, allowPhotos: false }] };
        // photos query should still return rows (but we should not attempt to fetch them)
        if (sql.includes('FROM photos')) return { rows: mockPhotos };
        return { rows: [] };
      });
      jest.doMock('@/lib/postgres', () => ({ query: queryMock }));
      // Mock archiver
      jest.doMock('archiver', () => {
        return function archiverMock() {
          const listeners: Record<string, Function[]> = { data: [], end: [], error: [] };
          const chunks: Buffer[] = [];
          return {
            on(event: string, cb: Function) {
              listeners[event] = listeners[event] || [];
              listeners[event].push(cb);
            },
            append(data: any, _opts: any) {
              const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
              chunks.push(buf);
            },
            finalize() {
              setTimeout(() => {
                for (const c of chunks) {
                  for (const cb of listeners['data'] || []) cb(c);
                }
                for (const cb of listeners['end'] || []) cb();
              }, 0);
            }
          };
        };
      });

      jest.doMock('@/lib/mongodb', () => ({ dbConnect: async () => {} }));
      jest.doMock('@/models/WorkoutDay', () => ({
        find: jest.fn(() => ({ sort: () => ({ lean: () => Promise.resolve(mockWorkouts) }) }))
      }));

      global.fetch = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => Buffer.from('FAKEIMAGE') });

      const { GET } = require('./route');
      const fakeReq = { url: 'http://localhost/api/export/zip?userId=test-user-123&requesterId=trainer-1&includePhotos=true' };
      const res = await GET(fakeReq);
      expect(res.status).toBe(200);
      // Since allowPhotos is false, we shouldn't have attempted to fetch photo content
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

