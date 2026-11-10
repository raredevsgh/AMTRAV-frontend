import { SiteShell } from "@/components/marketing/site-shell";
import { NotFoundView } from "@/components/marketing/status-pages";
import { I18nProvider } from "@/lib/i18n/client";
import { defaultLocale, localeTags } from "@/lib/i18n/config";

/**
 * Any other address (outside a language, or in one the site doesn't have): the 404 in
 * English, in the site's header and footer.
 */
export default function NotFound() {
  return (
    <div lang={localeTags[defaultLocale]}>
      <I18nProvider locale={defaultLocale}>
        <SiteShell>
          <NotFoundView />
        </SiteShell>
      </I18nProvider>
    </div>
  );
}
