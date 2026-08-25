"use client";

import { FormEvent, ReactNode, useId, useMemo, useState } from "react";
import { Plus, X ,Eye, EyeOff} from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "../ui/modal";

export type FieldType = "text" | "email" | "tel"|"file" | "number" | "password" | "textarea" | "select" | "radio" | "checkbox" | "date" | "time"| "checkbox-group"   | "document-manager"  | "patient-document-manager" | "FileText"  | "custom";
export type FormDataValue = unknown;
export type ReusableFormData = Record<string, FormDataValue>;

export interface FieldConfig {
  name: string;
  label: string;
   prefix?: string;
  type: FieldType;
  required?: boolean | ((formData: ReusableFormData) => boolean);
  placeholder?: string;
  options?: Array<{ value: string; label: string; color?: string }>;
  width?: "full" | "half" | "third" | "quarter";
  defaultValue?: FormDataValue;
  disabled?: boolean;
  hidden?: boolean | ((formData: ReusableFormData) => boolean);
  rows?: number; // For textarea
min?: number | string;
max?: number | string;
  accept?: string; // For file input
  multiple?: boolean; // For file input
  onChange?: (value: unknown) => void;
  step?: number; // For number input
  documentTypes?: Array<{
  value: string;
  label: string;
}>;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: FormDataValue, formData: ReusableFormData) => string | null;
  };
}

export interface FormSection {
  title: string;
  icon?: ReactNode;
  fields: FieldConfig[];
}

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
 onSave?: (data: ReusableFormData) => void;
  title: string | ReactNode;
  sections?: FormSection[];
    mode?: "form" | "alert";
  message?: ReactNode;
  fields?: FieldConfig[]; // Alternative flat structure
  initialData?: ReusableFormData;
  isEdit?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  saveButtonText?: string;
  cancelButtonText?: string;
  saveButtonColor?: string;
  validationOnChange?: boolean;
  children?: ReactNode;
showSaveButton?: boolean;
}



export default function ReusableModal({
  isOpen,
  onClose,
  onSave,
  title,
  sections,
  fields,
  initialData = {},
  isEdit = false,
  size = 'lg',
  saveButtonText,
  cancelButtonText,
  saveButtonColor,
  validationOnChange = false,
    mode = "form",
  message,
children,
showSaveButton = true,
}: ReusableModalProps){
  const formId = useId();
  const formSections = useMemo(
    () =>
      sections || [{
      title: "Form",
      fields: fields || [],
    }],
    [sections, fields],
  );
  const contentKey = useMemo(() => JSON.stringify(initialData), [initialData]);

  if (!isOpen) {
    return null;
  }

  return (
<ReusableModalContent
  key={contentKey}
  cancelButtonText={cancelButtonText}
  formId={formId}
  formSections={formSections}
  initialData={initialData}
  isEdit={isEdit}
  isOpen={isOpen}
  onClose={onClose}
  onSave={onSave}
  mode={mode}
  message={message}
  saveButtonColor={saveButtonColor}
  saveButtonText={saveButtonText}
  showSaveButton={showSaveButton}
  size={size}
  title={title}
  validationOnChange={validationOnChange}
>
  {children}
</ReusableModalContent>
  );
}

interface ReusableModalContentProps
  extends Required<
    Pick<
      ReusableModalProps,
      "isOpen" | "onClose" | "isEdit" | "size" | "validationOnChange"
    >
  > {
  onSave?: (data: ReusableFormData) => void;

  mode?: "form" | "alert";
  message?: ReactNode;

  cancelButtonText?: string;
  formId: string;
  formSections: FormSection[];
  initialData: ReusableFormData;
  saveButtonColor?: string;
  saveButtonText?: string;
  showSaveButton: boolean;
  title: string | ReactNode;
}

function buildInitialFormData(
  allFields: FieldConfig[],
  initialData: ReusableFormData,
): ReusableFormData {
  return allFields.reduce<ReusableFormData>((acc, field) => {
    if (initialData[field.name] !== undefined) {
      acc[field.name] = initialData[field.name];
    } else if (field.defaultValue !== undefined) {
      acc[field.name] = field.defaultValue;
    } else if (field.type === "checkbox-group") {
  acc[field.name] = [];
} else {
  acc[field.name] = "";
}

    return acc;
  }, {});
}

function fieldValueAsString(value: FormDataValue): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

function fieldValueAsBoolean(value: FormDataValue): boolean {
  return typeof value === "boolean" ? value : false;
}

function isDocumentList(
  value: FormDataValue,
): value is Array<{ name?: string; url?: string }> {
  return (
    Array.isArray(value) &&
    value.some(
      (item) =>
        item &&
        typeof item === "object" &&
        ("name" in item || "url" in item),
    )
  );
}

type ExistingDocument = {
  _id?: string;
  id?: string;
  documentType?: string;
  documentName?: string;
  originalName?: string;
  fileName?: string;
  url?: string;
  filePath?: string;
};

function isExistingDocumentList(value: FormDataValue): value is ExistingDocument[] {
  return Array.isArray(value) && value.every(
    (item) => item && typeof item === "object" && !(item instanceof File),
  );
}

function documentLabel(document: ExistingDocument, index: number): string {
  return document.documentName || document.documentType || document.originalName || document.fileName || `Document ${index + 1}`;
}

const DOCTOR_DOCUMENT_TYPES = [
  { value: "MBBS_DEGREE", label: "MBBS Degree" },
  { value: "MD_MS_DEGREE", label: "MD/MS Degree" },
  { value: "REGISTRATION_CERTIFICATE", label: "Registration Certificate" },
  { value: "EXPERIENCE_CERTIFICATE", label: "Experience Certificate" },
  { value: "AADHAAR_CARD", label: "Aadhaar Card" },
  { value: "PAN_CARD", label: "PAN Card" },
  { value: "RESUME", label: "Resume/CV" },
  { value: "OTHER", label: "Other" },
];

function ReusableModalContent({
  cancelButtonText,
  formId,
  formSections,
  initialData,
  isEdit,
  isOpen,
  onClose,
  onSave,
  mode = "form",
message,
  saveButtonColor,
  saveButtonText,
  showSaveButton,
  size,
  title,
  validationOnChange,
  children,
}: ReusableModalContentProps & {
  children?: ReactNode;
}) {
  const allFields = useMemo(
    () => formSections.flatMap((section) => section.fields),
    [formSections],
  );
  const [formData, setFormData] = useState<ReusableFormData>(() =>
    buildInitialFormData(allFields, initialData),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
const [documentRows, setDocumentRows] = useState<
  {
    documentType: string;
    customDocumentName: string;
    file: File | null;
  }[]
>([
  {
    documentType: "",
    customDocumentName: "",
    file: null,
  },
]);

  const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>(() => {
    const documentField = allFields.find((field) => field.type === "document-manager");
    const documents = documentField && initialData[documentField.name];
    return isExistingDocumentList(documents) ? documents : [];
  });
  const [documentPendingDeletion, setDocumentPendingDeletion] = useState<ExistingDocument | null>(null);

const [patientDocumentRows, setPatientDocumentRows] = useState<
  {
    documentName: string;
    file: File | null;
    previewUrl?: string;
  }[]
>([
  {
    documentName: "",
    file: null,
    previewUrl: "",
  },
]);
const [existingPatientDocuments, setExistingPatientDocuments] =
  useState<ExistingDocument[]>(() => {
    const documentField = allFields.find(
      field => field.type === "patient-document-manager"
    );

    const documents =
      documentField &&
      initialData[documentField.name];

    return isExistingDocumentList(documents)
      ? documents
      : [];
  });
  const validateField = (
    name: string,
    value: FormDataValue,
    currentFormData: ReusableFormData,
  ): string | null => {
    const field = allFields.find(f => f.name === name);
    if (!field) return null;

    const isHidden = typeof field.hidden === "function"
      ? field.hidden(currentFormData)
      : field.hidden;
    if (isHidden) return null;

   

    const required = typeof field.required === "function"
      ? field.required(currentFormData)
      : field.required;


    if (required && (value === "" || value === null || value === undefined)) {
      return `${field.label} is required`;
    }

    if (
  required &&
  Array.isArray(value) &&
  value.length === 0
) {
  return `${field.label} is required`;
}

    const { validation } = field;
    if (!validation) return null;

    if (validation.minLength && String(value).length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && String(value).length > validation.maxLength) {
      return `${field.label} must be at most ${validation.maxLength} characters`;
    }

if (
  validation.pattern &&
  String(value).trim() !== "" &&
  !validation.pattern.test(String(value))
) {
  return `${field.label} format is invalid`;
}

    if (validation.custom) {
      return validation.custom(value, currentFormData);
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    allFields.forEach(field => {
      const error = validateField(field.name, formData[field.name], formData);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    console.log("FORM DATA", formData);
 if (validateForm()) {
  onSave?.(formData);
}
  };

const handleChange = (name: string, value: FormDataValue) => {
  const newFormData = {
    ...formData,
    [name]: value,
  };

  setFormData(newFormData);

  if (validationOnChange) {
    const newErrors: Record<string, string> = {};

    Object.keys(touched).forEach((fieldName) => {
      if (touched[fieldName]) {
        const error = validateField(
          fieldName,
          newFormData[fieldName],
          newFormData
        );

        newErrors[fieldName] = error || "";
      }
    });

    setErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));
  }
};

const handleBlur = (name: string) => {
  setTouched((prev) => ({
    ...prev,
    [name]: true,
  }));

  const error = validateField(name, formData[name], formData);

  setErrors((prev) => ({
    ...prev,
    [name]: error || "",
  }));
};

  const renderField = (field: FieldConfig) => {
    const isHidden = typeof field.hidden === "function"
      ? field.hidden(formData)
      : field.hidden;
    if (isHidden) return null;

    const required = typeof field.required === "function"
      ? field.required(formData)
      : field.required;

    const widthClass = {
      full: "col-span-1 md:col-span-1",
      half: "col-span-1 md:col-span-1/2",
      third: "col-span-1 md:col-span-1/3",
      quarter: "col-span-1 md:col-span-1/4",
    }[field.width || "full"];

    const commonClasses = `w-full px-4 py-2.5 rounded-lg border ${
      errors[field.name] 
        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
        : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    } focus:outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`;

    const fieldComponent = () => {
      switch (field.type) {
        case "textarea":
          return (
<textarea
  id={field.name}
  required={required}
  className={`${commonClasses} resize-vertical min-h-[100px]`}
  value={fieldValueAsString(formData[field.name])}
  onChange={(e) => {
    handleChange(field.name, e.target.value);
    field.onChange?.(e.target.value);
  }}
  onBlur={() => handleBlur(field.name)}
  placeholder={field.placeholder}
  disabled={field.disabled}
  rows={field.rows || 4}
/>
          );

        case "select":
          return (
            <select
              id={field.name}
              required={required}
              className={`${commonClasses} bg-white`}
              value={fieldValueAsString(formData[field.name])}
              onChange={(e) => {
  handleChange(field.name, e.target.value);
  field.onChange?.(e.target.value);
}}
              disabled={field.disabled}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case "radio":
          return (
            <div className="flex flex-wrap gap-3">
              {field.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                      onBlur={() => handleBlur(field.name)}
                    checked={formData[field.name] === option.value}
                   onChange={(e) => {
  handleChange(field.name, e.target.value);
  field.onChange?.(e.target.value);
}}
                    disabled={field.disabled}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          );

        case "checkbox":
          return (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                id={field.name}
                  onBlur={() => handleBlur(field.name)}
                checked={fieldValueAsBoolean(formData[field.name])}
               onChange={(e) => {
  handleChange(field.name, e.target.checked);
  field.onChange?.(e.target.checked);
}}
                disabled={field.disabled}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{field.label}</span>
            </label>
          );

        case "file":
          return (
            <div className="space-y-3">
              {isDocumentList(formData[field.name]) && (
                <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {(formData[field.name] as Array<{ name?: string; url?: string }>).map(
                    (doc, index) => (
                      <a
                        key={`${doc.url || doc.name || "document"}-${index}`}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 underline"
                      >
                        {doc.name || `Document ${index + 1}`}
                      </a>
                    ),
                  )}
                </div>
              )}
              <input
                type="file"
                id={field.name}
                required={required}
                className={commonClasses}
                onBlur={() => handleBlur(field.name)}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                    const existingFiles = Array.isArray(formData[field.name])
    ? (formData[field.name] as File[])
    : [];

  const updatedFiles = [...existingFiles, ...files];
handleChange(field.name, updatedFiles);
field.onChange?.(updatedFiles);
                }}
                placeholder={field.placeholder}
                disabled={field.disabled}
                accept={field.accept}
                multiple={field.multiple}
              />
            </div>
          );
case "document-manager": {
  const deletedDocumentIds = formData[`${field.name}DeletedIds`];
  const remainingExistingDocuments = existingDocuments;

  const updateNewDocuments = (rows: typeof documentRows) => {
    handleChange(
      field.name,
      rows
        .filter((row) => row.documentType && row.file)
.map((row) => ({
  documentType: row.documentType,
  customDocumentName:
    row.documentType === "OTHER"
      ? row.customDocumentName.trim()
      : "",
  file: row.file as File,
}))
        .filter((row) => row.documentType),
    );
  };

  return (
    <div className="space-y-3">
      {remainingExistingDocuments.map((document, index) => {
        const id = document._id || document.id;
        const href = document.url || document.filePath;
        return (
          <div key={id || `${documentLabel(document, index)}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate text-sm text-blue-600 underline">
                {documentLabel(document, index)}
              </a>
            ) : (
              <span className="min-w-0 truncate text-sm text-slate-700">{documentLabel(document, index)}</span>
            )}
            <button
              type="button"
              aria-label={`Delete ${documentLabel(document, index)}`}
              onClick={() => setDocumentPendingDeletion(document)}
              className="shrink-0 text-lg leading-none text-slate-500 hover:text-red-600"
            >
              ×
            </button>
          </div>
        );
      })}

      {documentRows.map((row, index) => (
        <div
          key={index}
          className="flex gap-2 items-center"
        >
<select
  className={commonClasses}
  value={row.documentType}
  onChange={(e) => {
    const updatedRows = [...documentRows];

    updatedRows[index].documentType =
      e.target.value;

    setDocumentRows(updatedRows);

    updateNewDocuments(updatedRows);
  }}
>
            <option value="">
              Select Document Type
            </option>

            {(field.documentTypes || DOCTOR_DOCUMENT_TYPES).map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
</select>

{row.documentType === "OTHER" && (
  <input
    type="text"
    aria-label="Document Name"
    placeholder="Document Name"
    className={commonClasses}
    value={row.customDocumentName}
    onChange={(e) => {
      const updatedRows = [...documentRows];
      updatedRows[index].customDocumentName = e.target.value;
      setDocumentRows(updatedRows);
      updateNewDocuments(updatedRows);
    }}
  />
)}

<div className="relative w-56 shrink-0">
  <input
    id={`document-file-${index}`}
    type="file"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0] || null;

      const updatedRows = [...documentRows];
      updatedRows[index].file = file;

      setDocumentRows(updatedRows);
      updateNewDocuments(updatedRows);
    }}
  />

  <label
    htmlFor={`document-file-${index}`}
    className={`${commonClasses} flex h-full items-center cursor-pointer overflow-hidden`}
  >
    <span className="block w-full truncate">
      {row.file ? row.file.name : "Choose File"}
    </span>
  </label>
</div>
          {index === documentRows.length - 1 ? (
            <button
              type="button"
              onClick={() =>
                setDocumentRows([
                  ...documentRows,
                  {
                    documentType: "",
                    customDocumentName: "",
                    file: null,
                  },
                ])
              }
            >
              +
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDocumentRows(
                  documentRows.filter((_, i) => i !== index)
                );
                updateNewDocuments(documentRows.filter((_, i) => i !== index));
              }}
            >
              -
            </button>
          )}
        </div>
      ))}

      {documentPendingDeletion && (
        <Modal
          isOpen={true}
          onClose={() => setDocumentPendingDeletion(null)}
          title="Delete Document"
          size="sm"
          footer={
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setDocumentPendingDeletion(null)}>Cancel</Button>
              <Button
                type="button"
                onClick={() => {
const filePath = documentPendingDeletion.filePath;

setExistingDocuments((documents) =>
  documents.filter((document) => document !== documentPendingDeletion)
);

if (filePath) {
  const previousPaths = Array.isArray(deletedDocumentIds)
    ? deletedDocumentIds
    : [];

  handleChange(
    `${field.name}DeletedIds`,
    [...previousPaths, filePath]
  );
}
                  setDocumentPendingDeletion(null);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          }
        >
          <p className="text-slate-700">Are you sure you want to delete this document?</p>
        </Modal>
      )}

    </div>
  );
}



  
case "patient-document-manager":
  const deletedDocumentIds = formData[`${field.name}DeletedIds`];
  return (
    <div className="space-y-3">
            {existingPatientDocuments.map((document, index) => {
        const id = document._id || document.id;
        const href = document.url || document.filePath;
        return (
          <div key={id || `${documentLabel(document, index)}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate text-sm text-blue-600 underline">
                {documentLabel(document, index)}
              </a>
            ) : (
              <span className="min-w-0 truncate text-sm text-slate-700">{documentLabel(document, index)}</span>
            )}
            <button
              type="button"
              aria-label={`Delete ${documentLabel(document, index)}`}
              onClick={() => setDocumentPendingDeletion(document)}
              className="shrink-0 text-lg leading-none text-slate-500 hover:text-red-600"
            >
              ×
            </button>
          </div>
        );
      })}
      {patientDocumentRows.map((row, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-slate-200 p-3"
        >
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Document Name</span>
            <input
              type="text"
              placeholder="Document Name"
              className={commonClasses}
              value={row.documentName}
              onChange={(e) => {
                const updatedRows = [...patientDocumentRows];
                updatedRows[index].documentName = e.target.value;
                setPatientDocumentRows(updatedRows);
                handleChange(
                  field.name,
                  updatedRows.filter((row) => row.documentName.trim() && row.file),
                );
              }}
            />
          </label>

<label className="block space-y-1">
  <span className="text-sm font-medium text-slate-700">
    Choose File
  </span>

  {row.file && row.previewUrl ? (
    <div className="relative w-full rounded-lg border border-slate-200 bg-slate-50 p-3">
      <img
        src={row.previewUrl}
        alt="Selected document"
        className="h-32 w-full rounded-lg object-contain"
      />

      <button
        type="button"
        onClick={() => {
          const updatedRows = [...patientDocumentRows];

          if (updatedRows[index].previewUrl) {
            URL.revokeObjectURL(updatedRows[index].previewUrl);
          }

          updatedRows[index] = {
            ...updatedRows[index],
            file: null,
            previewUrl: "",
          };

          setPatientDocumentRows(updatedRows);

          handleChange(
            field.name,
            updatedRows.filter(
              (row) => row.documentName.trim() && row.file
            )
          );
        }}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 shadow hover:bg-red-50"
      >
        ×
      </button>
    </div>
  ) : (
    <div>
      <input
        id={`patient-document-${index}`}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          const updatedRows = [...patientDocumentRows];

          if (updatedRows[index].previewUrl) {
            URL.revokeObjectURL(updatedRows[index].previewUrl);
          }

          updatedRows[index] = {
            ...updatedRows[index],
            file,
            previewUrl: URL.createObjectURL(file),
          };

          setPatientDocumentRows(updatedRows);

          handleChange(
            field.name,
            updatedRows.filter(
              (row) => row.documentName.trim() && row.file
            )
          );
        }}
      />

      <label
        htmlFor={`patient-document-${index}`}
        className="flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Choose File
      </label>
    </div>
  )}
</label>

          <button
            type="button"
            onClick={() => {
              const updatedRows = patientDocumentRows.filter((_, i) => i !== index);
              setPatientDocumentRows(updatedRows);
              handleChange(
                field.name,
                updatedRows.filter((row) => row.documentName.trim() && row.file),
              );
            }}
            className="px-3 py-2 rounded border"
          >
            -
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setPatientDocumentRows([
            ...patientDocumentRows,
            { documentName: "", file: null },
          ])
        }
        className="px-3 py-2 rounded border"
      >
        + Add Another
      </button>
      {documentPendingDeletion && (
  <Modal
    isOpen={true}
    onClose={() => setDocumentPendingDeletion(null)}
    title="Delete Document"
    size="sm"
    footer={
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDocumentPendingDeletion(null)}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={() => {
            const filePath = documentPendingDeletion.filePath;

            setExistingPatientDocuments((documents) =>
              documents.filter(
                (document) => document !== documentPendingDeletion
              )
            );

            if (filePath) {
              const previousPaths = Array.isArray(deletedDocumentIds)
                ? deletedDocumentIds
                : [];

              handleChange(
                `${field.name}DeletedIds`,
                [...previousPaths, filePath]
              );
            }

            setDocumentPendingDeletion(null);
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          Delete
        </Button>
      </div>
    }
  >
    <p className="text-slate-700">
      Are you sure you want to delete this document?
    </p>
  </Modal>
)}
    </div>
  );
  case "checkbox-group":
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {field.options?.map((option) => {
        const values = Array.isArray(formData[field.name])
          ? (formData[field.name] as string[])
          : [];

        const selected = values.includes(option.value);

        return (
          <label
            key={option.value}
            className={`
              flex items-center justify-center
              h-11 rounded-lg border
              cursor-pointer transition-all
              text-sm font-medium
              ${
                selected
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-white border-slate-300 text-slate-700 hover:border-blue-300"
              }
            `}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={selected}
                onBlur={() => handleBlur(field.name)}
              disabled={field.disabled}
              onChange={(e) => {
                const updated = e.target.checked
                  ? [...values, option.value]
                  : values.filter((v) => v !== option.value);

                handleChange(field.name, updated);
              }}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
  

      default:
  return field.type === "password" ? (
    <div className="relative">
      <input
        type={showPassword[field.name] ? "text" : "password"}
        id={field.name}
        required={required}
          onBlur={() => handleBlur(field.name)}
        className={`${commonClasses} pr-10`}
        value={fieldValueAsString(formData[field.name])}
        onChange={(e) => {
          handleChange(field.name, e.target.value);
          field.onChange?.(e.target.value);
        }}
        placeholder={field.placeholder}
        disabled={field.disabled}
      />

      <button
        type="button"
        onClick={() =>
          setShowPassword((prev) => ({
            ...prev,
            [field.name]: !prev[field.name],
          }))
        }
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
      >
        {showPassword[field.name] ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  ) : (


    
    <input
      type={field.type}
      id={field.name}
      required={required}
      className={commonClasses}
        onBlur={() => handleBlur(field.name)}
        onClick={(e) => {
  const input = e.currentTarget;

  if (
    (field.type === "date" || field.type === "time") &&
    typeof input.showPicker === "function"
  ) {
    input.showPicker();
  }
}}
      value={fieldValueAsString(formData[field.name])}
onChange={(e) => {
  let value = e.target.value;

  // Restrict phone fields
if (
  field.name === "phone" ||
  field.name === "phoneNumber" ||
  field.name === "emergencyContactPhone" ||
  field.name === "emergencyContact"
) {
  value = value.replace(/\D/g, "").slice(0, 10);
}

  // Restrict Aadhaar fields
  if (
    field.name === "aadhaar" ||
    field.name === "adhar"
  ) {
    value = value.replace(/\D/g, "").slice(0, 12);
  }

  handleChange(field.name, value);
  field.onChange?.(value);
}}
      placeholder={field.placeholder}
      disabled={field.disabled}
      min={field.min}
      max={field.max}
      step={field.step}
    />
  );}};
    return (
      <div key={field.name} className={`space-y-2 ${widthClass}`}>
      
        {field.type !== "checkbox" && (
          <label htmlFor={field.name} className="text-sm font-medium text-slate-700">
            {field.label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {fieldComponent()}
        {errors[field.name] && (
          <p className="text-sm text-red-500">{errors[field.name]}</p>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={typeof title === "string" ? title : ""}
      size={size}
footer={
  mode === "alert" ? (
    <div className="flex justify-end">
<Button
  onClick={onClose}
  className="bg-blue-600 hover:bg-blue-700 text-white"
>
  OK
</Button>
    </div>
  ) : (
<div className="flex gap-3">
  <Button
    variant="outline"
    onClick={onClose}
    type="button"
    className="hover:bg-slate-100"
  >
    <X className="w-4 h-4 mr-2" />
    {cancelButtonText || "Cancel"}
  </Button>

  {showSaveButton && (
    <Button
      form={formId}
      type="submit"
      className="hover:scale-105 transition-transform"
      style={{
        background:
          saveButtonColor ||
          "linear-gradient(135deg,#1a73e8,#0ea5e9)",
      }}
    >
      <Plus className="w-4 h-4 mr-2" />
      {saveButtonText || (isEdit ? "Update" : "Create")}
    </Button>
  )}
</div>
  )
}
    >
    {mode === "alert" ? (
  <div className="py-4 text-slate-700">
    {message}
  </div>
) : (
  <form
    id={formId}
    onSubmit={handleSubmit}
    className="space-y-6"
  >
        {formSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-6">
            {section.title && (
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                {section.icon}
                {section.title}
              </h3>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.fields.map(renderField)}
            </div>
            
            {sectionIndex < formSections.length - 1 && (
              <hr className="border-slate-200" />
            )}
          </div>
        ))}
      </form>
)}
        {children}
    </Modal>
  );
    }
