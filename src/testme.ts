import { FileWizardry } from '@src/file-wizardry';

const fileWizardry = new FileWizardry('cloudinary', {
  cloud_name: '*****',
  api_key: '*******',
  api_secret: '******',
  secure: true,
});
console.log(fileWizardry.getStorage());
