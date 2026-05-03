import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Structure from "@/pages/structure";
import Lyrics from "@/pages/lyrics";
import Album from "@/pages/album";
import Chords from "@/pages/chords";
import Inspiration from "@/pages/inspiration";
import Journal from "@/pages/journal";
import Notebook from "@/pages/notebook";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Structure} />
        <Route path="/structure" component={Structure} />
        <Route path="/lyrics" component={Lyrics} />
        <Route path="/album" component={Album} />
        <Route path="/chords" component={Chords} />
        <Route path="/inspiration" component={Inspiration} />
        <Route path="/journal" component={Journal} />
        <Route path="/notebook" component={Notebook} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
