import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-bone-50">
      <p className="text-pine-700 font-semibold tracking-wide" aria-hidden="true">
        404
      </p>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold text-ink-900">
        الصفحة غير موجودة
      </h1>
      <p className="mt-3 text-lg text-ink-700">
        Page not found
      </p>
      <p className="mt-6 max-w-md text-ink-500">
        الرابط الذي فتحته غير صحيح أو تم نقل الصفحة.
      </p>
      <p className="mt-1 max-w-md text-ink-500">
        The link you opened is incorrect or the page has moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-pine-900 px-8 py-3 font-semibold text-bone-50 transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pine-900"
      >
        العودة للرئيسية
        <span className="sr-only"> — Back to home</span>
      </Link>
    </main>
  );
}
