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

Very good headless library:
https://github.com/lxsmnsyc/terracotta

Good Emoji Picker:
https://github.com/lxsmnsyc/solid-emoji-

Youtube Player:
https://github.com/ddPn08/ponzu.love/blob/main/src/components/youtube.tsx


OnBoard:
 Shepherd, Intro.js, or React Joyride can be useful for this purpose.
 https://github.com/shepherd-pro/shepherd
 https://github.com/usablica/intro.js
 https://github.com/gilbarbara/react-joyride

 Help Tooltip:
 https://atomiks.github.io/tippyjs/


 good npm package:
 https://www.npmjs.com/package/neogma
 auto generate cypher queries

 official cypher builer:
 https://github.com/neo4j/cypher-builder
 https://www.npmjs.com/package/@neo4j/cypher-builder

 data visualization tool:
 https://www.npmjs.com/package/neo4j-bloom
 https://www.npmjs.com/package/neodash

 query builder:
Visual query builder for Neo4j graph database
https://github.com/Nhogs/popoto/blob/master/src/query/query.js
https://www.npmjs.com/package/sgnm-neo4j?activeTab=code
https://www.npmjs.com/package/@neo4j/graph-schema-utils
https://www.npmjs.com/package/@douglasgabr/cypher-builder
https://www.npmjs.com/package/cypher-query-builder
https://www.npmjs.com/package/typed-cypher-query-builder
https://www.npmjs.com/package/@hammerbot/cypher-query-builder
https://www.npmjs.com/package/typed-neo4j
https://www.npmjs.com/package/neo4j-qb
https://www.npmjs.com/package/@hugoms154/neo4j-selectionset-builder

Simple helper functions:
https://github.com/YizYah/neo-forte
for parsing date:
https://www.npmjs.com/package/@qualitech/qneo4j-helper


use for cypher query:
neogma

good form:
https://modularforms.dev/solid/guides/introduction

good tailwind components:
https://blocks.tremor.so

TODO: rename PreviewContext to ExecutionContext
remove isDesignMode variable

this may be useful:
https://react-spectrum.adobe.com/react-stately/collections.html


Table:
Make it Highly customizable
Add Header Grouping
Add Pagination
Add Filtering
Add Sorting
Add Expanding
Add Row Actions
Add Row Selection
Add Row Grouping
Add Row Details
Add Row Details Expanding
Add Row Details Expanding
Add Column Visibility
Add Column Resizing
Add Column Ordering
Add Column Filtering
Add Column Grouping
Add Column Pinning
Add Column Expanding
Add Column Sorting
Add Column Filtering
Add Column Grouping
Add Column Pinning

Add Component:
TableHeader - if not provided children, take it from the TableRow. just need to add TableHeader component in the tree.
TableBody
TableFooter
Table
TableRow - wrap with Repeter component. For Insert, Delete, Update, need to add saparate component in the TableRow. In the TableRow, add TableCell components`.
TableCell
TableColumn
TableColumnGroup
TableGroup
TableExpand
TableExpandRow
TableExpandColumn
TablePagination
TableFilter
TableSort
TablePin
TableColumnFilter
TableColumnPin
TableColumnSort

Find a good table component libraries:
https://www.npmjs.com/package/@tanstack/react-table
and study the code.
design the full table component that is highly customizable.


data-structure functions:
https://github.com/mimshins/utilityjs/tree/main/src

this type of hooks are useful:
https://github.com/gangnamssal/gnshooks/tree/master


https://remixicon.com


conflicting corvu package with kobalte:
Accordion
Dialog
PopOver
Tooltip


When reset a new super user:
1, create a super user
2. sync components
3. add component properties manuallay.
4. add essential pages.


AI:
https://llama.meta.com/docs/llama-everywhere/running-meta-llama-on-linux/

PowerDnsRestAPI:
https://doc.powerdns.com/authoritative/http-api/index.html

HeadLess Combobox:
https://github.com/crvouga/headless-combobox

Integrate:
https://ark-ui.com/solid/docs/overview/introduction
https://github.com/uNmAnNeR/imaskjs/tree/master/packages/solid-imask#solid-imask-plugin
https://www.solid-ui.com
https://github.com/xbmlz/solid-color
https://github.com/srsholmes/solid-code-input
https://github.com/elite174/solid-simple-datepicker
https://github.com/rnwonder/solid-date-picker
https://github.com/DigiChanges/solid-wizard
https://github.com/alxnddr/solid-monaco


DnD Solutions:
https://discord.com/channels/722131463138705510/722131463889223772/1279381710412316702


get percentage-bar component:
https://github.com/kavindu-mane/react-percentage-bar/tree/main

A collection of common utilities 
https://github.com/samualtnorman/lib/tree/main


very good article about oklch color model:
https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
we can hire them too.

ROADMAP:
Make Charts Support:
https://dragee.github.io/#Chart
CASL is an isomorphic authorization JavaScript library which restricts what resources a given user is allowed to access
https://github.com/stalniy/casl


Start Web Server, open mac terminal and run:
sudo apachectl start

# Testing
make sure app is running at port 3000

Super User Setup:
cp src/cypher/mutate/sync/component_tree/componentTree.yaml .output/server/componentTree.json
npx playwright test tests/auth/superuser/super_user_setup.spec.ts --project=chromium
