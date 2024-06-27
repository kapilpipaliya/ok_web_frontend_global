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
