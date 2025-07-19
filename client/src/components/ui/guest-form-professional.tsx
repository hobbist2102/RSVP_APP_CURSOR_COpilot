import React, { useState, useEffect } from "react";
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
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash, User, Users, MapPin, Utensils, Baby, Hotel, Info, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

export default function GuestFormProfessional({ eventId, guest, initialData, onSubmit, onCancel, isLoading = false }: GuestFormProps) {
  const [childrenCount, setChildrenCount] = useState(0);
  const [activeSection, setActiveSection] = useState("basic");
  
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

  // Form pre-population
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
      setChildrenCount(guestData?.childrenDetails?.length || 0);
    }
  }, [guestData, form, eventId]);

  const sections = [
    { id: "basic", label: "Basic Info", icon: User, description: "Personal details & contact" },
    { id: "rsvp", label: "RSVP Status", icon: CheckCircle, description: "Attendance & ceremonies" },
    { id: "relationship", label: "Relationship", icon: Users, description: "Connection to couple" },
    { id: "plusone", label: "Plus One", icon: Users, description: "Companion information" },
    { id: "children", label: "Children", icon: Baby, description: "Child guests & details" },
    { id: "dietary", label: "Dietary", icon: Utensils, description: "Food preferences & allergies" },
    { id: "accommodation", label: "Stay & Travel", icon: Hotel, description: "Lodging & travel needs" },
    { id: "additional", label: "Additional", icon: Info, description: "Extra notes & tracking" }
  ];

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };
  
  const addChild = () => {
    const currentChildren = form.getValues("childrenDetails") || [];
    form.setValue("childrenDetails", [
      ...currentChildren, 
      { name: "", age: 0, gender: "", salutation: "" }
    ]);
    setChildrenCount(childrenCount + 1);
  };
  
  const removeChild = (index: number) => {
    const currentChildren = form.getValues("childrenDetails") || [];
    const newChildren = [...currentChildren];
    newChildren.splice(index, 1);
    form.setValue("childrenDetails", newChildren);
    setChildrenCount(childrenCount - 1);
  };

  const getCurrentSection = () => {
    return sections.find(s => s.id === activeSection) || sections[0];
  };

  const isRSVPCompatible = (rsvpStatus: string) => {
    return ["pending", "confirmed", "declined"].includes(rsvpStatus);
  };

  const renderBasicSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name*</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} value={field.value || ""} />
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
              <FormLabel>Last Name*</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="salutation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salutation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Mr.">Mr.</SelectItem>
                  <SelectItem value="Mrs.">Mrs.</SelectItem>
                  <SelectItem value="Ms.">Ms.</SelectItem>
                  <SelectItem value="Dr.">Dr.</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="john.doe@example.com" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name="countryCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="+91" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="col-span-3">
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="9876543210" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter full address" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="whatsappAvailable"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Available on WhatsApp</FormLabel>
              <FormDescription>Check if this guest can receive WhatsApp messages</FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case "basic":
        return renderBasicSection();
      case "rsvp":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                RSVP Status helps track guest responses and integrate with the 2-stage RSVP process.
              </p>
            </div>
            <FormField
              control={form.control}
              name="rsvpStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RSVP Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || "pending"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Track the guest's response to your wedding invitation</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case "relationship":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="side"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Association*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || "bride"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select side" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bride">Bride's Guest</SelectItem>
                      <SelectItem value="groom">Groom's Guest</SelectItem>
                      <SelectItem value="mutual">Mutual Friend</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input placeholder="Friend of the bride" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>How is this guest related to the couple?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case "plusone":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="plusOneAllowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Plus One Allowed</FormLabel>
                    <FormDescription>Check if guest can bring a companion</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {form.watch("plusOneAllowed") && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="text-sm font-medium">Plus One Details</h4>
                <FormField
                  control={form.control}
                  name="plusOneName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plus One Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Companion's name" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        );
      case "dietary":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Vegetarian, vegan, gluten-free, etc." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>List any dietary preferences or restrictions</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case "accommodation":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Accommodation details support Stage 2 RSVP process and travel coordination.
              </p>
            </div>
            <FormField
              control={form.control}
              name="needsAccommodation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Needs Accommodation</FormLabel>
                    <FormDescription>Check if guest requires hotel/lodging arrangements</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        );
      default:
        return renderBasicSection();
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <DialogDescription className="text-sm text-muted-foreground">
            {guestData ? "Edit guest details" : "Add new guest to your wedding"}
          </DialogDescription>
          {guestData?.rsvpStatus && (
            <Badge variant={isRSVPCompatible(guestData.rsvpStatus) ? "default" : "secondary"} className="mt-2">
              RSVP: {guestData.rsvpStatus.charAt(0).toUpperCase() + guestData.rsvpStatus.slice(1)}
            </Badge>
          )}
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-lg">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-background/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Current Section Content */}
          <Card className="glassmorphism">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <getCurrentSection().icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{getCurrentSection().label}</CardTitle>
                  <p className="text-sm text-muted-foreground">{getCurrentSection().description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderCurrentSection()}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="order-2 sm:order-1">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading} className="order-1 sm:order-2">
              {isLoading ? "Saving..." : guestData ? "Update Guest" : "Add Guest"}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </Form>
  );
}