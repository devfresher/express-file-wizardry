import { FileWizardry } from '@src/file-wizardry';

const fileWizardry = new FileWizardry('cloudinary', {
  cloud_name: 'ds1ryba2h',
  api_key: '611758137672553',
  api_secret: 'q7UyBcyxQKArszTD8dcLRt4fCJs',
  secure: true,
});
console.log(fileWizardry.getStorage());
