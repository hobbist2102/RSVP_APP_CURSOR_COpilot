import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

import { Suspense, lazy } from "react";
import { Spinner } from "@/components/ui/spinner";

// Lazy load components to reduce initial bundle size
const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const GuestList = lazy(() => import("@/pages/guest-list"));
const RsvpManagement = lazy(() => import("@/pages/rsvp-management"));
const RsvpPage = lazy(() => import("@/pages/rsvp-page"));
const Events = lazy(() => import("@/pages/events"));
const Travel = lazy(() => import("@/pages/travel"));
const TravelManagement = lazy(() => import("@/pages/travel-management"));
const Accommodations = lazy(() => import("@/pages/accommodations"));
const Hotels = lazy(() => import("@/pages/hotels"));
const Meals = lazy(() => import("@/pages/meals"));
const Reports = lazy(() => import("@/pages/reports"));
const Settings = lazy(() => import("@/pages/settings"));
const EventSettings = lazy(() => import("@/pages/event-settings"));

const TransportPage = lazy(() => import("@/pages/transport"));
const TransportAssignmentsPage = lazy(() => import("@/pages/transport-assignments"));
const EventSetupWizard = lazy(() => import("@/pages/event-setup-wizard"));
const RsvpDemo = lazy(() => import("@/pages/rsvp-demo"));
// Removed immersive-storytelling import as it's no longer used
const ImmersiveLanding = lazy(() => import("@/pages/immersive-landing")); // New cinematic landing page
const MessageSection = lazy(() => import("@/pages/message-section")); // Multichannel engagement section
const OAuthCallbackSuccess = lazy(() => import("@/components/auth/oauth-callback-success"));



// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          {/* RSVP routes - capture all possible formats */}
          <Route path="/guest-rsvp/:rest*">
            {(params) => <RsvpPage />}
          </Route>
          <Route path="/oauth/callback/:provider" component={OAuthCallbackSuccess} />
          <Route path="/rsvp-demo" component={RsvpDemo} />
          <Route path="/">
            {() => (
              
                <ImmersiveLanding />
              
            )}
          </Route>
          <Route path="/engagement" component={MessageSection} />
          <Route path="/dashboard">
            {() => (
              
                <Dashboard />
              
            )}
          </Route>
        <Route path="/guests">
          {() => <GuestList />}
        </Route>
        <Route path="/rsvp">
          {() => (
            
              <RsvpManagement />
            
          )}
        </Route>
        <Route path="/events">
          {() => (
            
              <Events />
            
          )}
        </Route>
        <Route path="/travel">
          {() => (
            
              <Travel />
            
          )}
        </Route>
        <Route path="/travel-management">
          {() => (
            
              <TravelManagement />
            
          )}
        </Route>
        <Route path="/accommodations">
          {() => (
            
              <Accommodations />
            
          )}
        </Route>
        <Route path="/hotels">
          {() => (
            
              <Hotels />
            
          )}
        </Route>
        <Route path="/meals">
          {() => (
            
              <Meals />
            
          )}
        </Route>
        <Route path="/reports">
          {() => (
            
              <Reports />
            
          )}
        </Route>
        <Route path="/settings">
          {() => (
            
              <Settings />
            
          )}
        </Route>
        <Route path="/event-settings">
          {() => (
            
              <EventSettings />
            
          )}
        </Route>

        <Route path="/transport">
          {() => (
            
              <TransportPage />
            
          )}
        </Route>
        <Route path="/transport-assignments">
          {() => (
            
              <TransportAssignmentsPage />
            
          )}
        </Route>
        <Route path="/event-setup-wizard/:eventId?">
          {({ eventId }) => (
            
              <EventSetupWizard />
            
          )}
        </Route>
        <Route path="/wizard/:step?">
          {({ step }) => (
            
              <EventSetupWizard initialStep={step} />
            
          )}
        </Route>


        <Route component={NotFound} />
      </Switch>
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
