import express from 'express';
import { FileWizardry } from 'express-file-wizardry';

const app = express();
const fileWizardry = new FileWizardry();

// Set the storage type (memory, disk, or amazons3)
fileWizardry.setStorageType('memory');

// Middleware for handling multiple file uploads
const uploadMiddleware = fileWizardry.uploadFile({
  formats: ['image/jpeg', 'image/png'],
  fieldName: 'images',
  multiFile: true,
});

// Route for handling multiple file uploads
app.post('/upload-multiple', uploadMiddleware, (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError.message });
  }

  // Handle successful multiple file uploads
  const uploadedFiles = req.files as Express.Multer.File[];
  res.json({ message: 'Files uploaded successfully', files: uploadedFiles });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
