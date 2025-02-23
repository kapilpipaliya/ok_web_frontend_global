Section Links:
http://localhost:3000/admin/UserSettings
http://localhost:3000/admin/GlobalSettings
http://localhost:3000/admin/
http://localhost:3000/admin/Page

##Development
# Getting Started Neo4j
https://neo4j.com/docs/getting-started/whats-neo4j/

# Neo4j Browser
To access the Neo4j Browser, navigate to: [http://localhost:7474/browser/](http://localhost:7474/browser/)

# Cypher Manual
https://neo4j.com/docs/getting-started/cypher-intro/resources/

# JavaScript Driver Manual
https://neo4j.com/docs/javascript-manual/current/

# Neo4j Multiple database in community edition
https://github.com/neo4j/neo4j/issues/12920
https://dozerdb.org

uncomment this in neo4j.conf
server.default_listen_address=0.0.0.0
     auth.basic("neo4j", "12345678"),

http://localhost:3000/api/mutate/superUserSetup

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
npx playwright test tests/auth/superuser/super_user_setup.spec.ts --project=chromium
signup a account for adminpaneluicomponents subdomain.


I'd just like to report that I used @solid-primitives/twee it was sooo lovely and simple. Well done.
I had to provide my own ease function, but at least the source code is clear enough (and provides a good sample ease function).

Solid MotionOne
https://github.com/solidjs-community/solid-motionone?tab=readme-ov-file


Nested functions can be used like:
return {
    fns: {
        p2: () => args.fns("p1")("kk")
    },
    onClick: () => console.log(args.fns("p2")("ll"))
}

we dont need to create saprate meta for repeated component, we can handle logic with other props functions.

dont change opacity:.5 opacity:1:hover, use color instead.


Deno crypto module:
An Introduction to the Deno Crypto Module
https://friendlyuser.github.io/posts/tech/2023/An_Introduction_to_the_Deno_Crypto_Module/
which hashing algorithm is right for you?
https://stytch.com/blog/argon2-vs-bcrypt-vs-scrypt/



Email service:
Privacy-focused encrypted email for everyone. All-in-one alternative to Gmail + Mailchimp + Sendgrid.
https://github.com/forwardemail/forwardemail.net
