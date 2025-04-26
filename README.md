Section Links:
http://localhost:3001/admin/UserSettings
http://localhost:3001/admin/GlobalSettings
http://localhost:3001/admin/
http://localhost:3001/admin/Page

auth:
http://localhost:3001/auth/login

email templates:
http://localhost:3001/internal/page/AccountDeletionRequest
http://localhost:3001/internal/page/TwoFactorAuth
http://localhost:3001/internal/page/VerificationCode
http://localhost:3001/internal/page/TestEmail
http://localhost:3001/internal/page/PasswordChanged
http://localhost:3001/internal/page/ProfileUpdated
http://localhost:3001/internal/page/SignupConfirmation
http://localhost:3001/internal/page/WelcomeEmail
http://localhost:3001/internal/page/EmailChanged
http://localhost:3001/internal/page/EmailChangeSuccessful
http://localhost:3001/internal/page/EmailConfirmation
http://localhost:3001/internal/page/InvitationEmail

http://localhost:3001/support/contact


##Development
# Getting Started Neo4j
https://neo4j.com/docs/getting-started/whats-neo4j/

# Neo4j Browser
To access the Neo4j Browser, navigate to: [http://37.27.21.59:7474/browser/](http:/localhost:7474/browser/)

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

http://localhost:3001/api/setup/superUserSetup
# System Cleanup
http://localhost:3001/api/setup/systemCleanup


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



// Check for specific permissions
const canCreateUser = await isPermission(request, PERMISSIONS.CREATE_USER, dbSession);

// Check for multiple permissions (any of them)
const canManageUsers = await isPermission(
  request, 
  [PERMISSIONS.CREATE_USER, PERMISSIONS.DELETE_USER], 
  dbSession
);

// Check for roles
const isAdmin = await checkRole(request, SYSTEM_ROLES.ADMIN, dbSession);



LOGO Design:
✅ Modern Typography → Uses Inter font for better UI/UX branding.
✅ Tech-Oriented Design → A square element representing draggable blocks.
✅ Drag Handles → Added three small dots to signify movement & modularity.
✅ Sharp & Clean Lines → Matches modern UI/UX aesthetics.


Load env variables on production:
https://dear-caravan-605.notion.site/Solid-FAQ-b5ae5a47f2ec47c8a78bc5671180845d#1a328989d46a8033a63cd6e94cdaea31
1. npm install -g dotenv-cli
2. npm run start

Setup a wildcard domain including free SSL | Let's Encrypt
https://www.youtube.com/watch?v=oJ_sP9y9KWo


Note:
RPC function call should be handled carefully in createAsync().
if one RPC call is not handled properly, if will effect other component async function calls and it will be critical to debug.


neo4j import:
https://neo4j.com/docs/operations-manual/current/tools/neo4j-admin/neo4j-admin-import/

# CSS-in-JS Styling System

This project uses a custom CSS-in-JS styling system that leverages the power of direct CSS with the flexibility of JavaScript.

## Getting Started

### Basic Usage

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";

function MyComponent() {
  return (
    <As as="div" css={css`
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 0.5rem;
    `}>
      Hello World
    </As>
  );
}
```

### Creating Reusable Styles

```tsx
import { css } from "~/lib/styles";
import { themeColors, colors } from "~/lib/styles/createCss";

// Define your styles as functions
const buttonCss = () => css`
  background-color: ${themeColors.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${colors.darken(themeColors.primary, 10)};
  }
`;

// Use in components
function Button(props) {
  return (
    <As as="button" css={buttonCss()} {...props} />
  );
}
```

### Styled Components

```tsx
import { styled } from "~/lib/styles";
import { themeColors } from "~/lib/styles/createCss";

// Create styled components
const Container = styled('div', css`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`);

const Heading = styled('h1', css`
  color: ${themeColors.primary};
  font-size: 2rem;
  margin-bottom: 1rem;
`);

// Use them in your component
function MyPage() {
  return (
    <Container>
      <Heading>Welcome to My App</Heading>
      <p>Content goes here</p>
    </Container>
  );
}
```

### Dynamic Styles with Props

```tsx
import { css, themedCss } from "~/lib/styles";
import { colors } from "~/lib/styles/createCss";

// Create theme-aware styles
const themedButton = themedCss((theme) => css`
  background-color: ${theme.primaryColor || "#3b82f6"};
  color: ${colors.mostReadable(theme.primaryColor || "#3b82f6", ["#fff", "#000"])};
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
`);

// Use with theme context
function ThemedButton(props) {
  return (
    <As as="button" css={themedButton({ theme: { primaryColor: props.color } })} {...props} />
  );
}
```

## Color Utilities

The `colors` object provides various color manipulation functions:

```tsx
import { colors, themeColors } from "~/lib/styles/createCss";

// Lighten a color
const lightBlue = colors.lighten(themeColors.primary, 20);

// Darken a color
const darkBlue = colors.darken(themeColors.primary, 20);

// Set alpha/transparency
const transparentBlue = colors.setAlpha(themeColors.primary, 0.5);

// Get most readable text color for a background
const textColor = colors.mostReadable(themeColors.primary, ['#fff', '#000']);

// Mix two colors
const purplish = colors.mix(themeColors.primary, themeColors.accent, 50);
```

## Migrating from Master CSS

A migration script is available to help convert from Master CSS:

```bash
node scripts/migrate-from-master-css.js <target-directory>
```

Or you can use the `convertClassToCss` utility directly:

```tsx
import { convertClassToCss } from "~/lib/styles/migration";

// Convert a component schema with class properties to use css
const updatedSchema = convertClassToCss(originalSchema);
```

## Advanced Features

### Combining Styles

```tsx
import { mergeCss } from "~/lib/styles/createCss";

const baseStyles = () => css`/* base styles */`;
const additionalStyles = () => css`/* additional styles */`;

// Combine multiple styles
const combinedStyles = mergeCss(baseStyles, additionalStyles);
```

### Interactive States

```tsx
import { withStates } from "~/lib/styles";

const buttonStyles = withStates(
  // Base styles
  `
    background-color: ${themeColors.primary};
    color: white;
  `,
  // Hover styles
  `background-color: ${colors.darken(themeColors.primary, 10)};`,
  // Focus styles
  `outline: 2px solid ${colors.setAlpha(themeColors.primary, 0.5)};`,
  // Active styles
  `background-color: ${colors.darken(themeColors.primary, 15)};`
);
```

## Using Direct CSS Strings

Our CSS-in-JS system now supports writing direct CSS strings with template literals, which is the preferred approach rather than converting from Master CSS classes.

### Basic Usage

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";

function MyComponent() {
  return (
    <As as="div" css={css`
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 0.5rem;
      
      &:hover {
        background-color: #e5e5e5;
      }
    `}>
      Content goes here
    </As>
  );
}
```

### Using Theme Colors Directly

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { themeColors, colors } from "~/lib/styles/createCss";

function Button(props) {
  return (
    <As as="button" 
      css={css`
        background-color: ${themeColors.primary};
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        
        &:hover {
          background-color: ${colors.darken(themeColors.primary, 10)};
        }
      `}
      {...props}
    />
  );
}
```

## Pre-built CSS Helpers

We provide several utility functions to generate common CSS patterns:

### Button CSS

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { buttonCss } from "~/lib/styles/directCss";

function PrimaryButton(props) {
  return (
    <As as="button" 
      css={css`
        ${buttonCss({
          backgroundColor: '#3b82f6',
          padding: '0.75rem 1.5rem'
        })}
      `}
      {...props}
    />
  );
}
```

### Container CSS

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { containerCss } from "~/lib/styles/directCss";

function Card(props) {
  return (
    <As as="div" 
      css={css`
        ${containerCss({
          padding: '1.5rem',
          borderRadius: 8,
          shadow: true
        })}
      `}
      {...props}
    />
  );
}
```

### Layout Helpers

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { flexCss, gridCss } from "~/lib/styles/directCss";

function FlexContainer(props) {
  return (
    <As as="div" 
      css={css`
        ${flexCss({
          direction: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16
        })}
      `}
      {...props}
    />
  );
}

function GridContainer(props) {
  return (
    <As as="div" 
      css={css`
        ${gridCss({
          columns: 3,
          gap: 24,
          alignItems: 'stretch'
        })}
      `}
      {...props}
    />
  );
}
```

### Typography

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { typographyCss } from "~/lib/styles/directCss";

function Heading(props) {
  return (
    <As as="h2" 
      css={css`
        ${typographyCss({
          fontSize: 24,
          fontWeight: 'bold',
          textColor: '#1e293b',
          lineHeight: 1.2
        })}
      `}
      {...props}
    />
  );
}
```

## Converting Master CSS Classes

If you need to convert existing Master CSS classes to direct CSS strings, you can use the `masterClassToCss` function:

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { masterClassToCss } from "~/lib/styles/directCss";

function ConvertedComponent() {
  // Convert a Master CSS class to direct CSS
  const oldClass = "p:16 grid gap:24 bg:primary-50 color:base-5";
  const directCss = masterClassToCss(oldClass);
  
  return (
    <As as="div" css={css`${directCss}`}>
      This was converted from Master CSS
    </As>
  );
}
```

Low-code programming for event-driven applications
https://nodered.org


Copy: Saves for pasting elsewhere
Duplicate: Creates an immediate copy in the same location
