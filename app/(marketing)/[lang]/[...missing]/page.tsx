import { notFound } from "next/navigation";

/** This segment only ever throws, so there's nothing for instant-navigation checks to validate. */
export const instant = false;

/** Any address under a language that isn't a page gets that language's 404, in the site's frame. */
export default function MissingPage(): never {
  notFound();
}
