import { GET } from './route';

// Mock the query function before importing route
jest.mock('@/lib/postgres');

import { query } from '@/lib/postgres';

describe('User Search API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array if query too short', async () => {
    const req = new Request('http://localhost/api/users/search?q=ab&searcherId=trainer-1');
    const res = await GET(req);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it('should search across multiple tables', async () => {
    const mockQuery = query as jest.MockedFunction<typeof query>;
    
    // Mock existing clients query
    // @ts-expect-error Mock object missing QueryResult fields
    mockQuery.mockResolvedValueOnce({ rows: [] });
    
    // Mock pending requests query
    // @ts-expect-error Mock object missing QueryResult fields
    mockQuery.mockResolvedValueOnce({ rows: [] });
    
    // Mock user search query - this should combine results from multiple tables
    // @ts-expect-error Mock object missing QueryResult fields
    mockQuery.mockResolvedValueOnce({
      rows: [
        { user_id: 'user-demo-1' },
        { user_id: 'user-demo-2' },
      ],
    });

    const req = new Request('http://localhost/api/users/search?q=demo&searcherId=trainer-1');
    const res = await GET(req);
    const data = await res.json();

    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({
      id: 'user-demo-1',
      displayId: 'user-demo-1' + '...',
    });
    expect(data[1]).toEqual({
      id: 'user-demo-2',
      displayId: 'user-demo-2' + '...',
    });
  });

  it('should exclude existing clients, pending requests, and searcher', async () => {
    const mockQuery = query as jest.MockedFunction<typeof query>;
    
    // Mock existing clients query
    // @ts-expect-error Mock object missing QueryResult fields
    mockQuery.mockResolvedValueOnce({
      rows: [{ client_id: 'user-demo-1' }],
    });
    
    // Mock pending requests query
    // @ts-expect-error Mock object missing QueryResult fields
    mockQuery.mockResolvedValueOnce({
      rows: [{ to_user_id: 'user-demo-2' }],
    });
    
    // Mock user search query
    // @ts-expect-error Mock object missing QueryResult fields
    mockQuery.mockResolvedValueOnce({
      rows: [
        { user_id: 'trainer-1' },
        { user_id: 'user-demo-1' },
        { user_id: 'user-demo-2' },
        { user_id: 'user-demo-3' },
      ],
    });

    const req = new Request('http://localhost/api/users/search?q=demo&searcherId=trainer-1');
    const res = await GET(req);
    const data = await res.json();

    // Should only include user-demo-3
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('user-demo-3');
  });

  it('should limit results to 10', async () => {
    const mockQuery = query as jest.MockedFunction<typeof query>;
    
    // @ts-expect-error Mock object missing QueryResult fields
    mockQuery.mockResolvedValueOnce({ rows: [] });
    // @ts-expect-error Mock object missing QueryResult fields
    mockQuery.mockResolvedValueOnce({ rows: [] });
    
    // Mock 15 users
    const users = Array.from({ length: 15 }, (_, i) => ({
      user_id: `user-demo-${i}`,
    }));
    // @ts-expect-error Mock object missing QueryResult fields
    mockQuery.mockResolvedValueOnce({ rows: users });

    const req = new Request('http://localhost/api/users/search?q=demo&searcherId=trainer-1');
    const res = await GET(req);
    const data = await res.json();

    expect(data).toHaveLength(10);
  });

  it('should handle query errors gracefully', async () => {
    const mockQuery = query as jest.MockedFunction<typeof query>;
    mockQuery.mockRejectedValueOnce(new Error('Database error'));

    const req = new Request('http://localhost/api/users/search?q=demo&searcherId=trainer-1');
    const res = await GET(req);
    const data = await res.json();

    expect(data).toEqual([]);
  });
});
