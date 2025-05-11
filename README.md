# Import/Export Plugin for Payload CMS

A plugin for [Payload CMS](https://payloadcms.com) that adds seamless import and export functionality for collection data. This plugin allows admins to easily upload or download data in multiple formats like CSV, JSON, and XLSX through the Payload Admin UI.

---

## ✨ Features

- Import data into collections from `.csv`, `.json`, and `.xlsx` files.
- Export collection data to `.csv`, `.json`, or `.xlsx` formats.
- Field mapping support during import to match collection fields.
- Built-in support for Payload's Admin UI.

---

## 📦 Installation

Install the plugin using your package manager:

```bash
# Using pnpm
pnpm add import-export-plugin

# Using npm
npm install import-export-plugin

# Using yarn
yarn add import-export-plugin
```

---

## ⚙️ Configuration

Add the plugin to your Payload config (`payload.config.ts` or `payload.config.js`):

```ts
import { buildConfig } from 'payload';
import importExportPlugin from 'import-export-plugin';

export default buildConfig({
  collections: [
    // Your Payload collections here
  ],
  plugins: [
    importExportPlugin({
     collections: {
        posts: true, // collection slug name and enable/disable import/export functionality
      },
    }),
  ],
});
```

## 📁 File Format Support

| Format | Import | Export |
|--------|--------|--------|
| `.json`| ✅     | ✅     |
| `.xlsx`| ✅     | ✅     |

---

## 🧩 Compatibility

- Payload CMS v3.29.0 or later
- Node.js v18.20.2 or v20.9.0+
- Supports modern bundlers with ESM support

---

## 📄 License

This plugin is open source and licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## 🤝 Contributing

Found a bug or want to improve something? Contributions are welcome!

- [Open an issue](https://github.com/AP1493/payload-import-export-plugin)
- [Submit a pull request](https://github.com/AP1493/payload-import-export-plugin/pulls)

---

## 📚 Resources

- [Payload Plugin Docs](https://payloadcms.com/docs/plugins/overview)
- [Payload GitHub](https://github.com/payloadcms/payload)

---

## 🧑‍🤝‍🧑 Authors
This project is maintained and developed by:

[Alay Patel](https://github.com/AP1493/)

[Jay Kanjia](https://github.com/jaykanjia)

[Devraj Gajnani](https://github.com/devraj-O7)

---

## ⚠️ Important
The Generate Template feature inside the import workflow only works when there is at least one or more rows of data present in the selected collection.
If the collection is empty, the template generation will not function as expected.

---

