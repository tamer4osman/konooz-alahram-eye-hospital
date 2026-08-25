'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-bone-50">
      <h1 className="text-3xl md:text-4xl font-bold text-ink-900">
        حدث خطأ غير متوقع
      </h1>
      <p className="mt-3 text-lg text-ink-700">
        Something went wrong
      </p>
      <p className="mt-6 max-w-md text-ink-500">
        نعتذر عن هذا الخلل. يمكنك المحاولة مرة أخرى، وإذا استمرت المشكلة تواصل معنا هاتفيًا.
      </p>
      <p className="mt-1 max-w-md text-ink-500">
        We apologize for the fault. Please try again, or contact us by phone if it persists.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-pine-900 px-8 py-3 font-semibold text-bone-50 transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pine-900"
      >
        إعادة المحاولة
        <span className="sr-only"> — Try again</span>
      </button>
    </main>
  );
}
