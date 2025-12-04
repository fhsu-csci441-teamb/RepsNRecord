import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PicturesPage from '../page';

// Mock the AuthGuard component
jest.mock('@/components/AuthGuard', () => {
  return function MockAuthGuard({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('PicturesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title and month selector', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<PicturesPage />);

    expect(screen.getByText(/Progress Photos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload/i)).toBeInTheDocument();
  });

  it('fetches and displays photos on mount', async () => {
    const mockPhotos = [
      {
        id: '1',
        file_url: '/uploads/test1.jpg',
        thumb_url: '/uploads/test1.thumb.jpg',
        description: 'Test photo 1',
        taken_at: '2025-10-15T12:00:00Z',
        created_at: '2025-10-15T12:00:00Z',
      },
      {
        id: '2',
        file_url: '/uploads/test2.jpg',
        thumb_url: '/uploads/test2.thumb.jpg',
        description: 'Test photo 2',
        taken_at: '2025-10-20T12:00:00Z',
        created_at: '2025-10-20T12:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPhotos,
    });

    render(<PicturesPage />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    expect(global.fetch).toHaveBeenCalled();
  });

  it('displays "No photos" message when no photos are available', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<PicturesPage />);

    await waitFor(() => {
      expect(screen.getByText(/No photos for this month/i)).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Server Error',
    });

    render(<PicturesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  it('filters photos by selected month', async () => {
    const mockPhotos = [
      {
        id: '1',
        file_url: '/uploads/test1.jpg',
        thumb_url: '/uploads/test1.thumb.jpg',
        description: 'October photo',
        taken_at: '2025-10-15T12:00:00Z',
        created_at: '2025-10-15T12:00:00Z',
      },
      {
        id: '2',
        file_url: '/uploads/test2.jpg',
        thumb_url: '/uploads/test2.thumb.jpg',
        description: 'November photo',
        taken_at: '2025-11-15T12:00:00Z',
        created_at: '2025-11-15T12:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPhotos,
    });

    render(<PicturesPage />);

    // Wait for initial render
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Change month selector
    const monthInput = screen.getByLabelText(/Month/i) as HTMLInputElement;
    fireEvent.change(monthInput, { target: { value: '2025-11' } });

    // Verify fetch was called again with new month
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('month=2025-11')
      );
    });
  });

  it('shows uploading state during file upload', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: '3',
          file_url: '/uploads/new.jpg',
          thumb_url: '/uploads/new.thumb.jpg',
          description: 'Progress photo',
          taken_at: '2025-10-15T12:00:00Z',
          created_at: '2025-10-15T12:00:00Z',
        }),
      });

    render(<PicturesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Upload/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Upload/i) as HTMLInputElement;
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Should show uploading message briefly
    await waitFor(() => {
      expect(screen.queryByText(/Uploading/i)).toBeInTheDocument();
    });
  });
});

describe('Photo Upload Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates FormData with correct fields on upload', async () => {
    const mockFormData = jest.fn();
    global.FormData = jest.fn(() => ({
      append: mockFormData,
      delete: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
      has: jest.fn(),
      set: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      forEach: jest.fn(),
      [Symbol.iterator]: jest.fn(),
    })) as unknown as typeof FormData;

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: '1',
          file_url: '/test.jpg',
          thumb_url: '/test.thumb.jpg',
          description: 'Progress photo',
          taken_at: '2025-10-15T12:00:00Z',
          created_at: '2025-10-15T12:00:00Z',
        }),
      });

    render(<PicturesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Upload/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Upload/i) as HTMLInputElement;
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockFormData).toHaveBeenCalledWith('photo', expect.any(File));
      expect(mockFormData).toHaveBeenCalledWith('takenAt', expect.any(String));
      expect(mockFormData).toHaveBeenCalledWith('description', 'Progress photo');
    });
  });
});
