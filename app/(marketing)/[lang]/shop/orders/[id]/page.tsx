import { Suspense } from "react";
import { OrderStatus } from "@/components/shop/order-status";

export const metadata = { title: "Your order", robots: { index: false } };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; cancelled?: string }>;
};

/** The order and its token come from the link, so they're read inside Suspense. */
async function Order({ params, searchParams }: Props) {
  const [{ id }, { token, cancelled }] = await Promise.all([params, searchParams]);
  return <OrderStatus id={id} token={token ?? ""} cancelled={cancelled === "1"} />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<div className="trace shop" aria-busy="true" />}>
      <Order {...props} />
    </Suspense>
  );
}
