"use client";

import type { ClientField, Column } from "payload";

import { Button, CloseMenuIcon, Table } from "@payloadcms/ui";
import React, { useEffect, useState } from "react";

import { extractAllKeys } from "../lib/objectUtils.js";

interface FieldSelectionDialogProps {
  data: any[];
  isOpen: boolean;
  onClose: () => void;
  onExport: (
    selectedFields: string[],
    includeDraft: boolean,
    exportType: string
  ) => void;
  template?: boolean;
}

export const FieldSelectionDialog: React.FC<FieldSelectionDialogProps> = ({
  data,
  isOpen,
  onClose,
  onExport,
  template,
}) => {
  const [fields, setFields] = useState<
    { isObject: boolean; key: string; level: number; path: string }[]
  >([]);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [includeDraft, setIncludeDraft] = useState(true);

  useEffect(() => {
    if (data && data.length > 0) {
      const allKeys = extractAllKeys(data[0]);
      setFields(allKeys);
      const initialSelected = new Set(
        allKeys.filter((field) => !field.isObject).map((field) => field.path)
      );
      setSelectedFields(initialSelected);
      setAllSelected(
        initialSelected.size ===
          allKeys.filter((field) => !field.isObject).length
      );
    }
  }, [data]);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(
        new Set(
          fields.filter((field) => !field.isObject).map((field) => field.path)
        )
      );
    }
    setAllSelected(!allSelected);
  };

  const handleSelectField = (path: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFields(newSelected);
    setAllSelected(
      newSelected.size === fields.filter((field) => !field.isObject).length
    );
  };

  const handleExport = (exportType: string) => {
    onExport(Array.from(selectedFields), includeDraft, exportType);
  };

  if (!isOpen) {
    return null;
  }

  const tableData = fields.map((field) => ({
    ...field,
    select: !field.isObject && selectedFields.has(field.path),
  }));

  const columns: Column[] = [
    {
      accessor: "select",
      active: true,
      field: {
        name: "select",
        type: "checkbox",
        admin: { readOnly: false },
      } as ClientField,
      Heading: (
        <input
          aria-label="Select All"
          checked={allSelected}
          onChange={handleSelectAll}
          type="checkbox"
        />
      ),
      renderedCells: tableData.map((row, index) =>
        !row.isObject ? (
          <input
            aria-label={`Select ${row.path}`}
            checked={selectedFields.has(row.path)}
            key={index}
            onChange={() => handleSelectField(row.path)}
            type="checkbox"
          />
        ) : (
          <span key={index} />
        )
      ),
    },
    {
      accessor: "key",
      active: true,
      field: { name: "key", type: "text" } as ClientField,
      Heading: "Field Key",
      renderedCells: tableData.map((row) => row.key),
    },
    {
      accessor: "path",
      active: true,
      field: { name: "path", type: "text" } as ClientField,
      Heading: "Field Path",
      renderedCells: tableData.map((row) => row.path),
    },
    {
      accessor: "isObject",
      active: true,
      field: { name: "isObject", type: "text" } as ClientField,
      Heading: "Type",
      renderedCells: tableData.map((row) =>
        row.isObject ? "Object" : "Primitive"
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          left: 0,
          pointerEvents: "auto", // <- THIS is important
          position: "fixed",
          top: 0,
          width: "100vw",
          zIndex: 999, // Make sure it's high enough
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 1)",
            boxSizing: "border-box",
            maxHeight: "60vh",
            maxWidth: "90vw",
            overflowY: "auto",
            paddingLeft: "20px",
            paddingRight: "20px",
            width: "60%",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 1)",
              display: "flex",
              padding: "15px 16px",
              position: "sticky",
              top: 0,
              zIndex: 1000,
            }}
          >
            <h2 style={{ fontSize: "29px", margin: 0 }}>
              Select Fields to Export
            </h2>
            <div
              onClick={onClose}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onClose();
                }
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

          <Table appearance="default" columns={columns} data={tableData} />
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 1)",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              bottom: 0,
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              position: "sticky",
            }}
          >
            {!template && (
              <div
                style={{ alignItems: "center", display: "flex", width: "100%" }}
              >
                <label
                  style={{
                    alignItems: "center",
                    display: "flex",
                    gap: "8px",
                    justifyItems: "left",
                  }}
                >
                  Include Draft
                  <input
                    aria-label="checkbox-input"
                    checked={includeDraft}
                    onChange={(e) => setIncludeDraft(e.target.checked)}
                    style={{ cursor: "pointer" }}
                    type="checkbox"
                  />
                </label>
              </div>
            )}

            <Button onClick={onClose} round>
              Cancel
            </Button>
            <Button onClick={() => handleExport("json")} round>
              JSON
            </Button>
            <Button onClick={() => handleExport("excel")} round>
              Excel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
