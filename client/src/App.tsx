import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Signup from "@/pages/signup";
import PersonalityQuiz from "@/pages/personality-quiz";
import Discover from "@/pages/discover";
import VibeBoard from "@/pages/vibeboard";
import Messages from "@/pages/messages";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/signup" component={Signup} />
          <Route path="/personality-quiz" component={PersonalityQuiz} />
          <Route path="/discover" component={Discover} />
          <Route path="/vibeboard" component={VibeBoard} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Discover} />
          <Route path="/vibeboard" component={VibeBoard} />
          <Route path="/messages" component={Messages} />
          <Route path="/chat/:matchId" component={Chat} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
