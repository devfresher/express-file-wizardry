import { Request, Response, RequestHandler, NextFunction } from 'express';
import multer, { DiskStorageOptions, FileFilterCallback } from 'multer';
import fs from 'fs';
import aws, { S3 } from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import cloudinary from 'cloudinary';
import cloudinaryStorage from 'multer-storage-cloudinary';
import { UploadOptions, mimeTypes, storage } from '@src/interfaces';
import { CloudinaryOptions } from '@src/@types/multer-storage-cloudinary';
import { CloudinaryStorageTypeOptions } from '@src/interfaces/storage';

/**
 * Handles file uploads with various storage options  .
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
  constructor(initialStorageType: storage.StorageType = 'memory', options?: storage.StorageTypeConfiguration) {
    this.setStorageType(initialStorageType, options);
  }

  /**
   * Retrieve the current storage engine used for file uploads.
   *
   * @public
   * @returns The current Multer storage engine.
   */
  public getStorage = (): multer.StorageEngine => this.storage;

  /**
   * Middleware for handling file uploads.
   *
   * @public
   * @param options - Upload options.
   * @returns Express middleware for handling file uploads.
   */
  public upload = (options: UploadOptions): RequestHandler => {
    const allowMultiple = options.multiFile || false;
    const maxSize = options.maxSize || Infinity;
    const fieldName = options.fieldName || (allowMultiple ? 'uploadFiles' : 'uploadFile');

    let multerUpload: RequestHandler;

    return (req: Request, res: Response, next: NextFunction) => {
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
   * Deletes a file based on the specified storage type and options.
   *
   * @public
   * @param {storage.StorageType} storageType - the type of storage for the file
   * @param {storage.DeletionOptions} option - the options for file deletion based on the storage type
   */
  public deleteFile(storageType: storage.StorageType, option: storage.DeletionOptions) {
    switch (storageType) {
      case 'memory':
        this.deleteFileFromMemory();
        break;
      case 'disk':
        const { path } = option as storage.DiskDeleteOption;
        this.deleteFileFromDisk(path);
        break;
      case 'amazons3':
        if (!option) throw new Error('S3 storage options are required. Provide options for S3 storage.');
        const { key, Bucket: bucket } = option as storage.S3DeleteOption;

        this.deleteFileFromS3(key, bucket);
        break;
      case 'cloudinary':
        if (!option) throw new Error('Cloudinary storage options are required. Provide options for cloudinary storage.');

        const { public_id: publicId } = option as storage.CloudinaryDeleteOption;
        this.deleteFileFromCloudinary(publicId);
        break;
      default:
        throw new Error('Invalid storage type.');
    }
  }

  /**
   * Set the storage type for file uploads.
   *
   * @public
   * @param storageType - Storage type.
   * @param options - Storage options.
   * @returns void
   */
  public setStorageType(storageType: storage.StorageType, options?: storage.StorageTypeConfiguration): void {
    switch (storageType) {
      case 'memory':
        this.setMemoryStorage();
        break;
      case 'disk':
        this.setDiskStorage(options as DiskStorageOptions);
        break;
      case 'amazons3':
        if (!options) throw new Error('S3 storage options are required. Provide options for S3 storage.');

        const { bucket, ...otherS3Options } = options as storage.S3StorageTypeOptions;
        this.setS3Storage(otherS3Options, bucket);
        break;
      case 'cloudinary':
        if (!options) throw new Error('Cloudinary storage options are required. Provide options for cloudinary storage.');

        this.setCloudinaryStorage(options);
        break;
      default:
        throw new Error('Invalid storage type.');
    }
  }

  /**
   * Set the memory storage for file uploads.
   *
   * @private
   * @returns void
   */
  private setMemoryStorage(): void {
    this.storage = multer.memoryStorage();
  }

  /**
   * Deletes a file from memory storage.
   *
   * @private
   * @return {void}
   */
  private deleteFileFromMemory(): void {
    throw new Error('File in memory storage cannot be deleted.');
  }

  /**
   * Set the disk storage for file uploads.
   *
   * @private
   * @param diskStorageOption - Disk storage options.
   * @returns void
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
   * Deletes a file from the disk.
   *
   * @private
   * @param {string} filename - the name of the file to be deleted
   * @param {string} destination - the directory where the file is located (default is 'uploads')
   * @return {Promise<void>} a Promise that resolves with no value upon successful deletion
   */
  private async deleteFileFromDisk(filename: string, destination: string = 'uploads'): Promise<void> {
    const filePath = `${destination}/${filename}`;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Set the Amazon S3 storage for file uploads.
   *
   * @private
   * @param options - Amazon S3 options.
   * @param bucket - S3 bucket name.
   * @returns void
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
   * Deletes a file from S3.
   *
   * @param {string} key - the key of the file to be deleted
   * @return {Promise<void>} a Promise that resolves when the file is deleted
   */
  private async deleteFileFromS3(key: string, bucket: string): Promise<void> {
    const s3 = new S3();
    const params = {
      Bucket: bucket,
      Key: key,
    };

    await s3.deleteObject(params).promise();
  }

  /**
   * Sets up Cloudinary as the storage for file uploads.
   *
   * @remarks
   * This method configures Cloudinary storage using the provided options and folder name (optional).
   *
   * @private
   * @param options - Cloudinary configuration options.
   * @param folder - Optional folder name in Cloudinary where the files will be stored.
   * @returns void
   */
  private setCloudinaryStorage(options: CloudinaryStorageTypeOptions): void {
    cloudinary.v2.config(options);

    const cloudinaryOptions: CloudinaryOptions = {
      cloudinary: cloudinary.v2,
      params: {
        folder: options.folder,
        public_id: (req: Request, file: Express.Multer.File) => Date.now().toString() + '-' + file.originalname,
      },
    };

    this.storage = cloudinaryStorage(cloudinaryOptions);
  }

  /**
   * Deletes a file from Cloudinary.
   *
   * @private
   * @param {string} publicId - the public ID of the file to be deleted
   * @return {Promise<void>} a Promise that resolves when the file is successfully deleted
   */
  private async deleteFileFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.v2.uploader.destroy(publicId);
  }

  /**
   * Filter files based on supported formats.
   *
   * @private
   * @param supportedFormats - Array of supported file formats.
   * @returns Multer file filter callback.
   */
  private fileFilter = (supportedFormats: mimeTypes.UploadMimeType[]) => {
    return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
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
