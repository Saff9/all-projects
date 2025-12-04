"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { extractTextFromDOCX } from "@/lib/docx-parser";

interface FileUploaderProps {
  onFileLoaded: (text: string, fileName: string) => void;
  onError: (error: string) => void;
}

export function FileUploader({ onFileLoaded, onError }: FileUploaderProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const parseFile = useCallback(async (file: File) => {
    setIsParsing(true);
    try {
      let text = "";
      
      if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
      } else if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        text = await extractTextFromDOCX(file);
      } else {
        throw new Error("Unsupported file format. Please upload PDF or DOCX.");
      }

      if (!text || text.trim().length === 0) {
        throw new Error("No text could be extracted from the file.");
      }

      setExtractedText(text);
      setSelectedFile(file);
      setShowPreview(true);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setIsParsing(false);
    }
  }, [onError]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === "file-too-large") {
          onError("File is too large. Maximum size is 5MB.");
        } else {
          onError(error.message);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        parseFile(acceptedFiles[0]);
      }
    },
    [parseFile, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleConfirm = () => {
    if (extractedText && selectedFile) {
      onFileLoaded(extractedText, selectedFile.name);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setExtractedText("");
    setShowPreview(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!showPreview ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted hover:border-primary/50",
            isParsing && "opacity-50 pointer-events-none"
          )}
        >
          <input {...getInputProps()} />
          {isParsing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Parsing your resume...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {isDragActive
                    ? "Drop your resume here"
                    : "Drag & drop your resume"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to select (PDF or DOCX, max 5MB)
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{selectedFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile!.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Preview extracted text ({extractedText.length} characters)
              </summary>
              <div className="mt-3 p-3 bg-muted rounded-md max-h-48 overflow-y-auto text-xs font-mono">
                {extractedText}
              </div>
            </details>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirm} className="flex-1">
              Confirm & Continue
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Choose Different File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
