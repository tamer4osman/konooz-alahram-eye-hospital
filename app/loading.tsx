export default function Loading() {
  return (
    <div role="status" className="min-h-screen flex items-center justify-center bg-bone-50">
      <span className="sr-only">جارٍ التحميل… Loading…</span>
      <span
        aria-hidden="true"
        className="h-12 w-12 rounded-full border-4 border-pine-200 border-t-pine-900 animate-spin"
      />
    </div>
  );
}
