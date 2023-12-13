import express from 'express';
import { FileWizardry } from 'express-file-wizardry';

const app = express();
const fileWizardry = new FileWizardry();

fileWizardry.setStorageType('amazons3', {
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  region: 'your-region',
  bucket: 'your-bucket',
});

app.post('/upload', fileWizardry.uploadFile({ formats: ['image/jpeg', 'image/png'], fieldName: 'image' }), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError.message });
  }
  res.json({ message: 'File uploaded successfully' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
