import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";

export default function NotFound() {
  return (
    <PageTransition className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl border border-white/10 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground">
            That studio route doesn&apos;t exist. Jump back to your workspace to
            keep writing.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Back to Structure Builder
          </Link>
        </Button>
      </div>
    </PageTransition>
  );
}
