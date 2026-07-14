"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload, Eye, EyeOff } from "lucide-react";

const clinicSchema = z.object({
  name: z.string().min(2, "Clinic name must be at least 2 characters"),
  image: z.string().optional(),
  location: z.string().min(5, "Location must be at least 5 characters"),
  mobileNumber: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  subscription: z.enum(["basic", "premium", "enterprise"]),
  isActive: z.boolean().default(true),
  workingHours: z
    .object({
      monday: z.object({
        open: z.string(),
        close: z.string(),
      }),
      tuesday: z.object({
        open: z.string(),
        close: z.string(),
      }),
      wednesday: z.object({
        open: z.string(),
        close: z.string(),
      }),
      thursday: z.object({
        open: z.string(),
        close: z.string(),
      }),
      friday: z.object({
        open: z.string(),
        close: z.string(),
      }),
      saturday: z.object({
        open: z.string(),
        close: z.string(),
      }),
      sunday: z.object({
        open: z.string(),
        close: z.string(),
      }),
    })
    .optional(),
});

const adminSchema = z.object({
  name: z.string().min(2, "Admin name must be at least 2 characters"),
  image: z.string().optional(),
  email: z.string().email("Invalid email address"),
  adminMobileNumber: z
    .string()
    .regex(/^\+?[\d\s-]{10,}$/, "Invalid mobile number"),
  lastUpdated: z.date().optional(),
});

const combinedSchema = z.object({
  clinic: clinicSchema,
  admin: adminSchema,
});
type ClinicFormValues = z.infer<typeof combinedSchema>;

const WORKING_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export function ClinicForm({ initialData, onSubmit, mode } : {
  initialData?: ClinicFormValues;
  onSubmit: (data: ClinicFormValues) => void;
  mode: "create" | "edit";
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("clinic");

  const defaultValues = initialData || {
    clinic: {
      name: "",
      image: "",
      location: "",
      mobileNumber: "",
      password: "",
      subscription: "basic",
      isActive: true,
      workingHours: {
        monday: { open: "09:00", close: "17:00" },
        tuesday: { open: "09:00", close: "17:00" },
        wednesday: { open: "09:00", close: "17:00" },
        thursday: { open: "09:00", close: "17:00" },
        friday: { open: "09:00", close: "17:00" },
        saturday: { open: "10:00", close: "14:00" },
        sunday: { open: "", close: "" },
      },
    },
    admin: {
      name: "",
      image: "",
      email: "",
      adminMobileNumber: "",
      lastUpdated: new Date(),
    },
  };

  const form = useForm({
    resolver: zodResolver(combinedSchema),
    defaultValues,
  });

  const handleSubmit = (data: ClinicFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clinic">Clinic Details</TabsTrigger>
            <TabsTrigger value="admin">Admin Details</TabsTrigger>
          </TabsList>

          {/* Clinic Details Tab */}
          <TabsContent value="clinic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Clinic Name & Image */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="clinic.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter clinic name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={form.watch("clinic.image")} />
                      <AvatarFallback>CL</AvatarFallback>
                    </Avatar>
                    <FormField
                      control={form.control}
                      name="clinic.image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Logo</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      field.onChange(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                id="clinic-image"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  document
                                    .getElementById("clinic-image")
                                    ?.click()
                                }
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Location */}
                <FormField
                  control={form.control}
                  name="clinic.location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter clinic address"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mobile Number & Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="clinic.mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Mobile Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clinic.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter password"
                              {...field}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Subscription & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="clinic.subscription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Plan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subscription" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="basic">
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  Basic
                                </Badge>
                                <span>Basic Plan</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="premium">
                              <div className="flex items-center">
                                <Badge variant="secondary" className="mr-2">
                                  Premium
                                </Badge>
                                <span>Premium Plan</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="enterprise">
                              <div className="flex items-center">
                                <Badge variant="default" className="mr-2">
                                  Enterprise
                                </Badge>
                                <span>Enterprise Plan</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clinic.isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Clinic Status
                          </FormLabel>
                          <FormDescription>
                            Deactivate clinic to prevent access
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Working Hours */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Working Hours (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {WORKING_DAYS.map((day) => (
                      <div key={day} className="space-y-2">
                        <label className="text-sm font-medium capitalize">
                          {day}
                        </label>
                        <div className="flex space-x-2">
                          <FormField
                            control={form.control}
                            name={`clinic.workingHours.${day}.open`}
                            render={({ field }) => (
                              <Input
                                type="time"
                                {...field}
                                className="w-full"
                              />
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`clinic.workingHours.${day}.close`}
                            render={({ field }) => (
                              <Input
                                type="time"
                                {...field}
                                className="w-full"
                              />
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Details Tab */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Admin Name & Image */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="admin.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter admin name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={form.watch("admin.image")} />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <FormField
                      control={form.control}
                      name="admin.image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Photo</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      field.onChange(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                id="admin-image"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  document
                                    .getElementById("admin-image")
                                    ?.click()
                                }
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Email & Mobile Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="admin.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="admin.adminMobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Mobile Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Last Updated */}
                <FormField
                  control={form.control}
                  name="admin.lastUpdated"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Last Updated</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-[240px] pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Last time the admin details were updated
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">
            {mode === "create" ? "Create Clinic" : "Update Clinic"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
