import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import GuestList from "@/pages/guest-list";
import RsvpManagement from "@/pages/rsvp-management";
import RsvpPage from "@/pages/rsvp-page";
import Events from "@/pages/events";
import Travel from "@/pages/travel";
import Accommodations from "@/pages/accommodations";
import Hotels from "@/pages/hotels";
import Meals from "@/pages/meals";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import EventSettings from "@/pages/event-settings";
import PrivateRoute from "@/components/auth/private-route";
import OAuthCallbackSuccess from "@/components/auth/oauth-callback-success";

function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        {/* RSVP routes - capture all possible formats */}
        <Route path="/guest-rsvp/:rest*">
          {(params) => <RsvpPage />}
        </Route>
        <Route path="/oauth/callback/:provider" component={OAuthCallbackSuccess} />
        <Route path="/">
          {() => (
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          )}
        </Route>
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
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
