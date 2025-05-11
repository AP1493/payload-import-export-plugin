import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { importExportPlugin } from "import-export-plugin";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { devUser } from "./helpers/credentials.js";
import { testEmailAdapter } from "./helpers/testEmailAdapter.js";
import { seed } from "./seed.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname;
}

export default buildConfig({
  admin: {
    autoLogin: devUser,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: "posts",
      fields: [],
    },
    {
      slug: "media",
      fields: [],
      upload: {
        staticDir: path.resolve(dirname, "media"),
      },
    },
    {
      slug: "newCollectiondummy",
      fields: [
        {
          name: "id",
          type: "text",
        },
        {
          name: "fname",
          type: "text",
        },
        {
          name: "media_id",
          type: "relationship",
          relationTo: "media",
        },
      ],
      versions: {
        drafts: {
          // autosave:true
        },
        maxPerDoc: 10,
      },
    },
    {
      slug:"testcoll",
      fields:[
        {
          name:"fullname",
          type:"text",
          label:"Full Name",
          required:true,
        }
      ],
       versions: {
        drafts: {
          // autosave:true
        },
        maxPerDoc: 10,
      },
    },
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  editor: lexicalEditor(),
  email: testEmailAdapter,
  onInit: async (payload) => {
    await seed(payload);
  },
  plugins: [
    importExportPlugin({
      collections: {
        posts: true,
        newCollectiondummy: true,
        testcoll:true,
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || "test-secret_key",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
