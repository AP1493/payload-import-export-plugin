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
  selectedFields?: string[],
  template?: boolean
) => {
  try {
    if (!segments || !segments[1] || !selectedFields || selectedFields.length === 0) {
      return;
    }
    const headers = selectedFields;
    const fileNameBase = `${segments[1]}-${template ? "template" : "export"}`;
    let dataToExport: Record<string, any>[] = [];
    if (template) {
      const emptyFlatRow: Record<string, string> = {};
      headers.forEach(header => {
        emptyFlatRow[header] = "";
      });

      if (exportType === "json") {
        const unflattened = unflattenObject(emptyFlatRow);
        dataToExport = [unflattened];
      } else {
        dataToExport = [emptyFlatRow];
      }

    } else {
      const response = await fetch(`/api/${segments[1]}?limit=10000`, {
        headers: { "Content-Type": "application/json" },
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to fetch collection data");

      const { docs } = await response.json();
      if (!docs || docs.length === 0) return;

      const filteredDocs = (includeDraft ? docs : docs.filter(
        (doc: { _status: string }) => doc._status !== "draft"
      )).map((doc: any) => {
        const flatDoc = flattenObject(doc);
        const filteredFlatDoc: Record<string, any> = {};
        headers.forEach(field => {
          if (field in flatDoc) {
            filteredFlatDoc[field] = flatDoc[field];
          }
        });
        return exportType === "json"
          ? unflattenObject(filteredFlatDoc)
          : filteredFlatDoc;
      });

      dataToExport = filteredDocs;
    }

    let blob: Blob;
    if (exportType === "json") {
      blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
    } else {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, segments[1]);
      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
      });
      blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileNameBase}.${exportType === "json" ? "json" : "xlsx"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Export error:", error);
    return false;
  }
};
