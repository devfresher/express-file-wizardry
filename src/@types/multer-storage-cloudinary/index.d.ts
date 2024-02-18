import { OptionCallback, Options } from 'multer-storage-cloudinary';

export interface Params {
  public_id?: OptionCallback<string>;
  folder?: string;
}

export interface CloudinaryOptions extends Options {
  params?: Params;
}
