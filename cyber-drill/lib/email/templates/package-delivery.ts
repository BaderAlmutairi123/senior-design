import { wrapHtml } from "./_layout";
import type { TemplateFn } from "./index";

export const packageDelivery: TemplateFn = ({ recipient_name, action_url, tracking_pixel_url }) => {
  const subject = "Action required: Your package could not be delivered";

  const body = `
<tr><td style="background:#cc0000;padding:16px 32px;">
  <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">FedEx</p>
</td></tr>
<tr><td style="padding:32px;">
  <div style="background:#fff3cd;border-left:4px solid #cc0000;padding:12px 16px;margin-bottom:24px;border-radius:2px;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#cc0000;">&#9888; Delivery Attempt Failed</p>
  </div>
  <p style="margin:0 0 8px;font-size:13px;color:#666666;">Dear ${recipient_name},</p>
  <p style="margin:0 0 16px;font-size:15px;color:#222222;line-height:1.6;">
    We attempted to deliver your package but were unable to complete delivery. A second delivery attempt will be made
    <strong>within 24 hours</strong>. If delivery fails again, the package will be returned to the sender.
  </p>
  <table cellpadding="0" cellspacing="0" style="background:#f8f8f8;border:1px solid #e0e0e0;border-radius:4px;margin-bottom:24px;width:100%;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0 0 6px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.05em;">Tracking Number</p>
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#222222;font-family:monospace;">7489 2043 5581</p>
      <p style="margin:0 0 6px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.05em;">Status</p>
      <p style="margin:0;font-size:14px;color:#cc0000;font-weight:600;">&#9679; Delivery Exception</p>
    </td></tr>
  </table>
  <p style="margin:0 0 20px;font-size:14px;color:#222222;">
    To reschedule delivery or arrange pickup, please confirm your address:
  </p>
  <table cellpadding="0" cellspacing="0"><tr>
    <td style="background:#cc0000;border-radius:2px;">
      <a href="${action_url}" style="display:block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
        Reschedule Delivery
      </a>
    </td>
  </tr></table>
  <p style="margin:20px 0 0;font-size:12px;color:#888888;">
    This link expires in 48 hours. A delivery fee of $3.50 may apply for redelivery.
  </p>
</td></tr>`;

  return {
    subject,
    html: wrapHtml(body, tracking_pixel_url),
    text: `Dear ${recipient_name},\n\nWe attempted to deliver your package (Tracking: 7489 2043 5581) but delivery failed.\n\nReschedule delivery: ${action_url}\n\nThis link expires in 48 hours.`,
  };
};
