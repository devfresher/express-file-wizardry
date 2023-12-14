import aws from 'aws-sdk';
import { DiskStorageOptions } from 'multer';

export type StorageType = 'memory' | 'disk' | 'amazons3';

export type S3StorageTypeOptions = aws.S3.ClientConfiguration & { bucket: string };

export type StorageTypeConfiguration = S3StorageTypeOptions | DiskStorageOptions;
