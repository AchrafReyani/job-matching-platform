import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'nl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value;
  const locale: Locale = locales.includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
