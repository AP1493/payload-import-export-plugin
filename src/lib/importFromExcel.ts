import type React from "react";

import * as XLSX from "xlsx";

import { unflattenObject } from "../lib/objectUtils.js";
import { revalidateFunction } from "./revalidateFunctions.js";

export const handleImportFile = async (
  event: React.ChangeEvent<HTMLInputElement>,
  segments: any,
  config: any,
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  onComplete?: () => void
) => {
  if (!segments || !segments[1]) {return;}

  const file = event.target.files?.[0];
  if (!file) {return;}

  try {
    const fileName = file.name.toLowerCase();

    const reader = new FileReader();
    reader.onload = async (e) => {
      let jsonData: any[] = [];

      if (fileName.endsWith(".json")) {
        // ======== Added: Handle direct JSON import =========
        try {
          jsonData = JSON.parse(e.target?.result as string);
        } catch (err) {
          console.error("Invalid JSON file");
          if (onComplete) {onComplete();}
          return;
        }
      } else {
        // ======== Default: XLSX file parsing =========
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }

      if (!jsonData || jsonData.length === 0) {
        if (onComplete) {onComplete();}
        return;
      }

      const collectionConfig = config.collections.find(
        (coll: any) => coll.slug === segments[1]
      );
      if (!collectionConfig) {
        if (onComplete) {onComplete();}
        return;
      }

      const validFields = collectionConfig.fields
        .filter((field: any) => "name" in field)
        .map((field: any) => field.name);

      const processedData = jsonData.map((item: any) => {
        // If JSON was from XLSX, keys will be flat — unflatten them
        const nestedItem = fileName.endsWith(".json")
          ? item
          : unflattenObject(item);

        const processedItem: Record<string, any> = {};
        Object.keys(nestedItem).forEach((key) => {
          if (validFields.includes(key) || key === "id") {
            processedItem[key] = nestedItem[key];
          }
        });

        return processedItem;
      });

      for (const item of processedData) {
        try {
          let method = "POST";
          let url = `/api/${segments[1]}`;

          if (item.id) {
            const checkUrl = `/api/${segments[1]}/${item.id}`;
            const checkRes = await fetch(checkUrl);

            if (checkRes.ok) {
              method = "PATCH";
              url = checkUrl;
            } else if (checkRes.status === 404) {
              method = "POST";
              url = `/api/${segments[1]}`;
            } else {
              throw new Error(
                `Failed to check existence for item ID ${item.id}. Status: ${checkRes.status}`
              );
            }
          }

          const response = await fetch(url, {
            body: JSON.stringify(item),
            headers: { "Content-Type": "application/json" },
            method,
          });

          if (!response.ok) {
            throw new Error(
              `Failed to ${method.toLowerCase()} item: ${JSON.stringify(item)}`
            );
          }
        } catch (error) {
          throw new Error(`${error}`);
        }
      }

      await revalidateFunction(segments);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onComplete) {onComplete();}
    };

    if (fileName.endsWith(".json")) {
      reader.readAsText(file); // ======== Read as plain text for JSON
    } else {
      reader.readAsArrayBuffer(file); // ======== Read as binary for XLSX
    }
  } catch (err) {
    if (onComplete) {onComplete();}
    throw new Error(`${err}`);
  }
};
