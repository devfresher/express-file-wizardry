declare type TextMimeType = 'text/plain' | 'text/csv' | 'application/javascript' | 'application/json' | 'application/xml';

declare type DocumentMimeType =
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.ms-excel'
  | 'application/vnd.ms-powerpoint';

declare type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/svg+xml';

declare type AudioMimeType = 'audio/mpeg' | 'audio/wav' | 'audio/ogg';

declare type VideoMimeType = 'video/mp4' | 'video/webm' | 'video/ogg';

declare type ArchiveMimeType = 'application/zip';

declare type ApplicationMimeType = 'application/octet-stream' | 'application/xhtml+xml';

export type UploadMimeType =
  | TextMimeType
  | DocumentMimeType
  | ImageMimeType
  | AudioMimeType
  | VideoMimeType
  | ArchiveMimeType
  | ApplicationMimeType;
