"use client";

import { FormEvent, ReactNode, useId, useMemo, useState } from "react";
import { Plus, X ,Eye, EyeOff} from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "../ui/modal";

export type FieldType = "text" | "email" | "tel" | "number" | "password" | "textarea" | "select" | "radio" | "checkbox" | "date" | "time"| "checkbox-group";
export type FormDataValue = unknown;
export type ReusableFormData = Record<string, FormDataValue>;

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean | ((formData: ReusableFormData) => boolean);
  placeholder?: string;
  options?: Array<{ value: string; label: string; color?: string }>;
  width?: "full" | "half" | "third" | "quarter";
  defaultValue?: FormDataValue;
  disabled?: boolean;
  hidden?: boolean | ((formData: ReusableFormData) => boolean);
  rows?: number; // For textarea
  min?: number; // For number input
  max?: number; // For number input
  onChange?: (value: unknown) => void;
  step?: number; // For number input
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
  onSave: (data: ReusableFormData) => void;
  title: string | ReactNode;
  sections?: FormSection[];
  fields?: FieldConfig[]; // Alternative flat structure
  initialData?: ReusableFormData;
  isEdit?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  saveButtonText?: string;
  cancelButtonText?: string;
  saveButtonColor?: string;
  validationOnChange?: boolean;
  children?: ReactNode;
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
   children,
}: ReusableModalProps) {
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
      saveButtonColor={saveButtonColor}
      saveButtonText={saveButtonText}
      size={size}
      title={title}
      validationOnChange={validationOnChange}
    >
     {children}
  </ReusableModalContent>
  );
}

interface ReusableModalContentProps extends Required<Pick<ReusableModalProps, "isOpen" | "onClose" | "onSave" | "isEdit" | "size" | "validationOnChange">> {
  cancelButtonText?: string;
  formId: string;
  formSections: FormSection[];
  initialData: ReusableFormData;
  saveButtonColor?: string;
  saveButtonText?: string;
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

function ReusableModalContent({
  cancelButtonText,
  formId,
  formSections,
  initialData,
  isEdit,
  isOpen,
  onClose,
  onSave,
  saveButtonColor,
  saveButtonText,
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
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (name: string, value: FormDataValue) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    if (validationOnChange) {
      const error = validateField(name, value, newFormData);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    }
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
      value={fieldValueAsString(formData[field.name])}
      onChange={(e) => {
        handleChange(field.name, e.target.value);
        field.onChange?.(e.target.value);
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
          <Button
            form={formId}
            type="submit"
            className="hover:scale-105 transition-transform"
            style={{
              background: saveButtonColor || "linear-gradient(135deg, #1a73e8, #0ea5e9)"
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {saveButtonText || (isEdit ? "Update" : "Create")}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-6">
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
        {children}
    </Modal>
  );
    }
