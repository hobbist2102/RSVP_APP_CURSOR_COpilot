import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import GuestList from "@/pages/guest-list";
import RsvpManagement from "@/pages/rsvp-management";
import Events from "@/pages/events";
import Travel from "@/pages/travel";
import Accommodations from "@/pages/accommodations";
import Meals from "@/pages/meals";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import PrivateRoute from "@/components/auth/private-route";

function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/auth" component={AuthPage} />
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
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
