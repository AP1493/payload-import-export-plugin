"use client";
import { Button, useConfig } from "@payloadcms/ui";
import { useParams } from "next/navigation.js";
/* @jsxImportSource react */
import React, { useCallback, useEffect, useState } from "react";

import { ImportDialog } from "../components/ImportDialog.js";
import { dataFetch } from "../lib/dateFetch.js";
import { handleExport } from "../lib/exportToExcel.js";
import { FieldSelectionDialog } from "./FieldSelectionDialog.js";

export const CustomImportExportButtons: React.FC = () => {
  const { segments } = useParams();
  const { config } = useConfig();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [exportData, setExportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        if (segments) {
          const data = await dataFetch(config, segments[1]);
          setExportData(data.docs);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getData().catch((error) => {
      throw new Error(`${error}`);
    });
  }, [segments, config]);

  const onExportClick = useCallback(() => {
    setIsExportDialogOpen(true);
  }, []);

  const onImportClick = useCallback(() => {
    setIsImportDialogOpen(true);
  }, []);

  const onExport = useCallback(
    async (
      selectedFields: string[],
      includeDraft: boolean,
      exportType: string
    ) => {
      try {
        if (segments) {
          await handleExport(
            segments,
            includeDraft,
            exportType,
            selectedFields
          );
        }
      } finally {
        closeExportDialog();
      }
    },
    [segments]
  );

  const closeExportDialog = () => {
    setIsExportDialogOpen(false);
  };

  const closeImportDialog = (
    setSelectedFile?: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    setIsImportDialogOpen(false);
    if (setSelectedFile) {
      setSelectedFile(null);
    }
  };

  return (
    <>
      {/* <style jsx global>{`
      @media (min-width: 769px) {
        .import-export-buttons {
          display: flex;
          gap: 10px;
          position: absolute;
          top: 40px;
          right: 585px;
        }
      }

      @media (min-width: 510px) and (max-width: 768px) {
        .import-export-buttons {
          display: flex;
          gap: 10px;
          position: absolute;
          top: 33px;
          right: 20px;
        }
      }

      @media (max-width: 510px) {
        .import-export-buttons {
          display: flex;
          gap: 10px;
          position: absolute;
          top: 58px;
          left: 17%;
          transform: translateX(-50%);
          z-index: 10;
         margin-top: 5px;
         margin-botton: 5px
        }
      }
         @media (max-width: 387px) {
        .import-export-buttons {
          display: flex;
          gap: 10px;
          position: absolute;
          top: 70px;
          left: 51%;
          transform: translateX(-50%);
          z-index: 10;
         margin-top: 5px;
         margin-botton: 5px
        }
      }
    `}</style> */}

      <div style={{ display: "flex", gap: "10px", justifyContent:"right",paddingRight: "66px" }}>
        <Button  onClick={onImportClick} round size="small">
          Import
        </Button>
        <Button
          
          disabled={isLoading || exportData.length === 0}
          onClick={onExportClick}
          round
          size="small"
        >
          Export
        </Button>
      </div>

      <FieldSelectionDialog
        data={exportData}
        isOpen={isExportDialogOpen}
        onClose={closeExportDialog}
        onExport={onExport}
      />

      <ImportDialog
        config={config}
        data={exportData}
        isOpen={isImportDialogOpen}
        onClose={closeImportDialog}
        segments={segments}
      />
    </>
  );
};
