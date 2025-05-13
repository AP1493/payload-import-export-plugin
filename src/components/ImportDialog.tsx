"use client";

import type { ParamValue } from "next/dist/server/request/params.js";
import { Button, CloseMenuIcon, useTheme } from "@payloadcms/ui";
import React, { useEffect, useRef, useState } from "react";

import { handleImportFile } from "../lib/importFromExcel.js";
import { FieldSelectionDialog } from "./FieldSelectionDialog.js";

interface ImportDialogProps {
  config: any;
  data: any[];
  isOpen: boolean;
  onClose: (
    setSelectedFile?: React.Dispatch<React.SetStateAction<File | null>>
  ) => void;
  segments: ParamValue;
  onExport: (
    selectedFields: string[],
    includeDraft: boolean,
    exportType: string,
    template?: boolean
  ) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  config,
  data,
  isOpen,
  onClose,
  segments,
  onExport,
}) => {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleOpenTemplateDialog = () => setIsTemplateDialogOpen(true);
  const handleCloseTemplateDialog = () => setIsTemplateDialogOpen(false);

  const handleGenerateTemplate = (
    selectedFields: string[],
    includeDraft: boolean,
    exportType: string
  ) => {
    onExport(Array.from(selectedFields), includeDraft, exportType, true);
    setIsTemplateDialogOpen(false);
  };

  const handleImport = async () => {
    if (!selectedFile || !fileInputRef.current) return;
    setIsImporting(true);

    try {
      const syntheticEvent = {
        target: { files: [selectedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await handleImportFile(
        syntheticEvent,
        segments,
        config,
        fileInputRef,
        () => {
          setIsImporting(false);
          onClose(setSelectedFile);
        }
      );
    } catch (error) {
      setIsImporting(false);
      setSelectedFile(null);
      throw new Error(`${error}`);
    }
  };

  const handleClearFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedFile(null);
  };

  if (!isOpen) return null;

  const bgColor = theme === "dark" ? "#000" : "#fff";
  const textColor = theme === "dark" ? "#fff" : "#000";
  const borderColor = theme === "dark" ? "#333" : "#ccc";
  const subTextColor = theme === "dark" ? "#aaa" : "#666";
  const fileBoxColor = theme === "dark" ? "#111" : "#f3f3f3";

  return (
    <div
      style={{
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        left: 0,
        position: "fixed",
        top: 0,
        width: "100vw",
        zIndex: 990,
      }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          maxHeight: "90vh",
          maxWidth: "550px",
          overflow: "hidden",
          width: "100%",
          zIndex: 990,
        }}
      >
        <div
          style={{
            alignItems: "center",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            justifyContent: "space-between",
            padding: "16px 24px",
          }}
        >
          <h2
            style={{
              color: textColor,
              fontSize: "20px",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Import Data
          </h2>
          <div
            onClick={() => onClose()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onClose();
            }}
            role="button"
            style={{
              alignItems: "center",
              cursor: "pointer",
              display: "flex",
              marginLeft: "auto",
            }}
            tabIndex={0}
          >
            <CloseMenuIcon />
          </div>
        </div>

        <div
          style={{
            maxHeight: "calc(90vh - 130px)",
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {/* Template Download */}
          <div
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              marginBottom: "24px",
              padding: "12px",
            }}
          >
            <h3
              style={{
                color: textColor,
                fontSize: "16px",
                fontWeight: 600,
                margin: "0 0 5px 0",
              }}
            >
              Download Template
            </h3>
            <p
              style={{
                color: subTextColor,
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              Download an Excel template with the headers for importing data.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button buttonStyle="primary" onClick={handleOpenTemplateDialog}>
                Download Excel Template
              </Button>
            </div>
          </div>

          {/* File Import Section */}
          <div
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <h3
              style={{
                color: textColor,
                fontSize: "16px",
                fontWeight: 600,
                margin: "0 0 5px 0",
              }}
            >
              Import File
            </h3>

            <div
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {!selectedFile && (
                <>
                  <p style={{ color: subTextColor, fontSize: "14px" }}>
                    Select an Excel file (.xlsx, .json) to import data
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Select File
                  </Button>
                </>
              )}
              <input
                accept=".xlsx,.xls,.json,.csv"
                aria-label="file-input"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: "none" }}
                type="file"
              />

              {selectedFile && (
                <div
                  style={{
                    alignItems: "center",
                    backgroundColor: fileBoxColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    color: textColor,
                    display: "flex",
                    fontSize: "14px",
                    justifyContent: "space-between",
                    marginTop: "16px",
                    padding: "12px 16px",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedFile.name}
                  </span>
                  <div
                    onClick={handleClearFile}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onClose();
                    }}
                    role="button"
                    style={{
                      alignItems: "center",
                      cursor: "pointer",
                      display: "flex",
                      marginLeft: "auto",
                    }}
                    tabIndex={0}
                  >
                    <CloseMenuIcon />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div
          style={{
            backgroundColor: bgColor,
            borderTop: `1px solid ${borderColor}`,
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            padding: "16px 24px",
          }}
        >
          <Button onClick={() => onClose()}>Cancel</Button>
          {isImporting ? (
            <Button disabled>Importing...</Button>
          ) : (
            <Button disabled={!selectedFile} onClick={handleImport}>
              Import
            </Button>
          )}
        </div>
      </div>

      {/* Template Dialog */}
      <FieldSelectionDialog
        data={data}
        isOpen={isTemplateDialogOpen}
        onClose={handleCloseTemplateDialog}
        onExport={handleGenerateTemplate}
        template={true}
      />
    </div>
  );
};
