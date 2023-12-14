# express-file-wizardry

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

`express-file-wizardry` is an Express middleware for handling file uploads with support for different storage types including memory, disk, and Amazon S3.

## Why express-file-wizardry

- **Simplified Configuration:** `express-file-wizardry` provides a straightforward API for handling file uploads with various storage options. Whether you prefer `in-memory storage`, `local disk storage`, or `cloud storage` with services like `Amazon S3`, `Google cloud (upcoming)`, the configuration is simplified, allowing you to focus on your application logic.

- **Modularity and Separation of Concerns:** The package is designed with modularity in mind, separating concerns such as storage configuration, file filtering, and middleware setup. This makes the codebase clean, maintainable, and easy to extend.

- **Versatile File Type Support:** You can easily define the allowed file formats for uploads, ensuring that your application only accepts the types of files you expect. The package supports a wide range of file types, from images to documents and archives.

- **Flexible Storage Options:** Choose the storage type that best fits your application requirements. Whether you need fast in-memory storage for temporary files, local disk storage for persistent storage, or Amazon S3 for scalable cloud storage, `express-file-wizardry` has you covered.

## Table of Contents

- [Installation](#installation)
- [Usage: JavaScript (CommonJS)](#usage-javascript-commonjs)
- [Usage: TypeScript (ESM)](#usage-typescript-esm)
- [API](#api)
- [Examples](#examples)
- [Future Enhancements / To-Do](#future-enhancements--to-do)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the package using npm:

```bash
npm install express-file-wizardry
```

## Usage: JavaScript (CommonJS)

``` javascript
const express = require('express');
const { FileWizardry } = require('express-file-wizardry');

const app = express();

const fileWizardry = new FileWizardry();

// Use memory storage (default)
fileWizardry.setStorageType('memory');

// Alternatively, use disk storage (default destination: 'uploads')
// fileWizardry.setStorageType('disk', { destination: '/path/to/upload/folder' });


// Or use Amazon S3 storage
// fileWizardry.setStorageType('amazons3', { accessKeyId: 'your-access-key', secretAccessKey:   'your-secret-key', region: 'your-region', bucket: 'your-bucket' });

// Middleware for handling file uploads
app.post('/upload', fileWizardry.uploadFile({ formats: ['image/jpeg', 'image/png'], fieldName: 'image' }), (req, res) => {

    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError.message });
    }

    // Handle successful upload
    res.json({ message: 'File uploaded successfully' });
    });

    app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

## Usage: TypeScript (ESM)

``` typescript
import express from 'express';
import { FileWizardry } from 'express-file-wizardry';

const app = express();

const fileWizardry = new FileWizardry();

// Use memory storage (default)
fileWizardry.setStorageType('memory');

// Alternatively, use disk storage (default destination: 'uploads')
// fileWizardry.setStorageType('disk', { destination: '/path/to/upload/folder' });

// Or use Amazon S3 storage
// fileWizardry.setStorageType('amazons3', { accessKeyId: 'your-access-key', secretAccessKey: 'your-secret-key', region: 'your-region', bucket: 'your-bucket' });

// Middleware for handling file uploads
app.post('/upload', fileWizardry.uploadFile({ formats: ['image/jpeg', 'image/png'], fieldName: 'image' }), (req, res) => {

    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError.message });
    }

    // Handle successful upload
    res.json({ message: 'File uploaded successfully' });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

## API

`FileWizardry`

`constructor(initialStorageType?: StorageType, options?: StorageTypeConfiguration)`

- `initialStorageType` (optional): Initial storage type. Default is 'memory'.
- `options` (optional): Storage options.

`uploadFile(options: UploadOptions): RequestHandler`
Middleware for handling file uploads.

- `options`: Upload options.
  - `storageType` (optional): Storage type.
  - `formats`: Array of allowed file formats.
  - `fieldName` (optional): Name of the field in the request.
  - `maxSize` (optional): Maximum file size in bytes.

`setStorageType(storageType: StorageType, options?: StorageTypeConfiguration): void`
Set the storage type for file uploads.

- `storageType`: Storage type ('memory', 'disk', or 'amazons3').
- `options`: Storage options.

## Examples

For more examples, check the [examples](/examples/) directory.

## Future Enhancements / To-Do

Feel free to contribute to the improvement of `express-file-wizardry` by working on or suggesting the following enhancements:

- **Advanced File Filtering:** Enhance file filtering capabilities to support more advanced filtering options such as file size ranges, mime type checking, etc.

- **Middleware Options:** Provide additional options for middleware configuration to offer more flexibility to users.

- **More Storage Options:** Explore additional storage options based on user demand or emerging technologies.

If you have any suggestions or would like to contribute, feel free to open an issue or submit a pull request.

## Contributing

Please contact `fresher.dev01@gmail.com` if you're interested.
Contributions are welcome! See [CONTRIBUTING.md](/CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/licenses/MIT) file for details.

## Credits

This project uses the fantastic [multer-S3](https://www.npmjs.com/package/multer-s3) library for Amazon S3 storage. Special thanks to its author for their valuable contribution to the Node.js community.

- **Linus Unnebäck:** [LinusU](https://github.com/LinusU)
