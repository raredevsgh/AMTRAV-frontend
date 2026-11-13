import { notFound } from "next/navigation";

/** Any address under a language that isn't a page gets that language's 404, in the site's frame. */
export default function MissingPage(): never {
  notFound();
}
