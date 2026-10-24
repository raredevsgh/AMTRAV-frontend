import Image from "next/image";
import Link from "next/link";
import Button from "./Button";

// Figma "Page header" (2093:1273): compact header for inner pages. Sits on the Background
// surface; the navy hero is reserved for the landing page.
export default function PageHeader({
  page,
  title,
  intro,
  introMobile = intro,
  media,
  mediaAlt,
  crop = false,
  action,
}: {
  page: string;
  title: React.ReactNode;
  intro: string;
  // Some pages use different intro copy on mobile.
  introMobile?: string;
  media: string;
  mediaAlt: string;
  // Features shows a zoomed crop of the photo; the other pages show it whole.
  crop?: boolean;
  // Optional call to action (Navy S on mobile, Navy M on desktop).
  action?: { label: string; href: string };
}) {
  return (
    <section className="flex flex-col gap-5 px-2 pt-5 pb-3 xl:flex-row xl:items-center xl:gap-16 xl:px-14 xl:pt-10 xl:pb-12">
      <div data-stagger className="flex w-full flex-col items-start gap-3.5 xl:max-w-[560px] xl:min-w-0 xl:flex-1 xl:gap-5">
        <nav data-enter aria-label="Breadcrumb" className="flex items-center gap-2 text-caption-m whitespace-nowrap xl:text-caption">
          <Link href="/" className="rounded-sm text-mid transition-colors duration-200 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            Home
          </Link>
          <span className="text-light-white" aria-hidden>
            /
          </span>
          <span className="text-navy" aria-current="page">
            {page}
          </span>
        </nav>
        {/* The heading and photo are this page's largest content: they settle without fading (see globals.css). */}
        <h1 data-enter="settle" className="text-h1-m font-bold text-navy xl:text-h1">
          {title}
        </h1>
        <p data-enter className="text-small text-mid xl:hidden">
          {introMobile}
        </p>
        <p data-enter className="hidden text-body text-mid xl:block">
          {intro}
        </p>
        {action && (
          <>
            <div data-enter className="xl:hidden">
              <Button href={action.href} label={action.label} size="s" />
            </div>
            <div data-enter className="hidden xl:block">
              <Button href={action.href} label={action.label} />
            </div>
          </>
        )}
      </div>
      <div
        data-enter="settle"
        className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-[20px] [--motion-delay:160ms] xl:h-80 xl:w-[560px] xl:rounded-[28px]"
      >
        {crop ? (
          <Image
            src={media}
            alt={mediaAlt}
            width={1536}
            height={1024}
            sizes="(min-width: 1280px) 940px, 100vw"
            preload
            className="absolute top-[-17.81%] left-[0.06%] h-[158.78%] w-[165.62%] max-w-none xl:top-[-15.52%] xl:left-[-1.07%] xl:h-[160.39%] xl:w-[167.29%]"
          />
        ) : (
          <Image src={media} alt={mediaAlt} fill sizes="(min-width: 1280px) 560px, 100vw" preload className="object-cover" />
        )}
      </div>
    </section>
  );
}
