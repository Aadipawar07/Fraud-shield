# ES Module Migration Guide

## ES Modules in the Backend

The Fraud Shield backend uses ES modules instead of CommonJS. This means:

1. We use `import/export` syntax instead of `require/module.exports`
2. All import statements for local files must include the file extension (`.js`)

## Troubleshooting Common Issues

### Error: "require is not defined in ES module scope"

If you see this error, it means you're using CommonJS syntax in an ES module file:

```
ReferenceError: require is not defined in ES module scope, you can use import instead
```

**Solution:** Replace `require()` with `import` statements:

```javascript
// Change this:
const something = require('./something');

// To this:
import something from './something.js';
```

### Error: "Cannot find module"

If you see an error like this:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...'
```

**Solution:** Make sure to add the `.js` file extension in your import paths:

```javascript
// Change this:
import { something } from './something';

// To this:
import { something } from './something.js';
```

### Error with Database Connection

If you have issues with the database connections when using OpenAI routes:

**Solution:** Use the simplified OpenAI route implementation:

1. In `backend/index.js`, change:
```javascript
import openaiRouter from './routes/openai.js';
```

To:
```javascript
import openaiRouter from './routes/openai.simple.js';
```

This will use a version that doesn't depend on the database.

## Converting Files from CommonJS to ES Modules

When converting files from CommonJS to ES modules:

1. Replace `require()` with `import` statements
2. Replace `module.exports` with `export`/`export default`
3. Add `.js` extension to all local import paths

### Example: Converting a File

```javascript
// Before (CommonJS):
const express = require('express');
const { something } = require('./utilities');

const router = express.Router();

// Code...

module.exports = router;

// After (ES Modules):
import express from 'express';
import { something } from './utilities.js';

const router = express.Router();

// Code...

export default router;
```
