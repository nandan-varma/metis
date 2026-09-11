import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <Compass className="size-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link href="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
