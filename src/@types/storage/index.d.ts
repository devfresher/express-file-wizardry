import aws from 'aws-sdk';
import { DiskStorageOptions } from 'multer';

type StorageType = 'memory' | 'disk' | 'amazons3';

type S3StorageTypeOptions = aws.S3.ClientConfiguration & { bucket: string };

type StorageTypeConfiguration = S3StorageTypeOptions | DiskStorageOptions;
