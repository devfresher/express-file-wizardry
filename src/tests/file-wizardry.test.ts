/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/no-redeclare */

import express, { Request, Response } from 'express';

import request from 'supertest';

import { FileWizardry, UploadOptions } from '../file-wizardry';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { StorageType } from '../@types/storage';

jest.mock('aws-sdk');
jest.mock('multer-s3');

let app = express();

const fileWizardry = new FileWizardry('memory');

describe('FileWizardry', () => {
  describe('uploadFile', () => {
    beforeEach(() => {
      jest.resetModules();
      app = express();
    });

    describe('Successful File Upload', () => {
      it('should handle file uploads successfully', (done) => {
        const uploadOptions: UploadOptions = {
          formats: ['image/jpeg', 'image/png'],
          fieldName: 'image',
        };

        app.post('/upload', fileWizardry.uploadFile(uploadOptions), (req, res) => {
          const requestWithValidation = req as Request & { fileValidationError?: Error };
          if (requestWithValidation.fileValidationError) {
            return res.status(400).json({ error: requestWithValidation.fileValidationError.message });
          }
          res.json({ message: 'File uploaded successfully' });
        });

        request(app)
          .post('/upload')
          .attach('image', './src/tests/data/img1.png')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.message).toEqual('File uploaded successfully');
            done();
          });
      });
    });

    describe('Invalid File Format', () => {
      it('should handle invalid file format', (done) => {
        const uploadOptions: UploadOptions = {
          formats: ['image/jpeg', 'image/png'],
          fieldName: 'doc',
        };

        app.post('/upload', fileWizardry.uploadFile(uploadOptions), (req, res) => {
          const requestWithValidation = req as Request & { fileValidationError?: Error };
          if (requestWithValidation.fileValidationError) {
            return res.status(400).json({ error: requestWithValidation.fileValidationError.message });
          }
          res.json({ message: 'File uploaded successfully' });
        });

        request(app)
          .post('/upload')
          .attach('doc', './src/tests/data/rptstdholder.pdf')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.error).toContain('Invalid file format');
            done();
          });
      });
    });

    describe('File Size Exceeding Limit', () => {
      it('should handle file size exceeding limit', (done) => {
        const uploadOptions: UploadOptions = {
          formats: ['image/jpeg', 'image/png'],
          fieldName: 'image',
          maxSize: 1,
        };

        app.post('/upload', fileWizardry.uploadFile(uploadOptions), (req, res) => {
          const requestWithValidation = req as Request & { fileValidationError?: Error };

          if (requestWithValidation.fileValidationError) {
            return res.status(400).json({ error: requestWithValidation.fileValidationError.message });
          }
          res.json({ message: 'File uploaded successfully' });
        });

        request(app)
          .post('/upload')
          .attach('image', './src/tests/data/img1.png') // a file larger than the allowed limit
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.error).toContain('File size exceeds the allowed limit');
            done();
          });
      });
    });

    describe('No File Uploaded', () => {
      it('should handle no file upload error', (done) => {
        const uploadOptions: UploadOptions = {
          formats: ['image/jpeg', 'image/png'],
          fieldName: 'image',
          maxSize: 1,
        };

        app.post('/upload', fileWizardry.uploadFile(uploadOptions), (req, res) => {
          const requestWithValidation = req as Request & { fileValidationError?: Error };

          if (requestWithValidation.fileValidationError) {
            return res.status(400).json({ error: requestWithValidation.fileValidationError.message });
          }
          res.json({ message: 'File uploaded successfully' });
        });

        request(app)
          .post('/upload')
          .attach('image', '')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.error).toContain('No file');
            done();
          });
      });
    });

    describe('Invalid Field Name', () => {
      it('should handle invalid field name', (done) => {
        const uploadOptions: UploadOptions = {
          formats: ['image/jpeg', 'image/png'],
          fieldName: 'image',
        };

        app.post('/upload', fileWizardry.uploadFile(uploadOptions), (req, res) => {
          const requestWithValidation = req as Request & { fileValidationError?: Error };

          if (requestWithValidation.fileValidationError) {
            return res.status(400).json({ error: requestWithValidation.fileValidationError.message });
          }
          res.json({ message: 'File uploaded successfully' });
        });

        request(app)
          .post('/upload')
          .attach('images', './src/tests/data/img1.png')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.error).toContain('Unexpected field');
            done();
          });
      });
    });
  });

  describe('setStorageType', () => {
    describe('positive cases', () => {
      it('should change the storageType to memory', () => {
        fileWizardry.setStorageType('memory');
        expect(fileWizardry.getStorage()).toBeInstanceOf(multer.memoryStorage().constructor);
      });
      it('should change the storageType to disk', () => {
        fileWizardry.setStorageType('disk', { destination: './src/tests/data/uploads/folder' });
        expect(fileWizardry.getStorage()).toBeInstanceOf(multer.diskStorage({}).constructor);
      });
      it('should change the storageType to amazonS3', () => {
        const s3Options = { bucket: 'my', region: 'NG' };
        fileWizardry.setStorageType('amazons3', s3Options);
        expect(multerS3).toHaveBeenCalledWith({
          s3: expect.anything(),
          bucket: s3Options.bucket,
          acl: 'public-read',
          contentType: multerS3.AUTO_CONTENT_TYPE,
          key: expect.any(Function),
        });
      });
    });

    describe('negative cases', () => {
      it('should return an error if s3 storage option is not provided', () => {
        const invalidCall = () => fileWizardry.setStorageType('amazons3');
        expect(invalidCall).toThrow('S3 storage options are required. Provide options for S3 storage.');
      });
      it('should return an error if invalid/unsupported storage type is provided', () => {
        const invalidCall = () => fileWizardry.setStorageType('aaa' as unknown as StorageType);
        expect(invalidCall).toThrow('Invalid storage type.');
      });
    });
  });
});
