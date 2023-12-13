import express from 'express';
import { FileWizardry } from 'express-file-wizardry';

const app = express();
const fileWizardry = new FileWizardry();

fileWizardry.setStorageType('memory');

app.post(
  '/upload',
  fileWizardry.uploadFile({ formats: ['image/jpeg', 'image/png', 'application/pdf'], fieldName: 'file' }),
  (req, res) => {
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError.message });
    }
    res.json({ message: 'File uploaded successfully' });
  },
);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
