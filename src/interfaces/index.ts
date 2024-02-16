import * as storage from '@src/interfaces/storage';
import * as mimeTypes from '@src/interfaces/mime';

export { mimeTypes, storage };

export interface UploadOptions {
  /**
   * Array of supported MIME types for upload.
   * These MIME types determine the file formats that can be uploaded.
   */
  formats: mimeTypes.UploadMimeType[];

  /**
   * Optional: Field name for the file input in the request.
   * If provided, the middleware will look for files under this field name in the incoming request.
   * If not uploadFile will be expected and uploadFiles if multiFile is enabled
   */
  fieldName?: string;

  /**
   * Optional: Maximum allowed size for each uploaded file, in bytes.
   * If specified, files exceeding this size will be rejected.
   */
  maxSize?: number;

  /**
   * Optional: Flag indicating whether multiple files can be uploaded in a single request.
   * If set to true, the middleware will handle multiple files under the same field name.
   */
  multiFile?: boolean;
}
