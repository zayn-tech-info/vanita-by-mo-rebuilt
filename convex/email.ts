"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import nodemailer from "nodemailer";

export const sendOrderConfirmation = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(api.orders.getById, { id: args.orderId });
    if (!order) {
      console.warn("sendOrderConfirmation: order not found", args.orderId);
      return;
    }
    if (order.confirmationEmailSentAt) {
      return; 
    }

    const host = process.env.MAILTRAP_HOST;
    const port = process.env.MAILTRAP_PORT;
    const user = process.env.MAILTRAP_USER;
    const pass = process.env.MAILTRAP_PASS;

    if (!host || !port || !user || !pass) {
      console.error(
        "Missing Mailtrap env: MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USER, MAILTRAP_PASS"
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: false,
      auth: { user, pass },
    });

    const itemLines = order.items
      .map(
        (i) =>
          `<tr style="border-bottom: 1px solid #e7e5e4;"><td style="padding: 14px 16px; color: #1c1917; font-size: 15px;">${i.name}</td><td style="padding: 14px 16px; text-align: center; color: #57534e;">${i.quantity}</td><td style="padding: 14px 16px; text-align: right; color: #57534e;">$${i.price.toFixed(2)}</td><td style="padding: 14px 16px; text-align: right; color: #1c1917; font-weight: 600;">$${(i.price * i.quantity).toFixed(2)}</td></tr>`
      )
      .join("");

    const discountAmount = order.subtotal + order.shippingCost - order.total;
    const discountRow =
      discountAmount > 0
        ? `<tr><td colspan="3" style="padding: 10px 16px; color: #78716c; font-size: 14px;">Discount</td><td style="padding: 10px 16px; text-align: right; color: #15803d; font-weight: 600;">-$${discountAmount.toFixed(2)}</td></tr>`
        : "";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Order confirmed</title></head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: #fafaf9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafaf9;">
    <tr><td style="padding: 32px 20px 24px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
    <!-- Brand header -->
    <tr><td style="background: linear-gradient(180deg, #1c1917 0%, #292524 100%); padding: 28px 32px; text-align: center;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
        <div style="color: #fafaf9; font-size: 22px; font-weight: 200; letter-spacing: 0.25em;">VANITA</div>
        <div style="width: 32px; height: 2px; background: #b45309; margin: 8px auto 6px;"></div>
        <div style="color: #a8a29e; font-size: 10px; letter-spacing: 0.35em;">by M.O</div>
      </td></tr></table>
    </td></tr>
    <!-- Success banner -->
    <tr><td style="padding: 28px 32px 20px;">
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fcd34d; border-radius: 8px; padding: 16px 20px;">
        <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600;">✓ Payment successful</p>
        <p style="margin: 4px 0 0; color: #78350f; font-size: 14px;">Your order is confirmed.</p>
      </div>
      <h1 style="margin: 24px 0 8px; color: #1c1917; font-size: 24px; font-weight: 300;">Thank you, ${order.customerName}</h1>
      <p style="margin: 0; color: #57534e; font-size: 15px; line-height: 1.6;">We're getting your order ready.</p>
    </td></tr>
    <!-- Order items -->
    <tr><td style="padding: 0 32px 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e7e5e4; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #1c1917;">
            <th style="text-align: left; padding: 14px 16px; color: #fafaf9; font-size: 11px; font-weight: 600; letter-spacing: 0.1em;">ITEM</th>
            <th style="text-align: center; padding: 14px 16px; color: #fafaf9; font-size: 11px; font-weight: 600; letter-spacing: 0.1em;">QTY</th>
            <th style="text-align: right; padding: 14px 16px; color: #fafaf9; font-size: 11px; font-weight: 600; letter-spacing: 0.1em;">PRICE</th>
            <th style="text-align: right; padding: 14px 16px; color: #fafaf9; font-size: 11px; font-weight: 600; letter-spacing: 0.1em;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemLines}
          ${discountRow}
        </tbody>
      </table>
    </td></tr>
    <!-- Totals -->
    <tr><td style="padding: 0 32px 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #fafaf9; border-radius: 8px;">
        <tr><td style="padding: 20px 20px 6px; color: #57534e; font-size: 14px;">Subtotal</td><td style="padding: 20px 20px 6px; text-align: right; color: #1c1917; font-size: 14px;">$${order.subtotal.toFixed(2)}</td></tr>
        <tr><td style="padding: 6px 20px; color: #57534e; font-size: 14px;">Shipping</td><td style="padding: 6px 20px; text-align: right; color: #1c1917; font-size: 14px;">${order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}</td></tr>
        <tr><td style="padding: 16px 20px 20px; color: #1c1917; font-size: 16px; font-weight: 600;">Total paid</td><td style="padding: 16px 20px 20px; text-align: right; color: #b45309; font-size: 18px; font-weight: 700;">$${order.total.toFixed(2)}</td></tr>
      </table>
    </td></tr>
    <!-- Shipping -->
    <tr><td style="padding: 0 32px 28px;">
      <div style="border: 1px solid #e7e5e4; border-radius: 8px; padding: 20px;">
        <p style="margin: 0 0 8px; color: #78716c; font-size: 11px; font-weight: 600; letter-spacing: 0.1em;">SHIPPING TO</p>
        <p style="margin: 0; color: #1c1917; font-size: 15px; line-height: 1.5;">${order.shippingAddress.street}<br/>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br/>${order.shippingAddress.country}</p>
      </div>
    </td></tr>
    <!-- Footer -->
    <tr><td style="background: #fafaf9; padding: 24px 32px; border-top: 1px solid #e7e5e4;">
      <p style="margin: 0; color: #78716c; font-size: 13px;">Questions? Reply to this email or <a href="mailto:support@vanitabymo.com" style="color: #b45309; text-decoration: none; font-weight: 500;">contact us</a>.</p>
      <p style="margin: 16px 0 0; color: #a8a29e; font-size: 12px;">VANITA by M.O · Handcrafted with love</p>
    </td></tr>
  </table>
    </td></tr>
  </table>
</body>
</html>
`.trim();

    await transporter.sendMail({
      from: process.env.MAILTRAP_FROM ?? "Vanita by M.O <orders@vanitabymo.com>",
      to: order.customerEmail,
      subject: `Order confirmed — $${order.total.toFixed(2)}`,
      html,
    });

    await ctx.runMutation(api.orders.setConfirmationEmailSent, {
      orderId: args.orderId,
    });
  },
});

const statusLabels: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Send order status update email (called by scheduler after delay). */
export const sendOrderStatusNotification = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(api.orders.getById, { id: args.orderId });
    if (!order) return;

    const host = process.env.MAILTRAP_HOST;
    const port = process.env.MAILTRAP_PORT;
    const user = process.env.MAILTRAP_USER;
    const pass = process.env.MAILTRAP_PASS;
    if (!host || !port || !user || !pass) {
      console.error("Missing Mailtrap env for order status email");
      return;
    }

    const statusLabel = statusLabels[order.status] ?? order.status;
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: false,
      auth: { user, pass },
    });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Order status update</title></head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: #fafaf9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafaf9;">
    <tr><td style="padding: 32px 20px 24px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
    <tr><td style="background: linear-gradient(180deg, #1c1917 0%, #292524 100%); padding: 24px 32px; text-align: center;">
      <div style="color: #fafaf9; font-size: 20px; font-weight: 200; letter-spacing: 0.25em;">VANITA</div>
      <div style="width: 28px; height: 2px; background: #b45309; margin: 6px auto 4px;"></div>
      <div style="color: #a8a29e; font-size: 9px; letter-spacing: 0.35em;">by M.O</div>
    </td></tr>
    <tr><td style="padding: 28px 32px;">
      <h1 style="margin: 0 0 8px; color: #1c1917; font-size: 22px; font-weight: 300;">Order status update</h1>
      <p style="margin: 0 0 20px; color: #57534e; font-size: 15px;">Hi ${order.customerName},</p>
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px 20px;">
        <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600; letter-spacing: 0.05em;">CURRENT STATUS</p>
        <p style="margin: 6px 0 0; color: #1c1917; font-size: 18px; font-weight: 600;">${statusLabel}</p>
      </div>
      <p style="margin: 20px 0 8px; color: #78716c; font-size: 12px; letter-spacing: 0.05em;">ORDER TOTAL</p>
      <p style="margin: 0 0 16px; color: #1c1917; font-size: 16px; font-weight: 600;">$${order.total.toFixed(2)}</p>
      <p style="margin: 0 0 4px; color: #78716c; font-size: 12px; letter-spacing: 0.05em;">SHIPPING TO</p>
      <p style="margin: 0; color: #57534e; font-size: 14px; line-height: 1.5;">${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}</p>
    </td></tr>
    <tr><td style="background: #fafaf9; padding: 20px 32px; border-top: 1px solid #e7e5e4;">
      <p style="margin: 0; color: #78716c; font-size: 13px;">Questions? <a href="mailto:support@vanitabymo.com" style="color: #b45309; text-decoration: none; font-weight: 500;">Contact us</a></p>
      <p style="margin: 12px 0 0; color: #a8a29e; font-size: 12px;">VANITA by M.O</p>
    </td></tr>
  </table>
    </td></tr>
  </table>
</body>
</html>
`.trim();

    await transporter.sendMail({
      from: process.env.MAILTRAP_FROM ?? "Vanita by M.O <orders@vanitabymo.com>",
      to: order.customerEmail,
      subject: `Order status: ${statusLabel}`,
      html,
    });

    await ctx.runMutation(api.orders.clearOrderStatusNotification, {
      orderId: args.orderId,
    });
  },
});
