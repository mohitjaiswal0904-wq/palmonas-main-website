"use client";

import Image from "next/image";
import { useState } from "react";
import { ORDERS, orderTotal, type Order, type OrderStatus } from "@/data/profile";
import { formatINR } from "@/lib/format";
import { PanelHeader } from "../ui";

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  delivered: { label: "Delivered to", className: "text-[#1a7f37]" },
  cancelled: { label: "Cancelled", className: "text-[#e7000b]" },
  "in-transit": { label: "In Transit", className: "text-[#d08700]" },
};

function StatusLine({ order }: { order: Order }) {
  const meta = STATUS_META[order.status];
  return (
    <p className={`text-sm font-semibold ${meta.className}`}>
      {meta.label}
      {order.status === "delivered" ? (
        <span className="font-semibold text-[#151515]"> {order.recipient}</span>
      ) : null}
    </p>
  );
}

function OrderSummaryRow({
  label,
  value,
  negative,
  bold,
  muted,
}: {
  label: string;
  value: string;
  negative?: boolean;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        bold ? "text-[15px] font-bold text-[#151515]" : "text-[13px]"
      } ${muted ? "text-[#8a8a8a]" : "text-[#404040]"}`}
    >
      <span>{label}</span>
      <span className={negative ? "text-[#e7000b]" : ""}>{value}</span>
    </div>
  );
}

function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  return (
    <div className="max-w-[560px]">
      <PanelHeader title="Order Details" onBack={onBack} />

      <div className="flex items-start justify-between">
        <StatusLine order={order} />
        <span className="text-xs text-[#a3a3a3]">{order.date}</span>
      </div>
      <div className="mt-2 space-y-0.5 text-[13px] text-[#404040]">
        <p>Order ID: #{order.id}</p>
        <p>Total items: {order.items.length}</p>
        <p>Payment method: {order.paymentMethod}</p>
        <p>Delivery address: {order.deliveryAddress}</p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {order.items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg bg-[#f6f6f6] p-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image src={item.image} alt={item.title} fill sizes="180px" className="object-cover" />
            </div>
            <p className="mt-2 truncate text-[11px] text-[#404040]">{item.title}</p>
            <p className="text-[11px] text-[#8a8a8a]">
              MRP <span className="line-through">{formatINR(item.mrp)}</span>{" "}
              <span className="font-semibold text-[#151515]">{formatINR(item.price)}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2 border-t border-[#ececec] pt-4">
        <OrderSummaryRow label="Sub total" value={formatINR(order.subtotal, true)} />
        <OrderSummaryRow
          label={`Discount(${order.discountLabel})`}
          value={`-${formatINR(order.discount, true)}`}
          negative
        />
        {order.walletUsed > 0 ? (
          <OrderSummaryRow label="Wallet amount" value={`-${formatINR(order.walletUsed, true)}`} negative />
        ) : null}
        <OrderSummaryRow label="Shipping cost" value={formatINR(order.shipping, true)} muted />
        <OrderSummaryRow label="SGST 1.5%" value={formatINR(order.gst, true)} muted />
        <OrderSummaryRow label="CGST 1.5%" value={formatINR(order.gst, true)} muted />
        <div className="border-t border-[#ececec] pt-3">
          <OrderSummaryRow label="Grand total" value={formatINR(orderTotal(order), true)} bold />
        </div>
        <button
          type="button"
          className="ml-auto block text-sm font-medium text-[#3b5bdb] underline underline-offset-2"
        >
          Get Invoice
        </button>
      </div>
    </div>
  );
}

export default function Orders({ onExit }: { onExit: () => void }) {
  const [selected, setSelected] = useState<Order | null>(null);

  if (selected) {
    return <OrderDetail order={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="max-w-[560px]">
      <PanelHeader title="Order History" onBack={onExit} />
      <div className="divide-y divide-[#ececec]">
        {ORDERS.map((order) => (
          <div key={order.id} className="py-5 first:pt-0">
            <div className="flex items-start justify-between">
              <StatusLine order={order} />
              <span className="text-xs text-[#a3a3a3]">{order.date}</span>
            </div>
            <div className="mt-1.5 space-y-0.5 text-[13px] text-[#404040]">
              <p>Order ID : #{order.id}</p>
              <p>Total items : {order.items.length}</p>
              <p>Payment method : {order.paymentMethod}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(order)}
              className="mt-2 text-sm font-semibold text-[#151515] underline underline-offset-2"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
