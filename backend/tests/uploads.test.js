const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { pool } = require('../db');

// Create test app
const createTestApp = () => {
  const app = express();
  const cors = require('cors');
  const photosRouter = require('../uploads');

  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(express.json());
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
  app.use((req, _res, next) => { req.user = { id: "00000000-0000-0000-0000-000000000001" }; next(); });
  app.use("/api/photos", photosRouter);

  return app;
};

describe('Photo Upload API', () => {
  let app;
  let testPhotoId;

  beforeAll(() => {
    app = createTestApp();
  });

  afterAll(async () => {
    // Clean up: delete test photos from database
    if (testPhotoId) {
      await pool.query('DELETE FROM photos WHERE id = $1', [testPhotoId]);
    }
    await pool.end();
  });

  describe('POST /api/photos', () => {
    it('should upload a photo successfully', async () => {
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

      // Create a simple test image if it doesn't exist
      try {
        await fs.access(testImagePath);
      } catch {
        await fs.mkdir(path.join(__dirname, 'fixtures'), { recursive: true });
        // Create a minimal valid JPEG (1x1 red pixel)
        const minimalJpeg = Buffer.from([
          0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
          0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
          0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
          0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
          0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
          0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
          0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
          0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
          0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
          0x37, 0xFF, 0xD9
        ]);
        await fs.writeFile(testImagePath, minimalJpeg);
      }

      const response = await request(app)
        .post('/api/photos')
        .attach('photo', testImagePath)
        .field('description', 'Test upload')
        .field('takenAt', new Date().toISOString());

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('file_url');
      expect(response.body).toHaveProperty('thumb_url');
      expect(response.body.description).toBe('Test upload');

      testPhotoId = response.body.id;
    }, 15000);

    it('should reject upload without photo file', async () => {
      const response = await request(app)
        .post('/api/photos')
        .field('description', 'No file upload');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject unsupported file types', async () => {
      const testTxtPath = path.join(__dirname, 'fixtures', 'test.txt');
      await fs.mkdir(path.join(__dirname, 'fixtures'), { recursive: true });
      await fs.writeFile(testTxtPath, 'This is not an image');

      const response = await request(app)
        .post('/api/photos')
        .attach('photo', testTxtPath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/photos', () => {
    it('should fetch all photos for user', async () => {
      const response = await request(app)
        .get('/api/photos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter photos by month', async () => {
      const month = '2025-10';
      const response = await request(app)
        .get(`/api/photos?month=${month}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Verify all returned photos are from the specified month
      response.body.forEach(photo => {
        if (photo.taken_at) {
          const photoMonth = photo.taken_at.substring(0, 7);
          expect(photoMonth).toBe(month);
        }
      });
    });
  });

  describe('DELETE /api/photos/:id', () => {
    it('should delete a photo successfully', async () => {
      if (!testPhotoId) {
        // Skip if no test photo was created
        return;
      }

      const response = await request(app)
        .delete(`/api/photos/${testPhotoId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted successfully');

      // Verify photo is actually deleted
      const checkResponse = await request(app)
        .get('/api/photos');

      const deletedPhoto = checkResponse.body.find(p => p.id === testPhotoId);
      expect(deletedPhoto).toBeUndefined();

      testPhotoId = null; // Clear so afterAll doesn't try to delete again
    });

    it('should return 404 for non-existent photo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/photos/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('Photo Database Integration', () => {
  it('should connect to PostgreSQL database', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toBe(1);
  });

  it('should have photos table with correct schema', async () => {
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'photos'
      ORDER BY ordinal_position
    `);

    const columns = result.rows.map(r => r.column_name);
    expect(columns).toContain('id');
    expect(columns).toContain('user_id');
    expect(columns).toContain('file_url');
    expect(columns).toContain('thumb_url');
    expect(columns).toContain('taken_at');
    expect(columns).toContain('description');
  });
});
