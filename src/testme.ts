import cloudinary from 'cloudinary';
import { FileWizardry } from './file-wizardry';

// const conf = cloudinary.v2.config({
//   cloud_name: 'ds1ryba2h',
//   api_key: '611758137672553',
//   api_secret: 'q7UyBcyxQKArszTD8dcLRt4fCJs',
//   secure: true,
// });

const fileWizardry = new FileWizardry('cloudinary', {
  cloud_name: 'ds1ryba2h',
  api_key: '611758137672553',
  api_secret: 'q7UyBcyxQKArszTD8dcLRt4fCJs',
  secure: true,
});
console.log(fileWizardry.getStorage());

fileWizardry.upload({
  formats: ['image/jpeg', 'image/png', 'image/gif'],
  fieldName: 'upload',
  maxSize: 1024,
});
