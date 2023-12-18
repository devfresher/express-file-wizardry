import * as storageTypes from './storage';
import * as mimeTypes from './mime';

export { mimeTypes, storageTypes };

export interface UploadOptions {
  formats: mimeTypes.UploadMimeType[];
  fieldName?: string;
  maxSize?: number;
  multiFile?: boolean;
}
