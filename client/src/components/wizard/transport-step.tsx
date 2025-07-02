import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WeddingEvent } from "@shared/schema";
import { Check, Bus, Car, Plane, Train, MapPin, Users, AlertCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TransportStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: any) => void;
  isCompleted: boolean;
}

export default function TransportStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: TransportStepProps) {
  const [formData, setFormData] = useState({
    transportMode: currentEvent?.transportMode || 'none',
    transportationProvided: currentEvent?.transportationProvided || false,
    transportProviderName: currentEvent?.transportProviderName || '',
    transportProviderContact: currentEvent?.transportProviderContact || '',
    transportProviderWebsite: currentEvent?.transportProviderWebsite || '',
    transportSpecialDeals: currentEvent?.transportSpecialDeals || '',
    transportInstructions: currentEvent?.transportInstructions || '',
    defaultArrivalLocation: currentEvent?.defaultArrivalLocation || '',
    defaultDepartureLocation: currentEvent?.defaultDepartureLocation || '',
    offerTravelAssistance: currentEvent?.offerTravelAssistance || false,
    flightMode: currentEvent?.flightMode || 'none',
    flightSpecialDeals: currentEvent?.flightSpecialDeals || '',
    flightInstructions: currentEvent?.flightInstructions || '',
    recommendedAirlines: currentEvent?.recommendedAirlines || '',
    airlineDiscountCodes: currentEvent?.airlineDiscountCodes || ''
  });

  const handleComplete = () => {
    onComplete(formData);
  };

  const transportModes = [
    { value: 'none', label: 'No transport coordination', icon: <AlertCircle className="h-4 w-4" /> },
    { value: 'provided', label: 'Transportation provided by us', icon: <Bus className="h-4 w-4" /> },
    { value: 'coordinated', label: 'Coordinated with partners', icon: <Car className="h-4 w-4" /> },
    { value: 'guidance', label: 'Travel guidance only', icon: <MapPin className="h-4 w-4" /> }
  ];

  const flightModes = [
    { value: 'none', label: 'No flight assistance', icon: <AlertCircle className="h-4 w-4" /> },
    { value: 'guidance', label: 'Flight booking guidance', icon: <Plane className="h-4 w-4" /> },
    { value: 'group_booking', label: 'Group booking coordination', icon: <Users className="h-4 w-4" /> },
    { value: 'full_service', label: 'Full travel assistance', icon: <Plane className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-amber-900">Transport & Travel Setup</h2>
        <p className="text-amber-700">
          Configure transport and flight coordination preferences for your event
        </p>
      </div>

      {/* Transport Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-900">
            <Bus className="h-5 w-5" />
            <span>Local Transport Coordination</span>
          </CardTitle>
          <CardDescription>
            Set up how you'll handle guest transportation during the event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="transportMode">Transport Mode</Label>
            <Select
              value={formData.transportMode}
              onValueChange={(value) => setFormData({ ...formData, transportMode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transportModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    <div className="flex items-center space-x-2">
                      {mode.icon}
                      <span>{mode.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.transportMode !== 'none' && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transportationProvided"
                  checked={formData.transportationProvided}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, transportationProvided: !!checked })
                  }
                />
                <Label htmlFor="transportationProvided">
                  We provide transportation for guests
                </Label>
              </div>

              {(formData.transportMode === 'coordinated' || formData.transportMode === 'provided') && (
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="transportProviderName">Transport Provider/Company Name</Label>
                    <Input
                      id="transportProviderName"
                      value={formData.transportProviderName}
                      onChange={(e) => setFormData({ ...formData, transportProviderName: e.target.value })}
                      placeholder="e.g., Royal Travels, City Cabs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transportProviderContact">Provider Contact</Label>
                    <Input
                      id="transportProviderContact"
                      value={formData.transportProviderContact}
                      onChange={(e) => setFormData({ ...formData, transportProviderContact: e.target.value })}
                      placeholder="Phone number or email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transportProviderWebsite">Provider Website (Optional)</Label>
                    <Input
                      id="transportProviderWebsite"
                      value={formData.transportProviderWebsite}
                      onChange={(e) => setFormData({ ...formData, transportProviderWebsite: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="defaultArrivalLocation">Default Arrival Location</Label>
                  <Input
                    id="defaultArrivalLocation"
                    value={formData.defaultArrivalLocation}
                    onChange={(e) => setFormData({ ...formData, defaultArrivalLocation: e.target.value })}
                    placeholder="e.g., Mumbai Airport, Railway Station"
                  />
                </div>
                <div>
                  <Label htmlFor="defaultDepartureLocation">Default Departure Location</Label>
                  <Input
                    id="defaultDepartureLocation"
                    value={formData.defaultDepartureLocation}
                    onChange={(e) => setFormData({ ...formData, defaultDepartureLocation: e.target.value })}
                    placeholder="e.g., Mumbai Airport, Railway Station"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="transportSpecialDeals">Special Rates/Deals (Optional)</Label>
                <Textarea
                  id="transportSpecialDeals"
                  value={formData.transportSpecialDeals}
                  onChange={(e) => setFormData({ ...formData, transportSpecialDeals: e.target.value })}
                  placeholder="Mention any special group rates or discounts available"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="transportInstructions">Transport Instructions for Guests</Label>
                <Textarea
                  id="transportInstructions"
                  value={formData.transportInstructions}
                  onChange={(e) => setFormData({ ...formData, transportInstructions: e.target.value })}
                  placeholder="Provide instructions for guests about transportation arrangements"
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Flight Coordination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-900">
            <Plane className="h-5 w-5" />
            <span>Flight Coordination</span>
          </CardTitle>
          <CardDescription>
            Configure flight booking assistance and group coordination
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="flightMode">Flight Assistance Mode</Label>
            <Select
              value={formData.flightMode}
              onValueChange={(value) => setFormData({ ...formData, flightMode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flightModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    <div className="flex items-center space-x-2">
                      {mode.icon}
                      <span>{mode.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.flightMode !== 'none' && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="offerTravelAssistance"
                  checked={formData.offerTravelAssistance}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, offerTravelAssistance: !!checked })
                  }
                />
                <Label htmlFor="offerTravelAssistance">
                  Offer travel booking assistance to guests
                </Label>
              </div>

              <div>
                <Label htmlFor="recommendedAirlines">Recommended Airlines (Optional)</Label>
                <Input
                  id="recommendedAirlines"
                  value={formData.recommendedAirlines}
                  onChange={(e) => setFormData({ ...formData, recommendedAirlines: e.target.value })}
                  placeholder="e.g., Air India, IndiGo, Vistara"
                />
              </div>

              <div>
                <Label htmlFor="airlineDiscountCodes">Airline Discount Codes (Optional)</Label>
                <Input
                  id="airlineDiscountCodes"
                  value={formData.airlineDiscountCodes}
                  onChange={(e) => setFormData({ ...formData, airlineDiscountCodes: e.target.value })}
                  placeholder="Any group discount codes or corporate rates"
                />
              </div>

              <div>
                <Label htmlFor="flightSpecialDeals">Flight Special Deals/Information</Label>
                <Textarea
                  id="flightSpecialDeals"
                  value={formData.flightSpecialDeals}
                  onChange={(e) => setFormData({ ...formData, flightSpecialDeals: e.target.value })}
                  placeholder="Mention any special group rates, booking windows, or flight recommendations"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="flightInstructions">Flight Booking Instructions</Label>
                <Textarea
                  id="flightInstructions"
                  value={formData.flightInstructions}
                  onChange={(e) => setFormData({ ...formData, flightInstructions: e.target.value })}
                  placeholder="Provide instructions for guests about flight bookings, preferred timings, etc."
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Setup Summary */}
      {(formData.transportMode !== 'none' || formData.flightMode !== 'none') && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            After completing the event setup, you'll have access to a comprehensive transport 
            coordination system where you can manage vendors, vehicles, location representatives, 
            and coordinate real-time guest transportation.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pt-4">
        <div className="space-y-1">
          <p className="text-sm text-amber-700">
            Transport and travel configuration ready
          </p>
          <p className="text-xs text-amber-600">
            Operational coordination features will be available after event creation
          </p>
        </div>
        <Button
          onClick={handleComplete}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Check className="h-4 w-4 mr-2" />
          Complete Setup
        </Button>
      </div>
    </div>
  );
}