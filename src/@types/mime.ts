/* eslint-disable @typescript-eslint/indent */
type TextMimeType = 'text/plain' | 'text/csv' | 'application/javascript' | 'application/json' | 'application/xml';

type DocumentMimeType =
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.ms-excel'
  | 'application/vnd.ms-powerpoint';

type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/svg+xml';

type AudioMimeType = 'audio/mpeg' | 'audio/wav' | 'audio/ogg';

type VideoMimeType = 'video/mp4' | 'video/webm' | 'video/ogg';

type ArchiveMimeType = 'application/zip';

type ApplicationMimeType = 'application/octet-stream' | 'application/xhtml+xml';

export type UploadMimeType = Array<
  TextMimeType | DocumentMimeType | ImageMimeType | AudioMimeType | VideoMimeType | ArchiveMimeType | ApplicationMimeType
>;
