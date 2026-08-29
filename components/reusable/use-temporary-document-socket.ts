import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/api/config";
import { type TemporaryDocument } from "@/services/admin/prescription";

export function useTemporaryDocumentSocket(
  scannedFilesOpen: boolean,
  temporaryDocuments: TemporaryDocument[],
) {
  const [visibleTemporaryDocuments, setVisibleTemporaryDocuments] =
    useState<TemporaryDocument[]>([]);

  useEffect(() => {
    if (!temporaryDocuments.length) return;

    setVisibleTemporaryDocuments((currentDocuments) => {
      const documentsById = new Map(
        currentDocuments.map((document) => [String(document.id), document]),
      );

      temporaryDocuments.forEach((document) => {
        documentsById.set(String(document.id), document);
      });

      return Array.from(documentsById.values());
    });
  }, [temporaryDocuments]);

  useEffect(() => {
    if (!scannedFilesOpen || typeof window === "undefined") return;

    const token = localStorage.getItem("access_token") || document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("access_token="))
      ?.split("=")[1];

    if (!token) {
      console.error(
        "[TemporaryDocumentSocket] CONNECTION ERROR",
        "No access token available",
      );
      return;
    }

    const socketUrl = getApiBaseUrl().replace(/\/api\/?$/, "");
    const socket = io(`${socketUrl}/temporary-documents`, {
      autoConnect: false,
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      console.log("[TemporaryDocumentSocket] SOCKET CONNECTED");
      console.log("[TemporaryDocumentSocket] Socket ID:", socket.id);
    };
    const handleConnectError = (error: Error) => {
      console.error("[TemporaryDocumentSocket] CONNECTION ERROR");
      console.error("[TemporaryDocumentSocket]", error.message);
    };
    const handleDisconnect = (reason: string) => {
      console.log("[TemporaryDocumentSocket] SOCKET DISCONNECTED");
      console.log("[TemporaryDocumentSocket] Reason:", reason);
    };
    const handleTemporaryDocumentAdded = (payload: unknown) => {
      const documentPayload =
        payload && typeof payload === "object" && "document" in payload
          ? payload.document
          : null;

      if (
        !documentPayload ||
        typeof documentPayload !== "object" ||
        !("id" in documentPayload) ||
        !documentPayload.id
      ) {
        return;
      }

      const document = documentPayload as TemporaryDocument;
      setVisibleTemporaryDocuments((currentDocuments) => {
        if (
          currentDocuments.some(
            (existingDocument) =>
              String(existingDocument.id) === String(document.id),
          )
        ) {
          return currentDocuments;
        }

        return [...currentDocuments, document];
      });
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("temporary-document:added", handleTemporaryDocumentAdded);
    socket.connect();

    return () => {
      socket.off("temporary-document:added", handleTemporaryDocumentAdded);
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [scannedFilesOpen]);

  return visibleTemporaryDocuments;
}