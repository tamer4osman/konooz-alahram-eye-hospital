import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['ar', 'en'];
const DEFAULT_LOCALE = 'ar';
const LOCALE_COOKIE = 'konooz_lang';
const STAFF_SESSION_COOKIE = 'konooz_staff_session';

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie === 'ar' || cookie === 'en') return cookie;

  const accept = (request.headers.get('accept-language') ?? '').toLowerCase();
  const prefersEnglish = accept.includes('en') && !accept.includes('ar');
  return prefersEnglish ? 'en' : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const firstSegment = pathname.split('/')[1];
  if (LOCALES.includes(firstSegment)) {
    // D11: Staff sessions are redirected from ALL marketing routes to /ops.
    // A staff cookie can never coexist with marketing content in a tab.
    const isMarketingPath = !pathname.startsWith('/ar/ops') && !pathname.startsWith('/en/ops') &&
                             !pathname.startsWith('/ar/portal') && !pathname.startsWith('/en/portal') &&
                             !pathname.startsWith('/api') && !pathname.startsWith('/_next');
    const hasStaffSession = request.cookies.get(STAFF_SESSION_COOKIE)?.value;

    if (isMarketingPath && hasStaffSession) {
      const url = request.nextUrl.clone();
      url.pathname = `/${firstSegment}/ops`;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const queryLang = searchParams.get('lang');
  const target =
    queryLang === 'ar' || queryLang === 'en' ? queryLang : detectLocale(request);

  const url = request.nextUrl.clone();
  url.pathname = `/${target}${pathname === '/' ? '' : pathname}`;
  if (queryLang) url.searchParams.delete('lang');
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!api|_next|images|assets|favicon|robots\\.txt|sitemap\\.xml|llms\\.txt|[^?#]*\\.[^?#]+).*)',
  ],
};
