"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Upload,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  BriefcaseMedical,
  User,
  Shield,
  Building,
  Clock,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface DoctorFormData {
  name: string;
  qualification: string;
  registrationNumber: string;
  phoneNumber: string;
  experience: number;
  salary: string;
  unit: "morning" | "evening" | "rotational";
  email: string;
  password: string;
  gender: "male" | "female" | "other";
  government: boolean;
  adjunct: boolean;
  address: string;
  consultationFee: string;
  availabilityDays: string[];
  documents: string[];
  isActive: boolean;
  workingHours: {
  start: string;
  end: string;
};
}

interface DoctorFormProps {
  initialData?: DoctorFormData;
  onSubmit: (data: DoctorFormData) => void;
  mode: "add" | "edit";
  isQuickEdit?: boolean;
}

const availabilityDays = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export function DoctorForm({
  initialData,
  onSubmit,
  mode,
  isQuickEdit = false,
}: DoctorFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const defaultFormData: DoctorFormData = {
  name: "",
  qualification: "",
  registrationNumber: "",
  phoneNumber: "",
  experience: 0,
  salary: "",
  unit: "morning",
  email: "",
  password: "",
  gender: "male",
  government: false,
  adjunct: false,
  address: "",
  consultationFee: "",
  availabilityDays: [],
  documents: [],
  isActive: true,
  workingHours: {
    start: "",
    end: "",
  },
};
const [formData, setFormData] = useState<DoctorFormData>({
  ...defaultFormData,
  ...initialData,
  workingHours: {
    start: initialData?.workingHours?.start || "",
    end: initialData?.workingHours?.end || "",
  },
});

  const [errors, setErrors] = useState<Partial<Record<keyof DoctorFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DoctorFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.salary.trim()) newErrors.salary = "Salary is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (
    field: keyof DoctorFormData,
    value: DoctorFormData[keyof DoctorFormData],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckboxChange = (dayId: string, checked: boolean) => {
    const updatedDays = checked
      ? [...formData.availabilityDays, dayId]
      : formData.availabilityDays.filter((id) => id !== dayId);
    handleInputChange("availabilityDays", updatedDays);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newDocs = Array.from(files).map((file) => file.name);
      const updatedDocs = [...formData.documents, ...newDocs];
      handleInputChange("documents", updatedDocs);
    }
  };

  const removeDocument = (index: number) => {
    const updatedDocs = formData.documents.filter((_, i) => i !== index);
    handleInputChange("documents", updatedDocs);
  };

  if (isQuickEdit) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary">Salary *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="salary"
                placeholder="Enter salary"
                className="pl-10"
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
              />
            </div>
            {errors.salary && (
              <p className="text-sm text-red-500">{errors.salary}</p>
            )}
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select
              value={formData.unit}
              onValueChange={(value: "morning" | "evening" | "rotational") =>
                handleInputChange("unit", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Morning
                  </div>
                </SelectItem>
                <SelectItem value="evening">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Evening
                  </div>
                </SelectItem>
                <SelectItem value="rotational">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Rotational
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/*Working Hour*/}
          <div className="space-y-2">
  <Label>Start Time *</Label>
  <Input
    type="time"
    value={formData.workingHours.start}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          start: e.target.value,
        },
      }))
    }
  />
</div>

<div className="space-y-2">
  <Label>End Time *</Label>
  <Input
    type="time"
    value={formData.workingHours.end}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          end: e.target.value,
        },
      }))
    }
  />
</div>
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="phoneNumber"
                placeholder="+1 (555) 123-4567"
                className="pl-10"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="address"
                placeholder="Enter address"
                className="pl-10"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Password update email will be sent
            </p>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Update Doctor</Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="professional">Professional Details</TabsTrigger>
          <TabsTrigger value="additional">Additional Info</TabsTrigger>
        </TabsList>

        {/* Personal Details Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="name"
                      placeholder="Dr. John Smith"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value: "male" | "female" | "other") =>
                      handleInputChange("gender", value)
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal">
                        Male
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal">
                        Female
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal">
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@clinic.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="phoneNumber"
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Login Password *</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  First time password will be auto-generated and sent via email
                </p>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    className="pl-10 min-h-[100px]"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Details Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Qualification & Registration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Qualification */}
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification *</Label>
                  <div className="relative">
                    <BriefcaseMedical className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="qualification"
                      placeholder="MD, MBBS, etc."
                      className="pl-10"
                      value={formData.qualification}
                      onChange={(e) => handleInputChange("qualification", e.target.value)}
                    />
                  </div>
                  {errors.qualification && (
                    <p className="text-sm text-red-500">{errors.qualification}</p>
                  )}
                </div>

                {/* Registration Number */}
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="registrationNumber"
                      placeholder="REG-123456"
                      className="pl-10"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                    />
                  </div>
                  {errors.registrationNumber && (
                    <p className="text-sm text-red-500">{errors.registrationNumber}</p>
                  )}
                </div>
              </div>

              {/* Experience & Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Optional)</Label>
                  <Input
                    id="experience"
                      type="number"
                    placeholder="e.g., 5 years in Cardiology"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Detailed experience can be added later
                  </p>
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="salary"
                      placeholder="Enter salary"
                      className="pl-10"
                      value={formData.salary}
                      onChange={(e) => handleInputChange("salary", e.target.value)}
                    />
                  </div>
                  {errors.salary && (
                    <p className="text-sm text-red-500">{errors.salary}</p>
                  )}
                </div>
              </div>

              {/* Unit & Consultation Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unit */}
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value: "morning" | "evening" | "rotational") =>
                      handleInputChange("unit", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Morning
                        </div>
                      </SelectItem>
                      <SelectItem value="evening">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Evening
                        </div>
                      </SelectItem>
                      <SelectItem value="rotational">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Afternoon
                        </div>
                      </SelectItem>
                       <SelectItem value="rotational">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Night
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Consultation Fee */}
                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee (Optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="consultationFee"
                      placeholder="Enter fee amount"
                      className="pl-10"
                      value={formData.consultationFee}
                      onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Government & Adjunct */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Government */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Government Doctor</Label>
                    <p className="text-sm text-gray-500">
                      Check if doctor is government-employed
                    </p>
                  </div>
                  <Switch
                    checked={formData.government}
                    onCheckedChange={(checked) => handleInputChange("government", checked)}
                  />
                </div>

                {/* Adjunct */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Adjunct Faculty</Label>
                    <p className="text-sm text-gray-500">
                      Check if doctor is adjunct faculty
                    </p>
                  </div>
                  <Switch
                    checked={formData.adjunct}
                    onCheckedChange={(checked) => handleInputChange("adjunct", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Info Tab */}
        <TabsContent value="additional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Working Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workingHoursStart">Working Hour Start</Label>
                  <Input
                    id="workingHoursStart"
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workingHours: {
                          ...prev.workingHours,
                          start: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workingHoursEnd">Working Hour End</Label>
                  <Input
                    id="workingHoursEnd"
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workingHours: {
                          ...prev.workingHours,
                          end: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Availability Days */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Availability Days (Optional)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availabilityDays.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id}
                        checked={formData.availabilityDays.includes(day.id)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(day.id, checked === true)
                        }
                      />
                      <Label htmlFor={day.id} className="font-normal">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Document Upload (Optional)</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload doctor&apos;s documents (PDF, DOC, JPG, PNG)
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="doctor-documents"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("doctor-documents")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>

                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Documents:</h4>
                    <div className="space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Active Status */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Account Status</Label>
                  <p className="text-sm text-gray-500">
                    Deactivate to prevent login access
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => setFormData(initialData || {
          name: "",
          qualification: "",
          registrationNumber: "",
          phoneNumber: "",
          experience: 0,
          salary: "",
          unit: "morning",
          email: "",
          password: "",
          gender: "male",
          government: false,
          adjunct: false,
          address: "",
          consultationFee: "",
          availabilityDays: [],
          documents: [],
          isActive: true,
          workingHours: {
  start: "",
  end: "",
},
        })}>
          Reset
        </Button>
        <Button type="submit">
          {mode === "add" ? "Add Doctor" : "Update Doctor"}
        </Button>
      </div>
    </form>
  );
}
