import type { CollectionSlug, Config } from "payload";

export type ImportExportPluginConfig = {
  /**
   * List of collections to add a custom field
   */
  collections?: Partial<Record<CollectionSlug, true>>;
  disabled?: boolean;
};

export const importExportPlugin =
  (pluginOptions: ImportExportPluginConfig) =>
  async (config: Config): Promise<Config> => {
    if (!config.collections) {
      config.collections = [];
    }


    if (pluginOptions.disabled) {
      return config;
    }
    if (pluginOptions.collections) {
      for (const collectionSlug in pluginOptions.collections) {
        const collection = config.collections.find(
          (collection) => collection.slug === collectionSlug
        );

        if (collection) {
          if (!collection.endpoints) {
            collection.endpoints = [];
          }

          if (!collection.admin) {
            collection.admin = {};
          }

          if (!collection.admin.components) {
            collection.admin.components = {};
          }

          if (!collection.admin.components?.beforeList) {
            collection.admin.components.beforeList = [
              `import-export-plugin/rsc#CustomImportExportButtons`,
            ];
          } else {
            collection.admin.components.beforeList.push(
              `import-export-plugin/rsc#CustomImportExportButtons`
            );
          }
        }
      }
    }

    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (pluginOptions.disabled) {
      return config;
    }

    if (!config.endpoints) {
      config.endpoints = [];
    }

    if (!config.admin) {
      config.admin = {};
    }

    if (!config.admin.components) {
      config.admin.components = {};
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = [];
    }

    return config;
  };
