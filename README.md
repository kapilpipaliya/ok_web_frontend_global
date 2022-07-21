## Usage


```bash
npm install
```

## testing

- install cypress using `npm install -g cypress`
- start cypress using `yarn cypress open`

## Available Scripts

- `npm run dev`: Runs the app in the development mode
- `npm run build`: Builds the app for production to the `dist` folder
- `npm run lint`: Find linting errors
- `npm run lint-and-fix`: Fix linting errors in directory
- `npm run prettier-format`: Run prettier formatting in project.

## Deployment

You can deploy the `dist` folder to any static host provider

## Linting

ESLint is configured as following

- Warning on prettier warnings.
<!-- - `id-length`: avoid single letter name -->
- `camelcase`: Use `camelCase` for naming objects, functions, and instances
- `new-cap`: Use `PascalCase` for naming constructor and classes,
- `no-underscore-dangle`: Do not use leading or trailing underscore

## Naming conventions

- File name - A base filename should `exactly match` the name of its default export.
- Export function - Use `camelCase` when you export-default a function.
- Export constructor/class/object - use `PascalCase` when export a constructor/class/object/function library.
- Optionally uppercase const only if it is
  -- Exported
  -- is constant
