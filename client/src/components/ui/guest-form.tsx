import React from "react";
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

interface GuestFormProps {
  eventId: number;
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const formSchema = insertGuestSchema.extend({
  numberOfChildren: z.union([
    z.number().min(0),
    z.string().transform((val) => parseInt(val) || 0)
  ]),
  childrenDetails: z.array(
    z.object({
      name: z.string().optional(),
      age: z.number().optional()
    })
  ).default([]),
  childrenNotes: z.string().optional().nullable(),
  plusOneEmail: z.string().email().optional().nullable(),
  plusOnePhone: z.string().optional().nullable(),
  plusOneRelationship: z.string().optional().nullable(),
  plusOneRsvpContact: z.boolean().default(false)
});

export default function GuestForm({ eventId, initialData, onSubmit, isLoading = false }: GuestFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId,
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      side: initialData?.side || "bride", // Default to bride's side
      isFamily: initialData?.isFamily || false,
      relationship: initialData?.relationship || "",
      rsvpStatus: initialData?.rsvpStatus || "pending",
      plusOneAllowed: initialData?.plusOneAllowed || false,
      plusOneName: initialData?.plusOneName || "",
      plusOneEmail: initialData?.plusOneEmail || "",
      plusOnePhone: initialData?.plusOnePhone || "",
      plusOneRelationship: initialData?.plusOneRelationship || "",
      plusOneRsvpContact: initialData?.plusOneRsvpContact || false,
      numberOfChildren: initialData?.numberOfChildren || 0,
      childrenDetails: initialData?.childrenDetails || [],
      childrenNotes: initialData?.childrenNotes || "",
      dietaryRestrictions: initialData?.dietaryRestrictions || "",
      tableAssignment: initialData?.tableAssignment || "",
      giftTracking: initialData?.giftTracking || "",
      notes: initialData?.notes || ""
    }
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} value={field.value || ""} />
                    </FormControl>
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
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
              name="side"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Side</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select side" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bride">Bride's Side</SelectItem>
                      <SelectItem value="groom">Groom's Side</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This helps with seating arrangements and targeted communications
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
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium">RSVP Information</h3>
            
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
              name="plusOneAllowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
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
              <div className="space-y-4 border border-gray-200 p-4 rounded-md bg-gray-50">
                <h4 className="text-sm font-medium text-gray-800">Plus One Details</h4>
                
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
                
                <FormField
                  control={form.control}
                  name="plusOnePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plus One Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} value={field.value || ""} />
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
                        <FormLabel>Allow Direct RSVP Contact</FormLabel>
                        <FormDescription>
                          If checked, we'll contact plus-one directly for RSVP updates
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="numberOfChildren"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Children</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("numberOfChildren") > 0 && (
              <div className="space-y-4 border border-gray-200 p-4 rounded-md bg-gray-50">
                <h4 className="text-sm font-medium text-gray-800">Children Details</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  {Array.from({ length: form.watch("numberOfChildren") }).map((_, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 p-3 border border-dashed border-gray-300 rounded-md">
                      <FormField
                        control={form.control}
                        name={`childrenDetails.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Child {index + 1} Name</FormLabel>
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
                                min="0"
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
                  ))}
                </div>
                
                <FormField
                  control={form.control}
                  name="childrenNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Notes for Children</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any dietary restrictions, allergies, or special needs"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Vegetarian, gluten-free, allergies, etc."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
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
                    <Input placeholder="Table 1" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Additional Information</h3>
          
          <FormField
            control={form.control}
            name="giftTracking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gift Tracking</FormLabel>
                <FormControl>
                  <Input placeholder="Received gift details" {...field} value={field.value || ""} />
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
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional notes about this guest" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {initialData ? "Update Guest" : "Add Guest"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
