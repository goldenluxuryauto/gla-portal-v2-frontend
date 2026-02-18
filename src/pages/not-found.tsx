import { useLocation } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignContract from "@/pages/sign-contract";

export default function NotFound() {
  const [location, setLocation] = useLocation();

  // Check if this is actually a sign-contract route
  if (location.startsWith("/sign-contract/")) {
    return <SignContract />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Large 404 with gold accent */}
        <h1 className="text-[8rem] sm:text-[10rem] font-bold leading-none tracking-tighter text-[#D4A843]/20 select-none">
          404
        </h1>

        <div className="w-16 h-1 bg-[#D4A843] mx-auto mb-6 rounded-full" />

        <h2 className="font-serif text-2xl lg:text-3xl font-light text-foreground mb-3">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            className="border-[#D4A843]/30 text-foreground hover:bg-[#D4A843]/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => setLocation("/")}
            size="lg"
            className="bg-[#D4A843] text-black hover:bg-[#D4A843]/80 font-semibold"
          >
            <Home className="mr-2 w-4 h-4" />
            Home
          </Button>
        </div>

        <p className="mt-12 text-xs text-muted-foreground/50">
          GLA Management Portal
        </p>
      </div>
    </div>
  );
}
