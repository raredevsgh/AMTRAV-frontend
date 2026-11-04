"use client";

// The shop for staff: orders to pack (with the serial numbers held for each), marking them
// shipped with tracking, and each product's price, stock and availability.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, PackageCheck, Plus, ShoppingBag, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/console/api";
import { useConsole } from "./provider";
import { AdminOnly, ErrorState, LoadingState, PageHeading, Tabs, timeLabel } from "./shared";

type OrderStatus = "pending" | "paid" | "shipped" | "expired" | "failed" | "review";

type ShopOrder = {
  id: string;
  reference: string;
  status: OrderStatus;
  email: string;
  items: { name: string; unit_minor: number; quantity: number }[];
  total_minor: number;
  currency: string;
  shipping: { name?: string; address?: Record<string, string | null>; phone?: string | null } | null;
  tracking: string | null;
  created_at: string;
  review_reason: string | null;
  serials: string[];
};

type ShopProduct = {
  sku: string;
  name: string;
  image: string | null;
  price_minor: number;
  currency: string;
  available: number;
  active: boolean;
  device_model: string;
};

/** Sends a product photo to object storage through the API. */
const uploadImage = (sku: string, file: File) =>
  api(`admin/shop/products/${sku}/image`, { method: "POST", body: file, headers: { "Content-Type": file.type || "image/png" } });

const money = (minor: number, currency: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);

const statusLabels: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  paid: "To ship",
  review: "Needs review",
  shipped: "Shipped",
  expired: "Expired",
  failed: "Failed",
};

const reviewReasons: Record<string, string> = {
  amount: "The amount paid didn’t match the order",
  stock: "Paid after its checkout closed, and no bag was left to hold",
};

function address(order: ShopOrder) {
  const value = order.shipping?.address;
  if (!value) return "—";
  return [value.line1, value.line2, value.city, value.state, value.postal_code, value.country].filter(Boolean).join(", ");
}

export function ShopPage() {
  const { user, preview } = useConsole();
  const [status, setStatus] = useState<OrderStatus | "all">("paid");
  const [shipping, setShipping] = useState<ShopOrder | null>(null);
  const orders = useQuery({
    queryKey: ["shop-orders", status, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve<ShopOrder[]>([])
        : api<ShopOrder[]>(`admin/shop/orders${status === "all" ? "" : `?status=${status}`}`, { signal }),
    enabled: user.role === "admin",
  });
  if (user.role !== "admin") return <AdminOnly what="Shop orders" />;
  const rows = orders.data ?? [];

  return (
    <>
      <PageHeading
        title="Shop"
        description="Orders from the web shop. Paid orders hold specific bags: pack those serials, then mark the order shipped to email the buyer their tracking."
      />
      <section className="console-card inventory-card">
        <div className="card-heading">
          <h2>Orders</h2>
          <Tabs
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "paid", label: "To ship" },
              { value: "review", label: "Needs review" },
              { value: "pending", label: "Awaiting payment" },
              { value: "shipped", label: "Shipped" },
              { value: "all", label: "All" },
            ]}
          />
        </div>
        {orders.isPending ? (
          <LoadingState />
        ) : orders.isError ? (
          <ErrorState message={orders.error.message} retry={() => orders.refetch()} />
        ) : !rows.length ? (
          <div className="console-empty">
            <ShoppingBag size={30} />
            <p>No orders here.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>Ordered</th>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Ship to</th>
                  <th>Bags to pack</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id}>
                    <td>{timeLabel(order.created_at)}</td>
                    <td className="mono">{order.reference}</td>
                    <td>
                      <a className="serial-link" href={`mailto:${order.email}`}>
                        {order.email}
                      </a>
                    </td>
                    <td>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</td>
                    <td>{money(order.total_minor, order.currency)}</td>
                    <td className="message-cell" title={address(order)}>
                      {order.shipping?.name ? `${order.shipping.name}, ` : ""}
                      {address(order)}
                    </td>
                    <td className="mono">{order.serials.length ? order.serials.join(", ") : "—"}</td>
                    <td>
                      <span
                        className={`trace-badge ${order.status === "paid" || order.status === "shipped" ? "lime" : order.status === "review" ? "warn" : "info"}`}
                        title={order.review_reason ? reviewReasons[order.review_reason] : undefined}
                      >
                        {statusLabels[order.status]}
                      </span>
                      {order.tracking ? <div className="field-hint">{order.tracking}</div> : null}
                    </td>
                    <td>
                      {order.status === "paid" || order.status === "review" ? (
                        <button className="console-secondary" onClick={() => setShipping(order)}>
                          <Truck size={16} /> Mark shipped
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <ProductsCard />
      <ShipDialog order={shipping} onClose={() => setShipping(null)} />
    </>
  );
}

function ShipDialog({ order, onClose }: { order: ShopOrder | null; onClose: () => void }) {
  const client = useQueryClient();
  const [tracking, setTracking] = useState("");
  const ship = useMutation({
    mutationFn: () =>
      api(`admin/shop/orders/${order!.id}/ship`, {
        method: "POST",
        body: JSON.stringify({ tracking: tracking.trim() || null }),
      }),
    onSuccess: () => {
      setTracking("");
      client.invalidateQueries({ queryKey: ["shop-orders"] });
      onClose();
    },
  });
  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark {order?.reference} shipped</DialogTitle>
          <DialogDescription>
            The buyer gets an email with the tracking below. Pack {order?.serials.join(", ") || "the bags held for it"}.
          </DialogDescription>
        </DialogHeader>
        <form
          className="mfa-settings"
          onSubmit={(event) => {
            event.preventDefault();
            ship.mutate();
          }}
        >
          <div className="field">
            <Label htmlFor="ship-tracking">Tracking number or link (optional)</Label>
            <Input
              id="ship-tracking"
              maxLength={200}
              value={tracking}
              onChange={(event) => setTracking(event.target.value)}
              placeholder="DHL 1234567890"
            />
          </div>
          {ship.isError ? (
            <p className="field-error" role="alert">
              {ship.error.message}
            </p>
          ) : null}
          <button className="console-button" disabled={ship.isPending}>
            <PackageCheck size={16} /> {ship.isPending ? "Saving…" : "Mark shipped and email the buyer"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProductsCard() {
  const { preview } = useConsole();
  const client = useQueryClient();
  const [adding, setAdding] = useState(false);
  const photo = useMutation({
    mutationFn: ({ sku, file }: { sku: string; file: File }) => uploadImage(sku, file),
    onSuccess: () => client.invalidateQueries({ queryKey: ["shop-products"] }),
  });
  const products = useQuery({
    queryKey: ["shop-products", preview],
    queryFn: ({ signal }) => (preview ? Promise.resolve<ShopProduct[]>([]) : api<ShopProduct[]>("admin/shop/products", { signal })),
  });
  const update = useMutation({
    mutationFn: ({ sku, change }: { sku: string; change: Partial<Pick<ShopProduct, "price_minor" | "active">> }) =>
      api(`admin/shop/products/${sku}`, { method: "PATCH", body: JSON.stringify(change) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["shop-products"] }),
  });
  return (
    <section className="console-card inventory-card">
      <div className="card-heading">
        <h2>Products</h2>
        <button className="console-button" onClick={() => setAdding(true)} disabled={preview}>
          <Plus size={16} /> Add product
        </button>
      </div>
      {products.isPending ? (
        <LoadingState />
      ) : products.isError ? (
        <ErrorState message={products.error.message} retry={() => products.refetch()} />
      ) : (
        <div className="table-scroll">
          <table className="console-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Photo</th>
                <th>Filled from model</th>
                <th>In stock</th>
                <th>Price</th>
                <th>On sale</th>
              </tr>
            </thead>
            <tbody>
              {(products.data ?? []).map((product) => (
                <tr key={product.sku}>
                  <td>{product.name}</td>
                  <td>
                    <div className="product-photo">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- served by our API through the shop proxy
                        <img src={product.image} alt="" width={44} height={44} />
                      ) : (
                        <span className="product-photo-empty" aria-hidden="true" />
                      )}
                      <label className="console-secondary product-photo-change">
                        {photo.isPending && photo.variables?.sku === product.sku ? "Uploading…" : "Change image"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          className="sr-only"
                          aria-label={`New photo for ${product.name}`}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) photo.mutate({ sku: product.sku, file });
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </td>
                  <td className="mono">{product.device_model}</td>
                  <td>{product.available}</td>
                  <td>
                    <form
                      className="mfa-inline"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const value = Number(new FormData(event.currentTarget).get("price"));
                        if (Number.isFinite(value) && value > 0)
                          update.mutate({ sku: product.sku, change: { price_minor: Math.round(value * 100) } });
                      }}
                    >
                      <input
                        className="console-input compact"
                        name="price"
                        type="number"
                        min="1"
                        step="0.01"
                        aria-label={`${product.name} price in ${product.currency.toUpperCase()}`}
                        defaultValue={(product.price_minor / 100).toFixed(2)}
                      />
                      <button className="console-secondary" disabled={update.isPending}>
                        Save
                      </button>
                    </form>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${product.name} on sale`}
                      checked={product.active}
                      disabled={update.isPending}
                      onChange={(event) => update.mutate({ sku: product.sku, change: { active: event.target.checked } })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {update.isError || photo.isError ? (
        <p className="field-error" role="alert">
          {(update.error ?? photo.error)?.message}
        </p>
      ) : null}
      <AddProductDialog open={adding} onClose={() => setAdding(false)} />
    </section>
  );
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

/** A new product: its photo, what it's called, which devices fill its orders, and its price. */
function AddProductDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [skuEdited, setSkuEdited] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [onSale, setOnSale] = useState(false);

  function choose(file: File | undefined) {
    if (!file || !/^image\/(png|jpeg)$/.test(file.type)) return;
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }
  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setName("");
    setSku("");
    setSkuEdited(false);
    setPhoto(null);
    setPreview(null);
    setOnSale(false);
  }
  const create = useMutation({
    mutationFn: async (form: FormData) => {
      await api("admin/shop/products", {
        method: "POST",
        body: JSON.stringify({
          sku,
          name: name.trim(),
          description: String(form.get("description") ?? "").trim(),
          device_model: String(form.get("model") ?? "").trim(),
          price_minor: Math.round(Number(form.get("price")) * 100),
          currency: String(form.get("currency") ?? "usd"),
          active: onSale,
        }),
      });
      if (photo) await uploadImage(sku, photo);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["shop-products"] });
      reset();
      onClose();
    },
  });
  const tooBig = !!photo && photo.size > 5 * 1024 * 1024;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="console-dialog product-dialog">
        <DialogHeader>
          <DialogTitle>Add a product</DialogTitle>
          <DialogDescription>
            Orders for it are filled from registered, unclaimed bags whose model matches exactly.
          </DialogDescription>
        </DialogHeader>
        <form
          className="product-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!tooBig) create.mutate(new FormData(event.currentTarget));
          }}
        >
          <label
            className={`product-drop${dragging ? " dragging" : ""}${preview ? " filled" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              choose(event.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={(event) => choose(event.target.files?.[0])}
            />
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- a local preview of the chosen file
              <img src={preview} alt="" />
            ) : (
              <>
                <ImagePlus size={28} aria-hidden="true" />
                <strong>Add a photo</strong>
                <span>Drop a PNG or JPEG here, or click to choose. A transparent PNG looks best.</span>
              </>
            )}
            {preview ? <span className="product-drop-change">Change photo</span> : null}
          </label>
          {tooBig ? <p className="field-error product-drop-error">That photo is over 5 MB.</p> : null}

          <div className="product-fields">
            <fieldset>
              <legend>Details</legend>
              <div className="field">
                <Label htmlFor="product-name">Name</Label>
                <Input
                  id="product-name"
                  required
                  maxLength={60}
                  value={name}
                  placeholder="Voyager"
                  onChange={(event) => {
                    setName(event.target.value);
                    if (!skuEdited) setSku(slug(event.target.value));
                  }}
                />
              </div>
              <div className="field">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  required
                  pattern="[a-z0-9-]{2,40}"
                  value={sku}
                  className="mono"
                  onChange={(event) => {
                    setSkuEdited(true);
                    setSku(event.target.value.toLowerCase());
                  }}
                />
                <p className="field-hint">Its address in the shop. Lowercase letters, digits and dashes; it can’t change later.</p>
              </div>
              <div className="field">
                <Label htmlFor="product-description">Description</Label>
                <textarea
                  id="product-description"
                  name="description"
                  className="console-input product-textarea"
                  required
                  maxLength={400}
                  rows={3}
                  placeholder="Shell, size and who it’s for"
                />
              </div>
            </fieldset>
            <fieldset>
              <legend>Price and stock</legend>
              <div className="product-row">
                <div className="field">
                  <Label htmlFor="product-price">Price</Label>
                  <Input id="product-price" name="price" type="number" required min="1" step="0.01" placeholder="349.00" />
                </div>
                <div className="field product-currency">
                  <Label htmlFor="product-currency">Currency</Label>
                  <select id="product-currency" className="console-input" name="currency" defaultValue="usd">
                    {["usd", "eur", "gbp", "ghs", "ngn", "kes", "zar", "cad"].map((code) => (
                      <option key={code} value={code}>
                        {code.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <Label htmlFor="product-model">Filled from device model</Label>
                <Input id="product-model" name="model" required maxLength={80} placeholder="As registered, e.g. Voyager" />
              </div>
            </fieldset>
          </div>

          <div className="product-footer">
            <label className="product-switch">
              <input type="checkbox" role="switch" checked={onSale} onChange={(event) => setOnSale(event.target.checked)} />
              <span aria-hidden="true" />
              <div>
                <strong>On sale</strong>
                <small>{onSale ? "Customers can buy it straight away." : "Hidden from the shop until you turn it on."}</small>
              </div>
            </label>
            {create.isError ? (
              <p className="field-error" role="alert">
                {create.error.message}
              </p>
            ) : null}
            <div className="product-actions">
              <button
                type="button"
                className="console-secondary"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Cancel
              </button>
              <button className="console-button" disabled={create.isPending || tooBig}>
                <Plus size={16} /> {create.isPending ? (photo ? "Uploading…" : "Adding…") : "Add product"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
