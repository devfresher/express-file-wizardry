import aws from 'aws-sdk';
import cloudinary from 'cloudinary';
import { DiskStorageOptions } from 'multer';
import { Options } from 'multer-storage-cloudinary';

export type StorageType = 'memory' | 'disk' | 'amazons3' | 'cloudinary';

export type S3StorageTypeOptions = aws.S3.ClientConfiguration & { bucket: string };

export type CloudinaryStorageTypeOptions = cloudinary.ConfigOptions & { folder?: string };

export type StorageTypeConfiguration = S3StorageTypeOptions | DiskStorageOptions | CloudinaryStorageTypeOptions;

export type { DiskStorageOptions };
