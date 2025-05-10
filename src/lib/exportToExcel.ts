import * as XLSX from "xlsx";

import { flattenObject } from "./objectUtils.js";

const unflattenObject = (flatObj: Record<string, any>) => {
  const result: Record<string, any> = {};
  for (const key in flatObj) {
    const keys = key.split(".");
    keys.reduce((acc, cur, idx) => {
      if (idx === keys.length - 1) {
        acc[cur] = flatObj[key];
        return acc;
      }
      if (!acc[cur]) {
        acc[cur] = {};
      }
      return acc[cur];
    }, result);
  }
  return result;
};

export const handleExport = async (
  segments: any,
  includeDraft: boolean,
  exportType: string,
  selectedFields?: string[]
) => {
  try {
    if (!segments) {
      return;
    }

    const response = await fetch(`/api/${segments[1]}?limit=10000`, {
      headers: { "Content-Type": "application/json" },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch collection data");
    }

    const { docs } = await response.json();

    let newDocs;
    if (!includeDraft) {
      newDocs = docs.filter(
        (doc: { _status: string }) => doc._status !== "draft"
      );
    } else {
      newDocs = docs;
    }

    if (!docs || docs.length === 0) {
      return;
    }
    if (!selectedFields) {
      return newDocs;
    }

    const filteredDocs = newDocs.map((doc: any) => {
      const flatDoc = flattenObject(doc);
      const filteredFlatDoc: Record<string, any> = {};
      selectedFields.forEach((field) => {
        if (field in flatDoc) {
          filteredFlatDoc[field] = flatDoc[field];
        }
      });

      return exportType === "json"
        ? unflattenObject(filteredFlatDoc)
        : filteredFlatDoc;
    });

    if (exportType === "json") {
      const blob = new Blob([JSON.stringify(filteredDocs, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${segments[1]}-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }

    // Excel export
    const worksheet = XLSX.utils.json_to_sheet(filteredDocs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, segments[1]);
    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${segments[1]}-export.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch {
    return false;
  }
};
