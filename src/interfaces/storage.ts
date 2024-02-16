import aws from 'aws-sdk';
import cloudinary from 'cloudinary';
import { DiskStorageOptions } from 'multer';

declare type StorageType = 'memory' | 'disk' | 'amazons3' | 'cloudinary';

declare type S3StorageTypeOptions = aws.S3.ClientConfiguration & { bucket: string };

declare type CloudinaryStorageTypeOptions = cloudinary.ConfigOptions & { folder?: string };

declare type StorageTypeConfiguration = S3StorageTypeOptions | DiskStorageOptions | CloudinaryStorageTypeOptions;

export type {
  DiskStorageOptions,
  StorageType,
  StorageTypeConfiguration,
  S3StorageTypeOptions,
  CloudinaryStorageTypeOptions,
};
