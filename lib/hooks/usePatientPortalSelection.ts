"use client";

import { useCallback, useSyncExternalStore } from "react";

const SELECTED_PATIENT_ID_KEY = "selectedPatientId";
const SELECTED_ADMIN_ID_KEY = "selectedAdminId";
const PATIENT_PORTAL_SELECTION_EVENT = "patientPortalSelectionChanged";

type PatientPortalSelection = {
  patientId: string;
  adminId: string;
};

function readStorageValue(key: string) {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
}

function getSelectionSnapshot() {
  return JSON.stringify({
    patientId: readStorageValue(SELECTED_PATIENT_ID_KEY),
    adminId: readStorageValue(SELECTED_ADMIN_ID_KEY),
  });
}

function subscribeToSelection(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(PATIENT_PORTAL_SELECTION_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PATIENT_PORTAL_SELECTION_EVENT, callback);
  };
}

export function usePatientPortalSelection() {
  const snapshot = useSyncExternalStore(
    subscribeToSelection,
    getSelectionSnapshot,
    () => JSON.stringify({ patientId: "", adminId: "" }),
  );

  const selection = JSON.parse(snapshot) as PatientPortalSelection;

  const setSelection = useCallback((next: Partial<PatientPortalSelection>) => {
    if (typeof window === "undefined") return;

    const current = {
      patientId: readStorageValue(SELECTED_PATIENT_ID_KEY),
      adminId: readStorageValue(SELECTED_ADMIN_ID_KEY),
    };

      const updated = {
        patientId: next.patientId ?? current.patientId,
        adminId: next.adminId ?? current.adminId,
      };

    if (next.patientId !== undefined) {
      localStorage.setItem(SELECTED_PATIENT_ID_KEY, updated.patientId);
    }
    if (next.adminId !== undefined) {
      localStorage.setItem(SELECTED_ADMIN_ID_KEY, updated.adminId);
      }

    window.dispatchEvent(new Event(PATIENT_PORTAL_SELECTION_EVENT));
  }, []);

  return {
    ...selection,
    setSelection,
  };
}

export function savePatientPortalSelection(selection: Partial<PatientPortalSelection>) {
  if (typeof window === "undefined") return;

  if (selection.patientId !== undefined) {
    localStorage.setItem(SELECTED_PATIENT_ID_KEY, selection.patientId);
  }
  if (selection.adminId !== undefined) {
    localStorage.setItem(SELECTED_ADMIN_ID_KEY, selection.adminId);
  }

  window.dispatchEvent(new Event(PATIENT_PORTAL_SELECTION_EVENT));
}
