export function FullPageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
