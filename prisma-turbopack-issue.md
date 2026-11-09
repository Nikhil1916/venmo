# Prisma 7 + Next.js Turbopack: generated client import resolution

I’m debugging Prisma ORM 7.10.1 in a Next.js 16.3.8 app inside an npm/Turborepo monorepo. Please review the details below and confirm the root cause and safest supported fix. Do not edit generated Prisma files or suggest downgrading Prisma.

## Repository layout

```text
venmo/
  apps/
    user-app/
      app/api/user/route.ts
      next.config.js
      package.json
      tsconfig.json
  packages/
    db/
      package.json
      prisma/
        schema.prisma
      generated/prisma/
      src/index.ts
      prisma7.config.ts
      tsconfig.json
  turbo.json
  package.json
```

## Versions and setup

- Prisma CLI and `@prisma/client`: `7.10.1`
- Next.js: `16.3.8` with Turbopack
- TypeScript: `7.0.2`
- npm workspaces: `apps/*` and `packages/*`

The current Prisma generator block in `packages/db/prisma/schema.prisma` is:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

The generated directory contains `.ts` files, including `enums.ts`, `client.ts`, and files under `internal/`.

The beginning of the generated `packages/db/generated/prisma/client.ts` includes:

```ts
import * as runtime from "@prisma/client/runtime/client"
import * as $Enums from "./enums.js"
import * as $Class from "./internal/class.js"
import * as Prisma from "./internal/prismaNamespace.js"

export * as $Enums from "./enums.js"
export * from "./enums.js"
```

The corresponding `enums.js`, `internal/class.js`, and `internal/prismaNamespace.js` files do not exist; the files on disk have `.ts` extensions.

## Package and app configuration

`packages/db/package.json`:

```json
{
  "name": "@repo/db",
  "version": "0.0.0",
  "exports": {
    "./client": "./src/index.ts"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.10.1",
    "@prisma/client": "^7.10.1",
    "pg": "^8.23.1"
  },
  "devDependencies": {
    "@types/pg": "^8.23.1",
    "prisma": "^7.10.1"
  }
}
```

`packages/db/src/index.ts`:

```ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });
```

`apps/user-app/next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/db"],
};

export default nextConfig;
```

The API route imports the DB instance with:

```ts
import { prisma } from "@repo/db/client";
```

The app's TypeScript config extends the shared Next.js config, which uses `moduleResolution: "Bundler"`. The DB package's TypeScript config extends the shared React library config, which uses `moduleResolution: "NodeNext"`. `turbo.json` defines build, lint, check-types, and dev tasks; there is no special Prisma generation task configured there.

## Error

```text
Module not found: Can't resolve './enums.js'

./packages/db/generated/prisma/client.ts:22:1
export * as $Enums from './enums.js'
export * from "./enums.js"
```

The trace goes through `packages/db/generated/prisma/client.ts` to `apps/user-app/app/api/user/route.ts`.

## Attempts and observations

- Regenerated the Prisma client and cleared the Next.js `.next` cache; the `.js` import specifiers remained with the default generator settings.
- Tried `moduleFormat = "cjs"` previously; it did not resolve the missing `.js` imports.
- Confirmed `transpilePackages: ["@repo/db"]` is configured.
- The package export currently resolves `@repo/db/client` to `packages/db/src/index.ts`, which then imports the generated client.
- In a local test, adding `importFileExtension = "ts"` to the generator block and regenerating changed generated relative imports to `.ts`. The Next build then compiled past the Turbopack module-resolution error, but at that time TypeScript failed separately because `PrismaClient` was instantiated without the Prisma 7 adapter. The package entry point has since been updated to use `PrismaPg`.
- Generated Prisma files must not be edited manually.
- Do not downgrade Prisma or make unrelated changes.

## Questions

1. Is the mismatch between `.js` specifiers and `.ts` generated files expected from Prisma 7.10.1's default generator settings in this environment, or does it indicate a Prisma generator defect?
2. Is `importFileExtension = "ts"` the supported, correct fix for a generated TypeScript client bundled by Next.js 16.3.8/Turbopack?
3. Does this option have any runtime or deployment implications, and should any related `generatedFileExtension` or TypeScript settings also be specified?
4. Is the current package export (`"./client": "./src/index.ts"`) and Next `transpilePackages` setup appropriate, or is a package export/configuration issue contributing to this specific error?
5. Please give the minimal exact changes and the command to regenerate the client from this monorepo.
