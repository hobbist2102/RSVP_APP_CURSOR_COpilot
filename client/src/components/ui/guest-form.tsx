import React, { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash } from "lucide-react";

interface GuestFormProps {
  eventId: number;
  initialData?: any;
  onSubmit: (data: any) => void;
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
  plusOneEmail: z.string().email().optional().nullable(),
  plusOnePhone: z.string().optional().nullable(),
  plusOneCountryCode: z.string().optional().nullable(),
  plusOneRelationship: z.string().optional().nullable(),
  plusOneRsvpContact: z.boolean().default(false),
  plusOneGender: z.string().optional().nullable(),
  plusOneSalutation: z.string().optional().nullable()
});

export default function GuestForm({ eventId, initialData, onSubmit, isLoading = false }: GuestFormProps) {
  const [childrenCount, setChildrenCount] = useState(initialData?.childrenDetails?.length || 0);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId,
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      gender: initialData?.gender || "",
      salutation: initialData?.salutation || "",
      countryCode: initialData?.countryCode || "+91", // Default to India country code
      phone: initialData?.phone || "",
      whatsappSame: initialData?.whatsappSame !== false, // Default to true
      whatsappCountryCode: initialData?.whatsappCountryCode || "+91",
      whatsappNumber: initialData?.whatsappNumber || "",
      whatsappAvailable: initialData?.whatsappAvailable || false,
      address: initialData?.address || "",
      side: initialData?.side || "bride", // Default to bride's side
      isFamily: initialData?.isFamily || false,
      relationship: initialData?.relationship || "",
      rsvpStatus: initialData?.rsvpStatus || "pending",
      plusOneAllowed: initialData?.plusOneAllowed || false,
      plusOneName: initialData?.plusOneName || "",
      plusOneEmail: initialData?.plusOneEmail || "",
      plusOnePhone: initialData?.plusOnePhone || "",
      plusOneCountryCode: initialData?.plusOneCountryCode || "+91",
      plusOneGender: initialData?.plusOneGender || "",
      plusOneSalutation: initialData?.plusOneSalutation || "",
      plusOneRelationship: initialData?.plusOneRelationship || "",
      plusOneRsvpContact: initialData?.plusOneRsvpContact || false,
      childrenDetails: initialData?.childrenDetails || [],
      childrenNotes: initialData?.childrenNotes || "",
      dietaryRestrictions: initialData?.dietaryRestrictions || "",
      allergies: initialData?.allergies || "",
      needsAccommodation: initialData?.needsAccommodation || false,
      tableAssignment: initialData?.tableAssignment || "",
      giftTracking: initialData?.giftTracking || "",
      notes: initialData?.notes || ""
    }
  });

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

  return (
    <Form {...form}>
      <DialogDescription className="text-center mb-6">
        Add guest details for the wedding event
      </DialogDescription>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-xl font-playfair">Basic Information</h3>
              <p className="text-sm text-muted-foreground mt-1">Enter the guest's personal details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
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
                name="salutation"
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
                name="phone"
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
                            name={`childrenDetails.${index}.name`}
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
                            name={`childrenDetails.${index}.age`}
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
                            name={`childrenDetails.${index}.gender`}
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
                            name={`childrenDetails.${index}.salutation`}
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