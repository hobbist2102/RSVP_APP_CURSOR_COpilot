import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

import { Suspense, lazy } from "react";
import { Spinner } from "@/components/ui/spinner";

// Smart bundle splitting - group by functionality for optimal loading
const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPage = lazy(() => import("@/pages/auth-page"));

// Core dashboard - high priority preload
const Dashboard = lazy(() => import(/* @vite-preload */ /* webpackChunkName: "core" */ "@/pages/dashboard"));
const GuestList = lazy(() => import(/* @vite-preload */ /* webpackChunkName: "core" */ "@/pages/guest-list"));
const Events = lazy(() => import(/* @vite-preload */ /* webpackChunkName: "core" */ "@/pages/events"));

// RSVP module - separate chunk
const RsvpManagement = lazy(() => import(/* webpackChunkName: "rsvp" */ "@/pages/rsvp-management"));
const RsvpPage = lazy(() => import(/* webpackChunkName: "rsvp" */ "@/pages/rsvp-page"));
const RsvpDemo = lazy(() => import(/* webpackChunkName: "rsvp" */ "@/pages/rsvp-demo"));

// Travel and accommodation - separate chunk  
const Travel = lazy(() => import(/* webpackChunkName: "travel" */ "@/pages/travel"));
const TravelManagement = lazy(() => import(/* webpackChunkName: "travel" */ "@/pages/travel-management"));
const Accommodations = lazy(() => import(/* webpackChunkName: "travel" */ "@/pages/accommodations-simple"));
const Hotels = lazy(() => import(/* webpackChunkName: "travel" */ "@/pages/hotels"));
const TransportPage = lazy(() => import(/* webpackChunkName: "travel" */ "@/pages/transport"));
const TransportAssignmentsPage = lazy(() => import(/* webpackChunkName: "travel" */ "@/pages/transport-assignments"));

// Admin and settings - separate chunk
const Meals = lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/meals"));
const Reports = lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/reports"));
const Settings = lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/settings"));
const EventSettings = lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/event-settings"));
const EventSetupWizard = lazy(() => import(/* webpackChunkName: "admin" */ "@/pages/event-setup-wizard"));

// Landing and marketing - temporarily direct imports to fix loading issues
import ImmersiveLanding from "@/pages/immersive-landing";
import MessageSection from "@/pages/message-section";
const OAuthCallbackSuccess = lazy(() => import(/* webpackChunkName: "auth" */ "@/components/auth/oauth-callback-success"));



// Optimized loading component with minimal render cost
const LoadingSpinner = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
