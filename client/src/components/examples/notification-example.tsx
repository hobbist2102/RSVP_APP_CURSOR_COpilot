/**
 * Example component showcasing the standardized notification system
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotification, NotificationMessages } from "@/lib/notification-utils";
import { 
  AlertCircle, 
  CheckCircle2, 
  InfoIcon, 
  AlertTriangle, 
  Trash, 
  Save, 
  Plus, 
  RefreshCw 
} from "lucide-react";

export default function NotificationExample() {
  const notification = useNotification();
  
  // Examples of different notification types
  const showSuccessNotification = () => {
    notification.success({
      title: "Operation Successful",
      description: "Your changes have been saved successfully.",
    });
  };
  
  const showErrorNotification = () => {
    notification.error({
      title: "Error Occurred",
      description: "There was a problem processing your request. Please try again.",
    });
  };
  
  const showWarningNotification = () => {
    notification.warning({
      title: "Please Note",
      description: "This action may have unexpected consequences.",
    });
  };
  
  const showInfoNotification = () => {
    notification.info({
      title: "Did You Know?",
      description: "You can customize email templates for different RSVP statuses.",
    });
  };
  
  // Examples of operation-specific notifications
  const showSaveNotification = () => {
    notification.dataSaved(true, NotificationMessages.SAVED_SUCCESS);
  };
  
  const showDeleteNotification = () => {
    notification.deleteOperation(true, "The guest has been removed from the event.");
  };
  
  const showCreateNotification = () => {
    notification.createOperation(true, "New ceremony added to the event schedule.");
  };
  
  const showUpdateNotification = () => {
    notification.updateOperation(true, "Guest information has been updated successfully.");
  };
  
  const showFormSubmissionNotification = () => {
    notification.formSubmission(true, "Your RSVP has been submitted successfully.");
  };
  
  // Example of a custom notification
  const showCustomNotification = () => {
    notification.notify({
      title: "Custom Notification",
      description: "This is a customized notification with special styling.",
      className: "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300",
      duration: 5000,
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Notification System</CardTitle>
        <CardDescription>
          Examples of the standardized notification system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Basic notification types */}
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4 justify-start"
            onClick={showSuccessNotification}
          >
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div className="text-left">
              <p className="font-medium">Success</p>
              <p className="text-xs text-muted-foreground">Show success notification</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4 justify-start"
            onClick={showErrorNotification}
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="text-left">
              <p className="font-medium">Error</p>
              <p className="text-xs text-muted-foreground">Show error notification</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4 justify-start"
            onClick={showWarningNotification}
          >
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <p className="font-medium">Warning</p>
              <p className="text-xs text-muted-foreground">Show warning notification</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4 justify-start"
            onClick={showInfoNotification}
          >
            <InfoIcon className="h-5 w-5 text-blue-500" />
            <div className="text-left">
              <p className="font-medium">Info</p>
              <p className="text-xs text-muted-foreground">Show info notification</p>
            </div>
          </Button>
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">Operation-specific Notifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Button 
              variant="secondary" 
              size="sm"
              className="flex gap-2 items-center"
              onClick={showSaveNotification}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              className="flex gap-2 items-center"
              onClick={showDeleteNotification}
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              className="flex gap-2 items-center"
              onClick={showCreateNotification}
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              className="flex gap-2 items-center"
              onClick={showUpdateNotification}
            >
              <RefreshCw className="h-4 w-4" />
              Update
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={showFormSubmissionNotification}
            >
              Form Submission
            </Button>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            variant="default" 
            className="w-full"
            onClick={showCustomNotification}
          >
            Show Custom Notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}