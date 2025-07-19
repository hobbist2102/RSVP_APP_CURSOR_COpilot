import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ChefHat, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Clock,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Utensils,
  Wine,
  Cake,
  Coffee,
  Salad,
  Beef,
  Fish,
  Carrot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { get, post, put, del } from "@/lib/api";
import { useNotification } from "@/lib/notification-utils";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage' | 'side';
  dietaryInfo: string[];
  allergens: string[];
  price?: number;
  servingSize: string;
  ingredients: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  spiceLevel?: number;
  eventId: number;
  createdAt: string;
}

interface MealPlan {
  id: number;
  name: string;
  description: string;
  eventId: number;
  date: string;
  time: string;
  type: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'cocktail' | 'dessert';
  venue: string;
  maxGuests: number;
  isActive: boolean;
  menuItems: MenuItem[];
  dietaryRequirements: {
    vegetarian: number;
    vegan: number;
    glutenFree: number;
    dairyFree: number;
    halal: number;
    kosher: number;
    custom: { name: string; count: number }[];
  };
  createdAt: string;
}

interface GuestMealAssignment {
  guestId: number;
  guestName: string;
  mealPlanId: number;
  selectedItems: number[];
  dietaryRestrictions: string[];
  specialRequests: string;
  confirmed: boolean;
}

const CATEGORY_ICONS = {
  appetizer: Salad,
  main: Beef,
  dessert: Cake,
  beverage: Wine,
  side: Carrot
};

const MEAL_TYPE_ICONS = {
  breakfast: Coffee,
  brunch: Coffee,
  lunch: Utensils,
  dinner: ChefHat,
  cocktail: Wine,
  dessert: Cake
};

export default function Meals() {
  const [activeTab, setActiveTab] = useState("plans");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const notification = useNotification();
  const queryClient = useQueryClient();

  // Fetch events for selection
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: () => get('/api/events'),
  });

  // Fetch meal plans
  const { data: mealPlans = [], isLoading: plansLoading } = useQuery<MealPlan[]>({
    queryKey: ['/api/meal-plans', selectedEvent],
    queryFn: () => selectedEvent ? get(`/api/meal-plans?eventId=${selectedEvent}`) : Promise.resolve([]),
    enabled: !!selectedEvent
  });

  // Fetch menu items
  const { data: menuItems = [], isLoading: itemsLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu-items', selectedEvent],
    queryFn: () => selectedEvent ? get(`/api/menu-items?eventId=${selectedEvent}`) : Promise.resolve([]),
    enabled: !!selectedEvent
  });

  // Fetch guest meal assignments
  const { data: guestAssignments = [] } = useQuery<GuestMealAssignment[]>({
    queryKey: ['/api/guest-meal-assignments', selectedEvent],
    queryFn: () => selectedEvent ? get(`/api/guest-meal-assignments?eventId=${selectedEvent}`) : Promise.resolve([]),
    enabled: !!selectedEvent
  });

  // Create meal plan mutation
  const createMealPlanMutation = useMutation({
    mutationFn: (data: Partial<MealPlan>) => post('/api/meal-plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans'] });
      setIsCreatingPlan(false);
      notification.success({
        title: "Meal Plan Created",
        description: "New meal plan has been created successfully."
      });
    },
    onError: (error: any) => {
      notification.error({
        title: "Creation Failed",
        description: error.message || "Failed to create meal plan."
      });
    }
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: (data: Partial<MenuItem>) => post('/api/menu-items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      setIsCreatingItem(false);
      notification.success({
        title: "Menu Item Created",
        description: "New menu item has been added successfully."
      });
    },
    onError: (error: any) => {
      notification.error({
        title: "Creation Failed",
        description: error.message || "Failed to create menu item."
      });
    }
  });

  const filteredPlans = mealPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedEvent) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meal Planning</h1>
            <p className="text-gray-600 mt-2">
              Manage wedding meal plans, menus, and dietary requirements
            </p>
          </div>

          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <ChefHat className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Select an Event</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Choose an event to start planning meals and managing menus for your wedding.
                </p>
                <Select onValueChange={(value) => setSelectedEvent(Number(value))}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Choose an event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event: any) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meal Planning</h1>
            <p className="text-gray-600 mt-2">
              Managing meals for: {events.find((e: any) => e.id === selectedEvent)?.title}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setSelectedEvent(null)}
            >
              Change Event
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search meal plans or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">Meal Plans</TabsTrigger>
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
            <TabsTrigger value="assignments">Guest Assignments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Meal Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Meal Plans</h2>
              <Button onClick={() => setIsCreatingPlan(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Meal Plan
              </Button>
            </div>

            {plansLoading ? (
              <div className="text-center py-8">Loading meal plans...</div>
            ) : filteredPlans.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <ChefHat className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Meal Plans</h3>
                    <p className="text-gray-600 mb-6">
                      Create your first meal plan to start organizing wedding meals.
                    </p>
                    <Button onClick={() => setIsCreatingPlan(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Meal Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((plan) => {
                  const TypeIcon = MEAL_TYPE_ICONS[plan.type];
                  return (
                    <Card key={plan.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <TypeIcon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                          </div>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600 text-sm">{plan.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(plan.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{plan.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{plan.maxGuests} guests</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Utensils className="h-4 w-4 text-gray-400" />
                            <span>{plan.menuItems?.length || 0} items</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-500">DIETARY REQUIREMENTS</Label>
                          <div className="flex flex-wrap gap-1">
                            {plan.dietaryRequirements.vegetarian > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Vegetarian: {plan.dietaryRequirements.vegetarian}
                              </Badge>
                            )}
                            {plan.dietaryRequirements.vegan > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Vegan: {plan.dietaryRequirements.vegan}
                              </Badge>
                            )}
                            {plan.dietaryRequirements.glutenFree > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Gluten-Free: {plan.dietaryRequirements.glutenFree}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPlan(plan)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Menu Items Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Menu Items</h2>
              <Button onClick={() => setIsCreatingItem(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>

            {itemsLoading ? (
              <div className="text-center py-8">Loading menu items...</div>
            ) : filteredItems.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Utensils className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Menu Items</h3>
                    <p className="text-gray-600 mb-6">
                      Add menu items to create comprehensive meal plans.
                    </p>
                    <Button onClick={() => setIsCreatingItem(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Menu Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const CategoryIcon = CATEGORY_ICONS[item.category];
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CategoryIcon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                          </div>
                          <Badge variant="outline">
                            {item.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600 text-sm">{item.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {item.isVegetarian && (
                              <Badge variant="secondary" className="text-xs">Vegetarian</Badge>
                            )}
                            {item.isVegan && (
                              <Badge variant="secondary" className="text-xs">Vegan</Badge>
                            )}
                            {item.isGlutenFree && (
                              <Badge variant="secondary" className="text-xs">Gluten-Free</Badge>
                            )}
                            {item.isDairyFree && (
                              <Badge variant="secondary" className="text-xs">Dairy-Free</Badge>
                            )}
                          </div>
                        </div>

                        {item.price && (
                          <div className="text-lg font-semibold text-primary">
                            ${item.price.toFixed(2)}
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingItem(item)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Guest Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Guest Meal Assignments</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign Guests
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Guest meal assignment functionality will be implemented in the next update.
                This will include meal preferences, dietary restrictions, and automatic assignments.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Meal Planning Analytics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Meal Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mealPlans.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Menu Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{menuItems.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mealPlans.filter(plan => plan.isActive).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Guest Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guestAssignments.length}</div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Detailed analytics including cost analysis, dietary distribution, and guest preferences will be available in the next update.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Create Meal Plan Dialog */}
        <Dialog open={isCreatingPlan} onOpenChange={setIsCreatingPlan}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Meal Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Meal plan creation functionality will be implemented in the next update with full form validation and menu item selection.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Menu Item Dialog */}
        <Dialog open={isCreatingItem} onOpenChange={setIsCreatingItem}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Menu item creation functionality will be implemented in the next update with ingredient management and nutritional information.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}