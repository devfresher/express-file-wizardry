import aws from 'aws-sdk';
import cloudinary from 'cloudinary';
import { DiskStorageOptions } from 'multer';

declare type StorageType = 'memory' | 'disk' | 'amazons3' | 'cloudinary';

declare type S3StorageTypeOptions = aws.S3.ClientConfiguration & { bucket: string };

declare type CloudinaryStorageTypeOptions = cloudinary.ConfigOptions & { folder?: string };

declare type StorageTypeConfiguration = S3StorageTypeOptions | DiskStorageOptions | CloudinaryStorageTypeOptions;

declare type S3DeleteOption = {
  Bucket: string;
  key: string;
};

declare type CloudinaryDeleteOption = {
  public_id: string;
};

declare type DiskDeleteOption = {
  path: string;
};
declare type DeletionOptions = S3DeleteOption | CloudinaryDeleteOption | DiskDeleteOption;

export type {
  CloudinaryStorageTypeOptions,
  DiskStorageOptions,
  S3DeleteOption,
  CloudinaryDeleteOption,
  DiskDeleteOption,
  DeletionOptions,
  StorageType,
  StorageTypeConfiguration,
  S3StorageTypeOptions,
};
