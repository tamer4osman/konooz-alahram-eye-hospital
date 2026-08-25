import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['ar', 'en'];
const DEFAULT_LOCALE = 'ar';
const LOCALE_COOKIE = 'konooz_lang';

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie === 'ar' || cookie === 'en') return cookie;

  const accept = (request.headers.get('accept-language') ?? '').toLowerCase();
  const prefersEnglish = accept.includes('en') && !accept.includes('ar');
  return prefersEnglish ? 'en' : DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const firstSegment = pathname.split('/')[1];
  if (LOCALES.includes(firstSegment)) return NextResponse.next();

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
