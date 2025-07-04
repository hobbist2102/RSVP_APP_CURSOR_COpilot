import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import PrivateRoute from "@/components/auth/private-route";
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
const Accommodations = lazy(() => import("@/pages/accommodations"));
const Hotels = lazy(() => import("@/pages/hotels"));
const Meals = lazy(() => import("@/pages/meals"));
const Reports = lazy(() => import("@/pages/reports"));
const Settings = lazy(() => import("@/pages/settings"));
const EventSettings = lazy(() => import("@/pages/event-settings"));
const EmailTemplatesPage = lazy(() => import("@/pages/email-templates-page"));
const TransportPage = lazy(() => import("@/pages/transport"));
const TransportAssignmentsPage = lazy(() => import("@/pages/transport-assignments"));
const EventSetupWizard = lazy(() => import("@/pages/event-setup-wizard"));
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
          <Route path="/" component={ImmersiveLanding} />
          <Route path="/engagement" component={MessageSection} />
          <Route path="/dashboard">
            {() => (
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            )}
          </Route>
        <Route path="/guests">
          {() => (
            <PrivateRoute>
              <GuestList />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/rsvp">
          {() => (
            <PrivateRoute>
              <RsvpManagement />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/events">
          {() => (
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/travel">
          {() => (
            <PrivateRoute>
              <Travel />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/accommodations">
          {() => (
            <PrivateRoute>
              <Accommodations />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/hotels">
          {() => (
            <PrivateRoute>
              <Hotels />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/meals">
          {() => (
            <PrivateRoute>
              <Meals />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/reports">
          {() => (
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/settings">
          {() => (
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/event-settings">
          {() => (
            <PrivateRoute>
              <EventSettings />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/email-templates">
          {() => (
            <PrivateRoute>
              <EmailTemplatesPage />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/transport">
          {() => (
            <PrivateRoute>
              <TransportPage />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/transport-assignments">
          {() => (
            <PrivateRoute>
              <TransportAssignmentsPage />
            </PrivateRoute>
          )}
        </Route>
        <Route path="/event-setup-wizard/:eventId?">
          {({ eventId }) => (
            <PrivateRoute>
              <EventSetupWizard />
            </PrivateRoute>
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
