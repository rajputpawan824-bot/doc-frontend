// components/dynamic-detail-modal.tsx
"use client";

import Modal from "@/components/ui/modal";
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  IndianRupee, 
  MapPin, 
  Shield,
  Briefcase,
  Building,
  Key,
  UserCheck,
  UserX,
  Monitor,
  Activity,
  FileText,
  Hash,
  Globe,
  Award,
  Banknote,
  Home,
  Smartphone,
  UserCog,
  Heart,
  Stethoscope,
  Pill,
  Bed,
  Clipboard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Star,
  TrendingUp,
  DollarSign,
  Percent,
  Target,
  BarChart,
  PieChart,
  CreditCard,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  Wifi,
  Battery,
  Cpu,
  Database,
  Server,
  Cloud,
  Download,
  Upload,
  Zap,
  Sun,
  Moon,
  Wind,
  Thermometer,
  Droplets
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ReactNode } from "react";

// ==================== TYPES ====================
export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'phone' 
  | 'date' 
  | 'datetime' 
  | 'currency' 
  | 'percentage'
  | 'badge'
  | 'status'
  | 'boolean'
  | 'switch'
  | 'progress'
  | 'rating'
  | 'tags'
  | 'json'
  | 'custom';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  icon?: ReactNode;
  format?: (value: unknown) => string | ReactNode;
  options?: {
    [key: string]: { label: string; color: string; icon?: ReactNode };
  };
  customRender?: (value: unknown, data: DetailData) => ReactNode;
  width?: 'full' | 'half' | 'third' | 'quarter';
  hideLabel?: boolean;
  important?: boolean;
}

type DetailData = Record<string, unknown>;

export interface SectionConfig {
  id: string;
  size?: number,
  title: string;
  description?: string;
  icon: ReactNode;
  fields: FieldConfig[];
  layout?: 'grid' | 'list' | 'stats' | 'cards';
  columns?: 1 | 2 | 3 | 4;
  bgColor?: string;
  borderColor?: string;
}

export interface ActionButton {
  label: string;
  onClick: (data: DetailData) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  confirm?: {
    title: string;
    message: string;
  };
}

export interface DynamicDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  data: DetailData | null | undefined;
  sections: SectionConfig[];
  actions?: ActionButton[];
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
    headerImage?: string;
  headerColor?: string;
  showRawData?: boolean;
  onFieldChange?: (key: string, value: unknown, data: DetailData) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}
// ==================== HELPER FUNCTIONS ====================
const getIconForField = (key: string, type: FieldType): ReactNode => {
  const iconMap: { [key: string]: ReactNode } = {
    // User related
    name: <Users className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    phone: <Phone className="w-4 h-4" />,
    address: <MapPin className="w-4 h-4" />,
    gender: <UserCog className="w-4 h-4" />,
    age: <Users className="w-4 h-4" />,
    dob: <Calendar className="w-4 h-4" />,
    
    // Medical
    bloodType: <Droplets className="w-4 h-4" />,
    condition: <Stethoscope className="w-4 h-4" />,
    diagnosis: <Clipboard className="w-4 h-4" />,
    medication: <Pill className="w-4 h-4" />,
    room: <Bed className="w-4 h-4" />,
    doctor: <Users className="w-4 h-4" />,
    
    // Financial
    salary: <Banknote className="w-4 h-4" />,
    price: <DollarSign className="w-4 h-4" />,
    amount: <IndianRupee className="w-4 h-4" />,
    discount: <Percent className="w-4 h-4" />,
    total: <CreditCard className="w-4 h-4" />,
    
    // Status & Metrics
    status: <Activity className="w-4 h-4" />,
    progress: <TrendingUp className="w-4 h-4" />,
    rating: <Star className="w-4 h-4" />,
    performance: <BarChart className="w-4 h-4" />,
    target: <Target className="w-4 h-4" />,
    
    // Technical
    id: <Hash className="w-4 h-4" />,
    code: <Code className="w-4 h-4" />,
    category: <Tag className="w-4 h-4" />,
    type: <FileText className="w-4 h-4" />,
    version: <Cpu className="w-4 h-4" />,
    
    // Dates
    createdAt: <Calendar className="w-4 h-4" />,
    updatedAt: <Calendar className="w-4 h-4" />,
    date: <Calendar className="w-4 h-4" />,
    time: <Clock className="w-4 h-4" />,
    
    // Default by type
    default: <Info className="w-4 h-4" />,
  };

  return iconMap[key.toLowerCase()] || iconMap[type] || iconMap.default;
};

const formatValue = (value: unknown, field: FieldConfig): ReactNode => {
  if (field.format) {
    return field.format(value);
  }

  switch (field.type) {
    case 'date':
      return value ? format(new Date(value), 'PPP') : 'N/A';
    
    case 'datetime':
      return value ? format(new Date(value), 'PPpp') : 'N/A';
    
    case 'currency':
      return (
        <div className="flex items-center gap-1">
          <IndianRupee className="w-4 h-4" />
          <span>{Number(value).toLocaleString('en-IN')}</span>
        </div>
      );
    
    case 'percentage':
      return <span>{value}%</span>;
    
    case 'badge':
      return (
        <Badge variant="outline" className="capitalize">
          {String(value)}
        </Badge>
      );
    
    case 'status':
      const statusColors: { [key: string]: string } = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
      };
      
      const color = statusColors[String(value).toLowerCase()] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={`${color} capitalize`}>
          {String(value)}
        </Badge>
      );
    
    case 'boolean':
      return value ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Yes</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="w-4 h-4" />
          <span>No</span>
        </div>
      );
    
    case 'switch':
      return (
        <Switch checked={Boolean(value)} disabled />
      );
    
    case 'rating':
      return (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Number(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="ml-2 text-sm">({value})</span>
        </div>
      );
    
    case 'tags':
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        );
      }
      return <span>{String(value)}</span>;
    
    case 'json':
      return (
        <pre className="text-xs bg-slate-50 p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    
    default:
      return <span>{value != null ? String(value) : 'N/A'}</span>;
  }
};

const getWidthClass = (width: FieldConfig['width']) => {
  switch (width) {
    case 'half': return 'md:col-span-1';
    case 'third': return 'md:col-span-1';
    case 'quarter': return 'md:col-span-1';
    default: return 'md:col-span-2';
  }
};

interface ValidationRuleLike {
  pattern?: { value?: RegExp };
  minLength?: { value?: number };
  maxLength?: { value?: number };
  validate?: (value: unknown) => true | string;
  required?: string | boolean;
}

interface TransformedValidation {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  custom?: (value: unknown) => string | null;
}

export function transformValidation(validationRule?: ValidationRuleLike) {
  if (!validationRule) return undefined;
  
  const transformed: TransformedValidation = {};
  
  if (validationRule.pattern?.value) {
    transformed.pattern = validationRule.pattern.value;
  }
  
  if (validationRule.minLength?.value) {
    transformed.minLength = validationRule.minLength.value;
  }
  
  if (validationRule.maxLength?.value) {
    transformed.maxLength = validationRule.maxLength.value;
  }
  
  if (validationRule.validate) {
    transformed.custom = (value: unknown) => {
      const result = validationRule.validate(value);
      return result === true ? null : (result as string);
    };
  }
  
  if (validationRule.required) {
    // For required validation, we'll handle it separately in the component
    transformed.custom = transformed.custom 
      ? (value: unknown) => {
          const result = validationRule.validate ? validationRule.validate(value) : true;
          if (!value || value === '') {
            return typeof validationRule.required === 'string' 
              ? validationRule.required 
              : 'This field is required';
          }
          return result === true ? null : (result as string);
        }
      : (value: unknown) => {
          if (!value || value === '') {
            return typeof validationRule.required === 'string' 
              ? validationRule.required 
              : 'This field is required';
          }
          return null;
        };
  }
  
  return Object.keys(transformed).length > 0 ? transformed : undefined;
}

const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

// ==================== MAIN COMPONENT ====================
export default function DynamicDetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  data,
  sections,
  actions = [],
  size = 'xl',
  headerImage,
  headerColor,
  showRawData = false,
  onFieldChange,
  isLoading = false,
  emptyMessage = "No data available"
}: DynamicDetailModalProps) {
  const getModalSize = (size: DynamicDetailModalProps['size']) => {
    switch (size) {
      case 'sm':
      case 'md':
      case 'lg':
      case 'xl':
      case '2xl':
      case '3xl':
      case '4xl':
        return size; // These are already valid
      case 'full':
        return '4xl'; // Map 'full' to '4xl' (the largest available)
      default:
        return 'xl';
    }
  };
  if (!data && !isLoading) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={getModalSize(size)}
      showCloseButton={true}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: headerColor }}></div>
        </div>
      ) : !data ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold">No Data</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section */}
          {(data.name || data.title || headerImage) && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pb-6 border-b">
              {headerImage ? (
                <div className="flex-shrink-0">
                  <img
                    src={headerImage}
                    alt={data.name || data.title}
                    className="w-20 h-20 rounded-full object-cover border-2"
                    style={{ borderColor: headerColor }}
                  />
                </div>
              ) : data.name || data.title ? (
                <div className="flex-shrink-0">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: headerColor }}
                  >
                    {getInitials(data.name || data.title)}
                  </div>
                </div>
              ) : null}
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {data.name || data.title || 'Untitled'}
                    </h2>
                    {subtitle && (
                      <p className="text-muted-foreground mt-1">{subtitle}</p>
                    )}
                    {(data.status || data.type) && (
                      <div className="flex items-center gap-2 mt-2">
                        {data.status && (
                          <Badge 
                            className="capitalize"
                            style={{ 
                              backgroundColor: data.status === 'active' 
                                ? '#dcfce7' 
                                : data.status === 'inactive'
                                ? '#fee2e2'
                                : '#fef3c7',
                              color: data.status === 'active'
                                ? '#166534'
                                : data.status === 'inactive'
                                ? '#991b1b'
                                : '#92400e'
                            }}
                          >
                            {data.status}
                          </Badge>
                        )}
                        {data.type && (
                          <Badge variant="outline" className="capitalize">
                            {data.type}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {actions.length > 0 && (
                    <div className="flex gap-2 mt-2 md:mt-0 flex-wrap">
                      {actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant || 'default'}
                          size="sm"
                          onClick={() => {
                            if (action.confirm) {
                              if (window.confirm(`${action.confirm.title}\n\n${action.confirm.message}`)) {
                                action.onClick(data);
                              }
                            } else {
                              action.onClick(data);
                            }
                          }}
                          disabled={action.disabled || action.loading}
                          className="min-w-[100px]"
                        >
                          {action.loading ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
                            </>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Sections */}
          <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section) => (
              <div 
                key={section.id}
                className={`rounded-xl p-5 border shadow-sm ${section?.size === 50 ? 'col-span-1' : 'col-span-2'} ${
                  section.bgColor ? '' : 'bg-gradient-to-br from-white to-gray-50'
                }`}
                style={{
                  backgroundColor: section.bgColor,
                  borderColor: section.borderColor
                }}
              >
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-4">
                  {section.icon}
                  <div>
                    <h3 className="font-semibold text-lg">{section.title}</h3>
                    {section.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section Content */}
                {section.layout === 'list' ? (
                  <div className="space-y-4">
                    {section.fields.map((field) => {
                      const value = getNestedValue(data, field.key);
                      return (
                        <div key={field.key} className="flex items-start gap-4 py-2">
                          <div className="flex-shrink-0 w-32">
                            <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              {field.icon || getIconForField(field.key, field.type)}
                              {field.label}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            {field.customRender 
                              ? field.customRender(value, data)
                              : formatValue(value, field)
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : section.layout === 'stats' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {section.fields.map((field) => {
                      const value = getNestedValue(data, field.key);
                      return (
                        <div key={field.key} className="text-center p-4 bg-white rounded-lg border">
                          <div className="text-2xl font-bold mb-1" style={{ color: headerColor }}>
                            {field.customRender 
                              ? field.customRender(value, data)
                              : value
                            }
                          </div>
                          <div className="text-sm text-slate-500">{field.label}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : section.layout === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.fields.map((field) => {
                      const value = getNestedValue(data, field.key);
                      return (
                        <div key={field.key} className="bg-white p-4 rounded-lg border space-y-2">
                          <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            {field.icon || getIconForField(field.key, field.type)}
                            {field.label}
                          </div>
                          <div className="text-lg font-semibold">
                            {field.customRender 
                              ? field.customRender(value, data)
                              : formatValue(value, field)
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Default grid layout
                  <div className={`grid grid-cols-1 md:grid-cols-${section.columns || 2} gap-4`}>
                    {section.fields.map((field) => {
                      const value = getNestedValue(data, field.key);
                      return (
                        <div 
                          key={field.key} 
                          className={`space-y-2 ${getWidthClass(field.width)} ${
                            field.important ? 'md:col-span-2' : ''
                          }`}
                        >
                          {!field.hideLabel && (
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                              {field.icon || getIconForField(field.key, field.type)}
                              {field.label}
                            </div>
                          )}
                          <div className={`font-medium ${field.important ? 'text-lg' : ''}`}>
                            {field.customRender 
                              ? field.customRender(value, data)
                              : formatValue(value, field)
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

// Add missing icons
const Code = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const Tag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);
