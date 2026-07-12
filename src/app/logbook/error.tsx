"use client";

import { Button } from "@/components/ui/button";

export default function LogbookError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The logbook couldn’t be loaded. This is usually temporary — try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
