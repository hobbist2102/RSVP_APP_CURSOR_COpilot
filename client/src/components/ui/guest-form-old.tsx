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
import { Plus, Trash, User, Users, MapPin, Utensils, Baby, Hotel, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface GuestFormProps {
  eventId?: number;
  guest?: any; // For compatibility with existing usage
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
  // Extended fields for guests
  gender: z.string().optional().nullable(),
  salutation: z.string().optional().nullable(),
  whatsappAvailable: z.boolean().default(false),
  
  // WhatsApp specifics
  whatsappSame: z.boolean().default(true),
  whatsappCountryCode: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  
  // Country code
  countryCode: z.string().optional().nullable(),
  
  // For allergies
  allergies: z.string().optional().nullable(),
  
  // Accommodation
  needsAccommodation: z.boolean().default(false),
  
  // Children handling
  childrenDetails: z.array(childSchema).default([]),
  childrenNotes: z.string().optional().nullable(),
  
  // Plus one details
  plusOneEmail: z.string().email().optional().or(z.literal("")),
  plusOnePhone: z.string().optional().nullable(),
  plusOneCountryCode: z.string().optional().nullable(),
  plusOneRelationship: z.string().optional().nullable(),
  plusOneRsvpContact: z.boolean().default(false),
  plusOneGender: z.string().optional().nullable(),
  plusOneSalutation: z.string().optional().nullable(),
  
  // Fix RSVP status validation
  rsvpStatus: z.enum(["pending", "confirmed", "declined", "yes", "no"]).default("pending")
});

export default function GuestForm({ eventId, guest, initialData, onSubmit, onCancel, isLoading = false }: GuestFormProps) {
  const [childrenCount, setChildrenCount] = useState(initialData?.childrenDetails?.length || guest?.childrenDetails?.length || 0);
  const [activeSection, setActiveSection] = useState("basic");
  
  // Merge guest data with initialData for backward compatibility
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

  // RELIABLE form pre-population for both initialData and guest props
  useEffect(() => {
    const dataToUse = guestData;
    if (dataToUse && Object.keys(dataToUse).length > 0) {
      const formData = {
        eventId: eventId || dataToUse.eventId,
        firstName: dataToUse.firstName || "",
        lastName: dataToUse.lastName || "",
        email: dataToUse.email || "",
        gender: dataToUse.gender || "",
        salutation: dataToUse.salutation || "",
        countryCode: dataToUse.countryCode || "+91",
        phone: dataToUse.phone || "",
        whatsappSame: dataToUse.whatsappSame !== false,
        whatsappCountryCode: dataToUse.whatsappCountryCode || "+91",
        whatsappNumber: dataToUse.whatsappNumber || "",
        whatsappAvailable: dataToUse.whatsappAvailable || false,
        address: dataToUse.address || "",
        side: dataToUse.side || "bride",
        isFamily: dataToUse.isFamily || false,
        relationship: dataToUse.relationship || "",
        rsvpStatus: dataToUse.rsvpStatus === "yes" ? "confirmed" : dataToUse.rsvpStatus === "no" ? "declined" : dataToUse.rsvpStatus || "pending",
        plusOneAllowed: dataToUse.plusOneAllowed || false,
        plusOneName: dataToUse.plusOneName || "",
        plusOneEmail: dataToUse.plusOneEmail || "",
        plusOnePhone: dataToUse.plusOnePhone || "",
        plusOneCountryCode: dataToUse.plusOneCountryCode || "+91",
        plusOneGender: dataToUse.plusOneGender || "",
        plusOneSalutation: dataToUse.plusOneSalutation || "",
        plusOneRelationship: dataToUse.plusOneRelationship || "",
        plusOneRsvpContact: dataToUse.plusOneRsvpContact || false,
        childrenDetails: dataToUse.childrenDetails || [],
        childrenNotes: dataToUse.childrenNotes || "",
        dietaryRestrictions: dataToUse.dietaryRestrictions || "",
        allergies: dataToUse.allergies || "",
        needsAccommodation: dataToUse.needsAccommodation || false,
        tableAssignment: dataToUse.tableAssignment || "",
        giftTracking: dataToUse.giftTracking || "",
        notes: dataToUse.notes || ""
      };
      
      form.reset(formData);
      setChildrenCount(dataToUse?.childrenDetails?.length || 0);
    }
  }, [guestData, form, eventId]);

  // Section definitions for professional organization
  const sections = [
    { id: "basic", label: "Basic Info", icon: User, description: "Personal details & contact" },
    { id: "rsvp", label: "RSVP Status", icon: Info, description: "Attendance & ceremonies" },
    { id: "relationship", label: "Relationship", icon: Users, description: "Connection to couple" },
    { id: "plusone", label: "Plus One", icon: Users, description: "Companion information" },
    { id: "children", label: "Children", icon: Baby, description: "Child guests & details" },
    { id: "dietary", label: "Dietary", icon: Utensils, description: "Food preferences & allergies" },
    { id: "accommodation", label: "Stay & Travel", icon: Hotel, description: "Lodging & travel needs" },
    { id: "additional", label: "Additional", icon: Info, description: "Extra notes & tracking" }
  ];

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Form submission - production ready
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

  // Get current section to display
  const getCurrentSection = () => {
    return sections.find(s => s.id === activeSection) || sections[0];
  };

  const isRSVPCompatible = (rsvpStatus: string) => {
    return ["pending", "confirmed", "declined"].includes(rsvpStatus);
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
                {React.createElement(Icon, { className: "h-4 w-4" })}
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
                  {React.createElement(getCurrentSection().icon, { className: "h-5 w-5 text-primary" })}
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

  // Render current section content
  function renderCurrentSection() {
    switch (activeSection) {
      case "basic":
        return renderBasicSection();
      case "rsvp":
        return renderRSVPSection();
      case "relationship":
        return renderRelationshipSection();
      case "plusone":
        return renderPlusOneSection();
      case "children":
        return renderChildrenSection();
      case "dietary":
        return renderDietarySection();
      case "accommodation":
        return renderAccommodationSection();
      case "additional":
        return renderAdditionalSection();
      default:
        return renderBasicSection();
    }
  }

  function renderBasicSection() {
    return (
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

        <div className="space-y-4">
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
      </div>
    );
  }

  function renderRSVPSection() {
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
              <FormDescription>
                Track the guest's response to your wedding invitation
              </FormDescription>
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
                <Input placeholder="Table number or name" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                Assign a table for seating arrangements
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  function renderRelationshipSection() {
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
              <FormDescription>
                How is this guest related to the couple?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFamily"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Family Member</FormLabel>
                <FormDescription>Check if this guest is a family member</FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    );
  }

  function renderPlusOneSection() {
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="plusOneRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="Spouse, Friend, etc." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="plusOneEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plus One Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="companion@example.com" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="plusOneCountryCode"
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
                name="plusOnePhone"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Plus One Phone</FormLabel>
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
              name="plusOneRsvpContact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Send RSVP to Plus One</FormLabel>
                    <FormDescription>Include plus one in RSVP communications</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    );
  }

  function renderChildrenSection() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Children Information</h4>
          <Button type="button" variant="outline" size="sm" onClick={addChild}>
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        </div>

        {form.watch("childrenDetails")?.map((child: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium">Child {index + 1}</h5>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeChild(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`childrenDetails.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Child's name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`childrenDetails.${index}.age`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Age" 
                        {...field} 
                        value={field.value || ""} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`childrenDetails.${index}.gender`}
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

        <FormField
          control={form.control}
          name="childrenNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes about Children</FormLabel>
              <FormControl>
                <Textarea placeholder="Any special requirements or notes" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  function renderDietarySection() {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Dietary information helps with meal planning and kitchen preparation for the wedding events.
          </p>
        </div>

        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Vegetarian, vegan, gluten-free, etc." 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription>
                List any dietary preferences or restrictions
              </FormDescription>
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
                <Textarea 
                  placeholder="Nuts, dairy, shellfish, etc." 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription>
                List any food allergies - this is important for safety
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  function renderAccommodationSection() {
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
  }

  function renderAdditionalSection() {
    return (
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="giftTracking"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gift Tracking</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Details about gift(s) received" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription>
                Track gifts received from this guest
              </FormDescription>
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
                <Textarea 
                  placeholder="Any other notes about this guest" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription>
                Special requirements, preferences, or important information
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  function renderRSVPSection() {
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
              <FormDescription>
                Track the guest's response to your wedding invitation
              </FormDescription>
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
                <Input placeholder="Table number or name" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                Assign a table for seating arrangements
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  function renderRelationshipSection() {
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
              <FormDescription>
                How is this guest related to the couple?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFamily"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Family Member</FormLabel>
                <FormDescription>Check if this guest is a family member</FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    );
  }

  function renderPlusOneSection() {
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="plusOneRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="Spouse, Friend, etc." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="plusOneEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plus One Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="companion@example.com" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="plusOneCountryCode"
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
                name="plusOnePhone"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Plus One Phone</FormLabel>
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
              name="plusOneRsvpContact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Send RSVP to Plus One</FormLabel>
                    <FormDescription>Include plus one in RSVP communications</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    );
  }
}
              <FormField
                control={form.control}
                name="plusOneCountryCode"
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
                name="plusOnePhone"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Plus One Phone</FormLabel>
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
              name="plusOneRsvpContact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Send RSVP to Plus One</FormLabel>
                    <FormDescription>Include plus one in RSVP communications</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    );
  }

  function renderChildrenSection() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Children Information</h4>
          <Button type="button" variant="outline" size="sm" onClick={addChild}>
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        </div>

        {form.watch("childrenDetails")?.map((child: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium">Child {index + 1}</h5>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeChild(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={'childrenDetails.' + index + '.name'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Child's name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={'childrenDetails.' + index + '.age'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Age" 
                        {...field} 
                        value={field.value || ""} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={'childrenDetails.' + index + '.gender'}
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

        <FormField
          control={form.control}
          name="childrenNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes about Children</FormLabel>
              <FormControl>
                <Textarea placeholder="Any special requirements or notes" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  function renderDietarySection() {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Dietary information helps with meal planning and kitchen preparation for the wedding events.
          </p>
        </div>

        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Vegetarian, vegan, gluten-free, etc." 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription>
                List any dietary preferences or restrictions
              </FormDescription>
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
                <Textarea 
                  placeholder="Nuts, dairy, shellfish, etc." 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription>
                List any food allergies - this is important for safety
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  function renderAccommodationSection() {
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
  }

  function renderAdditionalSection() {
    return (
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="giftTracking"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gift Tracking</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Details about gift(s) received" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription>
                Track gifts received from this guest
              </FormDescription>
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
                <Textarea 
                  placeholder="Any other notes about this guest" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription>
                Special requirements, preferences, or important information
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Phone</FormLabel>
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
              name="whatsappAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available on WhatsApp</FormLabel>
                    <FormDescription>
                      Check if this guest can receive WhatsApp messages
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("whatsappAvailable") && (
              <div className="space-y-4 border-l-2 border-primary/20 pl-4">
                <FormField
                  control={form.control}
                  name="whatsappSame"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>WhatsApp same as phone number</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                {!form.watch("whatsappSame") && (
                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="whatsappCountryCode"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel>WhatsApp Code</FormLabel>
                          <FormControl>
                            <Input placeholder="+91" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel>WhatsApp Number</FormLabel>
                          <FormControl>
                            <Input placeholder="9876543210" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                    <Textarea placeholder="Enter full address" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-6 border-t pt-6 mt-6">
              <h3 className="text-lg font-medium">Relationship Information</h3>
              
              <FormField
                control={form.control}
                name="side"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Association*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guest association" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bride">Bride's Guest</SelectItem>
                        <SelectItem value="groom">Groom's Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This helps with seating arrangements and communications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
                        
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="isFamily"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Family Member</FormLabel>
                      </div>
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
                      <Input placeholder="Friend of the bride" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="needsAccommodation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Needs Accommodation</FormLabel>
                    <FormDescription>
                      Check if the guest needs accommodation arrangements
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-xl font-playfair">RSVP Information</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage guest attendance and plus ones</p>
            </div>
            
            <FormField
              control={form.control}
              name="rsvpStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RSVP Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                  >
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
                    <Input placeholder="Table number or name" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Card className="border border-gray-200">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-4">Plus One Information</h4>
                
                <FormField
                  control={form.control}
                  name="plusOneAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Plus One Allowed</FormLabel>
                        <FormDescription>
                          Check if guest can bring a companion
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch("plusOneAllowed") && (
                  <div className="space-y-4 border-l-2 border-primary/20 pl-4">
                    <FormField
                      control={form.control}
                      name="plusOneName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plus One Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="plusOneGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || ""}
                            >
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
                        name="plusOneSalutation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salutation</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select salutation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Mr.">Mr.</SelectItem>
                                <SelectItem value="Mrs.">Mrs.</SelectItem>
                                <SelectItem value="Ms.">Ms.</SelectItem>
                                <SelectItem value="Dr.">Dr.</SelectItem>
                                <SelectItem value="Prof.">Prof.</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="plusOneEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plus One Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jane.doe@example.com" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="plusOneCountryCode"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
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
                        name="plusOnePhone"
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormLabel>Plus One Phone</FormLabel>
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
                      name="plusOneRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship to Main Guest</FormLabel>
                          <FormControl>
                            <Input placeholder="Spouse, Partner, Friend, etc." {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plusOneRsvpContact"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Set Plus One as Primary RSVP Contact</FormLabel>
                            <FormDescription>
                              If checked, RSVP communications will be directed to the plus one
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Children Information</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addChild}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Child
                  </Button>
                </div>
                
                {childrenCount > 0 ? (
                  <div className="space-y-6">
                    {form.watch("childrenDetails")?.map((child, index) => (
                      <div key={index} className="p-4 border rounded-md relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeChild(index)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                        
                        <h5 className="font-medium mb-3">Child {index + 1}</h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={"childrenDetails." + index + ".name"}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Child's name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={"childrenDetails." + index + ".age"}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Age" 
                                    {...field} 
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      field.onChange(isNaN(value) ? 0 : value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name={"childrenDetails." + index + ".gender"}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value || ""}
                                >
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
                            name={"childrenDetails." + index + ".salutation"}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Salutation</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select salutation" />
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
                        </div>
                      </div>
                    ))}
                    
                    <FormField
                      control={form.control}
                      name="childrenNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes for Children</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Special requirements, allergies, etc." 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No children added</p>
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-medium">Dietary Information</h4>
              
              <FormField
                control={form.control}
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Restrictions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Vegetarian, vegan, etc." {...field} value={field.value || ""} />
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
                      <Textarea placeholder="Nuts, dairy, gluten, etc." {...field} value={field.value || ""} />
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
                    <Textarea placeholder="Details about gift(s) received" {...field} value={field.value || ""} />
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
                    <Textarea placeholder="Any other notes about this guest" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950">
            {isLoading ? "Saving..." : "Save Guest"}
          </Button>
        </div>
      </form>
    </Form>
  );
}