import express, { RequestHandler, NextFunction } from 'express';
import multer, { DiskStorageOptions, FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import { S3StorageTypeOptions, StorageType, StorageTypeConfiguration } from './@types/storage';
import { UploadOptions } from './@types';
import { mimeTypes } from './@types';

/**
 * Handles file uploads with various storage options.
 *
 * @remarks
 * This class provides a flexible and modular approach to handle file uploads in an Express application. It supports different storage types, including memory, disk, and Amazon S3.
 *
 * @public
 * @author Usman Soliu (@devfresher)
 * @version 1.0.0
 */

export class FileWizardry {
  private storage!: multer.StorageEngine;

  /**
   * Constructor for FileMiddleware.
   *
   * @param initialStorageType - Initial storage type.
   * @param options - Storage options.
   */
  constructor(initialStorageType: StorageType = 'memory', options?: StorageTypeConfiguration) {
    this.setStorageType(initialStorageType, options);
  }

  /**
   * Retrieve the current storage engine used for file uploads.
   *
   * @returns The current Multer storage engine.
   */
  public getStorage = (): multer.StorageEngine => this.storage;

  /**
   * Middleware for handling file uploads.
   *
   * @param options - Upload options.
   * @returns Express middleware for handling file uploads.
   */
  public upload = (options: UploadOptions): RequestHandler => {
    const allowMultiple = options.multiFile || false;
    const maxSize = options.maxSize || Infinity;
    const fieldName = options.fieldName || (allowMultiple ? 'uploadFiles' : 'uploadFile');

    let multerUpload: express.RequestHandler;

    return (req: express.Request, res: express.Response, next: NextFunction) => {
      if (allowMultiple) {
        multerUpload = multer({
          storage: this.storage,
          fileFilter: this.fileFilter(options.formats),
          limits: { fileSize: maxSize },
        }).array(fieldName);
      } else {
        multerUpload = multer({
          storage: this.storage,
          fileFilter: this.fileFilter(options.formats),
        }).single(fieldName);
      }

      // Execute Multer middleware
      multerUpload(req, res, (err: any) => {
        if (err) {
          req.fileValidationError = err;
        }

        if (req.fileValidationError) {
          return next();
        }

        const files = allowMultiple ? (req.files as unknown as File[]) : ([req.file] as unknown as File[]);

        if (!files || files.some((file) => !file)) {
          const errorMessage = allowMultiple ? 'No files uploaded.' : 'No file uploaded.';
          req.fileValidationError = new Error(errorMessage);
        } else if (!allowMultiple && maxSize && files[0]?.size > maxSize) {
          const errorMessage = `File size exceeds the allowed limit of ${maxSize} bytes.`;
          req.fileValidationError = new Error(errorMessage);
        }

        return next();
      });
    };
  };

  /**
   * Set the storage type for file uploads.
   *
   * @param storageType - Storage type.
   * @param options - Storage options.
   */
  public setStorageType(storageType: StorageType, options?: StorageTypeConfiguration): void {
    switch (storageType) {
      case 'memory':
        this.setMemoryStorage();
        break;
      case 'disk':
        this.setDiskStorage(options as DiskStorageOptions);
        break;
      case 'amazons3':
        if (!options) throw new Error('S3 storage options are required. Provide options for S3 storage.');

        const { bucket, ...otherS3Options } = options as S3StorageTypeOptions;
        this.setS3Storage(otherS3Options, bucket);
        break;
      default:
        throw new Error('Invalid storage type.');
    }
  }

  /**
   * Set the memory storage for file uploads.
   *
   * @private
   */
  private setMemoryStorage(): void {
    this.storage = multer.memoryStorage();
  }

  /**
   * Set the disk storage for file uploads.
   *
   * @private
   * @param diskStorageOption - Disk storage options.
   */
  private setDiskStorage(diskStorageOption: DiskStorageOptions): void {
    this.storage = multer.diskStorage({
      destination: diskStorageOption && diskStorageOption.destination ? diskStorageOption.destination : 'uploads',
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
      },
    });
  }

  /**
   * Set the Amazon S3 storage for file uploads.
   *
   * @private
   * @param options - Amazon S3 options.
   * @param bucket - S3 bucket name.
   */
  private setS3Storage(options: aws.S3.ClientConfiguration, bucket: string): void {
    const s3 = new S3Client([options]);
    this.storage = multerS3({
      s3,
      bucket,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        cb(null, Date.now().toString() + '-' + file.originalname);
      },
    });
  }

  /**
   * Filter files based on supported formats.
   *
   * @private
   * @param supportedFormats - Array of supported file formats.
   * @returns Multer file filter callback.
   */
  private fileFilter = (supportedFormats: mimeTypes.UploadMimeType) => {
    return (req: express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (!(supportedFormats as string[]).includes(file.mimetype)) {
        const errorMessage = Array.isArray(supportedFormats)
          ? `Invalid file format. Please upload a ${supportedFormats.join(' or ')} file.`
          : `Invalid file format. Please upload a file with one of the following formats: ${supportedFormats}.`;

        req.fileValidationError = new Error(errorMessage);
        return cb(null, false);
      }

      // No errors, accept the file
      return cb(null, true);
    };
  };
}
