## Building

Solid apps are built with _presets_, which optimise your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.


// Circular dependency : npx madge --circular  --extensions ts,tsx src

Notes:
we are using two libraries:
expression-eval => jsep (for +,-) => jsonata(filter, projection)

To find all files in your codebase whose line count is greater than 400, you can use the following command:
find . -type f -exec sh -c 'wc -l "$0" | awk "{if (\$1 > 400) print \$0}"' {} \;


Note: When the page is loaded server side, the client side will not run this again,
so set state inside it will not set when page is reloaded.

problem with conflicts in transactions:
https://stackoverflow.com/questions/77824245/problem-with-cannot-resolve-conflicting-transactions-error-in-memgraph
https://memgraph.com/docs/help-center/errors/transactions#conflicting-transaction


Great hooks:
https://primitives.solidjs.community/package/memo#createLatest


To fix eslint errors:
npx eslint --fix src

Node:
in master css have to write position:absolute full.

Note:
when lastpass auto fill the fields, it is giving errors in development on cleanup of component.

Grid:
<div class="display:grid grid-template-cols:repeat(2,1fr) gap:16">

Scrollbar color:
It accept two colors, neeed to fix the css in code.

Note:
createdResource caled Two times, making API Calles two times, so used onMount

# Playwright commands:
npx playwright test
npx playwright show-report

npx playwright test
Runs the end-to-end tests.

npx playwright test --ui
Starts the interactive UI mode.

npx playwright test --project=chromium
Runs the tests only on Desktop Chrome.

npx playwright test example
Runs the tests in a specific file.

npx playwright test --debug
Runs the tests in debug mode.

npx playwright codegen
Auto generate tests with Codegen.


Note:
Neo4j Session Management: 
Proper session management is crucial in database operations to prevent resource leaks. The session is closed in a finally block to ensure it is always closed, even if an error occurs.
