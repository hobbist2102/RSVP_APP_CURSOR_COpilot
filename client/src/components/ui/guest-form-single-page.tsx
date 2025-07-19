import React, { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertGuestSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Heart, Utensils, UserPlus, Bed, Baby, Plus, Trash } from "lucide-react";
import { useState } from "react";

interface GuestFormProps {
  eventId?: number;
  guest?: any;
  initialData?: Partial<z.infer<typeof formSchema>>;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const childSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.union([
    z.number().min(0, "Age must be a positive number"),
    z.string().transform((val) => parseInt(val) || 0)
  ]),
  gender: z.string().optional(),
  salutation: z.string().optional()
});

const formSchema = insertGuestSchema.extend({
  gender: z.string().optional().nullable(),
  salutation: z.string().optional().nullable(),
  whatsappAvailable: z.boolean().default(false),
  whatsappSame: z.boolean().default(true),
  whatsappCountryCode: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  countryCode: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  needsAccommodation: z.boolean().default(false),
  childrenDetails: z.array(childSchema).default([]),
  childrenNotes: z.string().optional().nullable(),
  plusOneEmail: z.string().email().optional().or(z.literal("")),
  plusOnePhone: z.string().optional().nullable(),
  plusOneCountryCode: z.string().optional().nullable(),
  plusOneRelationship: z.string().optional().nullable(),
  plusOneRsvpContact: z.boolean().default(false),
  plusOneGender: z.string().optional().nullable(),
  plusOneSalutation: z.string().optional().nullable(),
  rsvpStatus: z.enum(["pending", "confirmed", "declined", "yes", "no"]).default("pending")
});

export default function GuestFormSinglePage({ eventId, guest, initialData, onSubmit, onCancel, isLoading = false }: GuestFormProps) {
  const [childrenCount, setChildrenCount] = useState(0);
  const guestData = initialData || guest;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId: eventId || guestData?.eventId,
      firstName: guestData?.firstName || "",
      lastName: guestData?.lastName || "",
      email: guestData?.email || "",
      gender: guestData?.gender || "",
      salutation: guestData?.salutation || "",
      countryCode: guestData?.countryCode || "+91",
      phone: guestData?.phone || "",
      whatsappSame: guestData?.whatsappSame !== false,
      whatsappCountryCode: guestData?.whatsappCountryCode || "+91",
      whatsappNumber: guestData?.whatsappNumber || "",
      whatsappAvailable: guestData?.whatsappAvailable || false,
      address: guestData?.address || "",
      side: guestData?.side || "bride",
      isFamily: guestData?.isFamily || false,
      relationship: guestData?.relationship || "",
      rsvpStatus: guestData?.rsvpStatus === "yes" ? "confirmed" : guestData?.rsvpStatus === "no" ? "declined" : guestData?.rsvpStatus || "pending",
      plusOneAllowed: guestData?.plusOneAllowed || false,
      plusOneName: guestData?.plusOneName || "",
      plusOneEmail: guestData?.plusOneEmail || "",
      plusOnePhone: guestData?.plusOnePhone || "",
      plusOneCountryCode: guestData?.plusOneCountryCode || "+91",
      plusOneGender: guestData?.plusOneGender || "",
      plusOneSalutation: guestData?.plusOneSalutation || "",
      plusOneRelationship: guestData?.plusOneRelationship || "",
      plusOneRsvpContact: guestData?.plusOneRsvpContact || false,
      childrenDetails: guestData?.childrenDetails || [],
      childrenNotes: guestData?.childrenNotes || "",
      dietaryRestrictions: guestData?.dietaryRestrictions || "",
      allergies: guestData?.allergies || "",
      needsAccommodation: guestData?.needsAccommodation || false,
      tableAssignment: guestData?.tableAssignment || "",
      giftTracking: guestData?.giftTracking || "",
      notes: guestData?.notes || ""
    }
  });

  // Form pre-population when data loads
  useEffect(() => {
    if (guestData && Object.keys(guestData).length > 0) {
      const formData = {
        eventId: eventId || guestData.eventId,
        firstName: guestData.firstName || "",
        lastName: guestData.lastName || "",
        email: guestData.email || "",
        gender: guestData.gender || "",
        salutation: guestData.salutation || "",
        countryCode: guestData.countryCode || "+91",
        phone: guestData.phone || "",
        whatsappSame: guestData.whatsappSame !== false,
        whatsappCountryCode: guestData.whatsappCountryCode || "+91",
        whatsappNumber: guestData.whatsappNumber || "",
        whatsappAvailable: guestData.whatsappAvailable || false,
        address: guestData.address || "",
        side: guestData.side || "bride",
        isFamily: guestData.isFamily || false,
        relationship: guestData.relationship || "",
        rsvpStatus: guestData.rsvpStatus === "yes" ? "confirmed" : guestData.rsvpStatus === "no" ? "declined" : guestData.rsvpStatus || "pending",
        plusOneAllowed: guestData.plusOneAllowed || false,
        plusOneName: guestData.plusOneName || "",
        plusOneEmail: guestData.plusOneEmail || "",
        plusOnePhone: guestData.plusOnePhone || "",
        plusOneCountryCode: guestData.plusOneCountryCode || "+91",
        plusOneGender: guestData.plusOneGender || "",
        plusOneSalutation: guestData.plusOneSalutation || "",
        plusOneRelationship: guestData.plusOneRelationship || "",
        plusOneRsvpContact: guestData.plusOneRsvpContact || false,
        childrenDetails: guestData.childrenDetails || [],
        childrenNotes: guestData.childrenNotes || "",
        dietaryRestrictions: guestData.dietaryRestrictions || "",
        allergies: guestData.allergies || "",
        needsAccommodation: guestData.needsAccommodation || false,
        tableAssignment: guestData.tableAssignment || "",
        giftTracking: guestData.giftTracking || "",
        notes: guestData.notes || ""
      };
      
      form.reset(formData);
    }
  }, [guestData, eventId, form]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          
          {/* Personal Information Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="salutation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mr">Mr</SelectItem>
                          <SelectItem value="Mrs">Mrs</SelectItem>
                          <SelectItem value="Ms">Ms</SelectItem>
                          <SelectItem value="Dr">Dr</SelectItem>
                          <SelectItem value="Prof">Prof</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="side"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Association *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select association" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bride">Bride's Guest</SelectItem>
                          <SelectItem value="groom">Groom's Guest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Uncle, Cousin, Friend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFamily"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Family Member</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Code</FormLabel>
                      <FormControl>
                        <Input placeholder="+91" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="whatsappAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Available on WhatsApp</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("whatsappAvailable") && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <FormField
                    control={form.control}
                    name="whatsappSame"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Same as phone number</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!form.watch("whatsappSame") && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="whatsappCountryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Country Code</FormLabel>
                            <FormControl>
                              <Input placeholder="+91" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="whatsappNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter WhatsApp number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* RSVP & Attendance Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-primary" />
                RSVP & Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="rsvpStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RSVP Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select RSVP status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tableAssignment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Assignment</FormLabel>
                    <FormControl>
                      <Input placeholder="Table number or name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Plus One Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-primary" />
                Plus One Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="plusOneAllowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Plus One Allowed</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("plusOneAllowed") && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="plusOneSalutation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plus One Title</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select title" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Mr">Mr</SelectItem>
                              <SelectItem value="Mrs">Mrs</SelectItem>
                              <SelectItem value="Ms">Ms</SelectItem>
                              <SelectItem value="Dr">Dr</SelectItem>
                              <SelectItem value="Prof">Prof</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="plusOneName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plus One Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter plus one name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="plusOneGender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plus One Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plusOneRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship to Guest</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Spouse, Partner, Friend" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="plusOneEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plus One Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name="plusOneCountryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input placeholder="+91" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="plusOnePhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plus One Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="plusOneRsvpContact"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Switch RSVP contact to plus one</FormLabel>
                          <div className="text-xs text-muted-foreground">
                            Check if plus one should receive RSVP communications instead of main guest
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Children Information Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Baby className="h-5 w-5 text-primary" />
                Children Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {form.watch("childrenDetails")?.length || 0} children added
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentChildren = form.getValues("childrenDetails") || [];
                    form.setValue("childrenDetails", [
                      ...currentChildren,
                      { name: "", age: 0, gender: "", salutation: "" }
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              </div>

              {form.watch("childrenDetails")?.map((child: any, index: number) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Child {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentChildren = form.getValues("childrenDetails") || [];
                        const updatedChildren = currentChildren.filter((_, i) => i !== index);
                        form.setValue("childrenDetails", updatedChildren);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`childrenDetails.${index}.salutation` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Title" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Master">Master</SelectItem>
                              <SelectItem value="Miss">Miss</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`childrenDetails.${index}.name` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Child Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter child name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`childrenDetails.${index}.age` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Age" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`childrenDetails.${index}.gender` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              {form.watch("childrenDetails")?.length > 0 && (
                <FormField
                  control={form.control}
                  name="childrenNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Notes about Children</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any special requirements or notes about the children" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Special Requirements Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Utensils className="h-5 w-5 text-primary" />
                Special Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="needsAccommodation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Needs Accommodation</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Restrictions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Vegetarian, Vegan, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List any allergies" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="giftTracking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gift Tracking</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Details about gifts received" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any other notes about this guest" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Saving..." : guest ? "Update Guest" : "Add Guest"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}