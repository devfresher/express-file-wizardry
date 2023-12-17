import express from 'express';
import request from 'supertest';

import multer from 'multer';
import multerS3 from 'multer-s3';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { FileWizardry, UploadOptions, storageTypes } from '../src/';

jest.mock('aws-sdk');
jest.mock('multer-s3');
jest.mock('cloudinary');
jest.mock('multer-storage-cloudinary');

let app: express.Application;

const fileWizardry = new FileWizardry('memory');

beforeEach(() => {
  jest.resetModules();
  app = express();
});

describe('FileWizardry', () => {
  describe('upload', () => {
    const executeUpload = (options: UploadOptions) => {
      app.post('/upload', fileWizardry.upload(options), (req, res) => {
        const requestWithValidation = req as express.Request & { fileValidationError?: Error };

        if (requestWithValidation.fileValidationError) {
          console.log(requestWithValidation.fileValidationError);

          return res.status(400).json({ error: requestWithValidation.fileValidationError.message });
        }

        res.json({ message: 'File uploaded successfully' });
      });
    };

    it('should handle file uploads successfully', (done) => {
      const uploadOptions: UploadOptions = {
        formats: ['image/jpeg', 'image/png'],
        fieldName: 'image',
      };

      executeUpload(uploadOptions);

      request(app)
        .post('/upload')
        .attach('image', './tests/data/img1.png')
        .expect(200, { message: 'File uploaded successfully' }, done);
    });

    it('should handle invalid file format', (done) => {
      const uploadOptions: UploadOptions = {
        formats: ['image/jpeg', 'image/png'],
        fieldName: 'doc',
      };

      executeUpload(uploadOptions);

      request(app)
        .post('/upload')
        .attach('doc', './tests/data/rptstdholder.pdf')
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.error).toContain('Invalid file format');
          done();
        });
    });

    it('should handle file size exceeding limit', (done) => {
      const uploadOptions: UploadOptions = {
        formats: ['image/jpeg', 'image/png'],
        fieldName: 'image',
        maxSize: 1,
      };

      executeUpload(uploadOptions);

      request(app)
        .post('/upload')
        .attach('image', './tests/data/img1.png') // a file larger than the allowed limit
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.error).toMatch(/File too large|File size exceeds the allowed limit/);
          done();
        });
    });

    it('should handle no file upload error', (done) => {
      const uploadOptions: UploadOptions = {
        formats: ['image/jpeg', 'image/png'],
        fieldName: 'image',
        maxSize: 1,
      };

      executeUpload(uploadOptions);
      request(app).post('/upload').attach('image', '').expect(400, { error: 'No file uploaded.' }, done);
    });

    it('should handle invalid field name', (done) => {
      const uploadOptions: UploadOptions = {
        formats: ['image/jpeg', 'image/png'],
        fieldName: 'image',
      };

      executeUpload(uploadOptions);

      request(app)
        .post('/upload')
        .attach('images', './tests/data/img1.png')
        .expect(400, { error: 'Unexpected field' }, done);
    });

    it('handles multiple file uploads successfully', (done) => {
      const uploadOptions: UploadOptions = {
        fieldName: 'files',
        formats: ['image/jpeg', 'image/png'],
        multiFile: true,
      };

      executeUpload(uploadOptions);

      request(app)
        .post('/upload')
        .attach('files', './tests/data/img1.png')
        .attach('files', './tests/data/img1.png')
        .expect(200, { message: 'File uploaded successfully' }, done);
    });
  });

  describe('setStorageType', () => {
    it('changes the storageType to memory', () => {
      fileWizardry.setStorageType('memory');
      expect(fileWizardry.getStorage()).toBeInstanceOf(multer.memoryStorage().constructor);
    });

    it('changes the storageType to disk', () => {
      const destination = './tests/data/uploads/folder' as storageTypes.DiskStorageOptions['destination'];
      fileWizardry.setStorageType('disk', { destination });
      expect(fileWizardry.getStorage()).toBeInstanceOf(multer.diskStorage({}).constructor);
    });

    it('changes the storageType to amazonS3', () => {
      const s3Options = { bucket: 'my', region: 'NG' } as storageTypes.S3StorageTypeOptions;
      fileWizardry.setStorageType('amazons3', s3Options);
      expect(multerS3).toHaveBeenCalledWith({
        s3: expect.anything(),
        bucket: s3Options.bucket,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: expect.any(Function),
      });
    });

    it('changes the storageType to cloudinary', () => {
      const cloudinaryOptions = { cloud_name: 'my-cloud', api_key: 'api-key', api_secret: 'api-secret' };
      const folder = 'uploads/folder';

      fileWizardry.setStorageType('cloudinary', { ...cloudinaryOptions, folder });

      expect(cloudinary.v2.config).toHaveBeenCalledWith(cloudinaryOptions);
      expect(CloudinaryStorage).toHaveBeenCalledWith({
        cloudinary: cloudinary.v2,
        params: {
          folder,
          public_id: expect.any(Function),
        },
      });
    });

    it('throws an error if s3 storage option is not provided', () => {
      expect(() => fileWizardry.setStorageType('amazons3')).toThrow(
        'S3 storage options are required. Provide options for S3 storage.',
      );
    });

    it('throws an error if cloudinary storage option is not provided', () => {
      expect(() => fileWizardry.setStorageType('cloudinary')).toThrow(
        'Cloudinary storage options are required. Provide options for Cloudinary storage.',
      );
    });

    it('throws an error if an invalid/unsupported storage type is provided', () => {
      expect(() => fileWizardry.setStorageType('aaa' as unknown as storageTypes.StorageType)).toThrow(
        'Invalid storage type.',
      );
    });
  });
});
