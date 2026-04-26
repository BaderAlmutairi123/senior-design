import { wrapHtml } from "./_layout";
import type { TemplateFn } from "./index";

export const itPasswordReset: TemplateFn = ({ recipient_name, action_url, tracking_pixel_url }) => {
  const subject = "Action required: Your password expires in 24 hours";

  const body = `
<tr><td style="background:#1a1a2e;padding:20px 32px;">
  <table cellpadding="0" cellspacing="0"><tr>
    <td>
      <span style="display:inline-block;background:#e63946;color:#ffffff;font-size:11px;font-weight:700;
        padding:3px 8px;border-radius:2px;letter-spacing:0.05em;text-transform:uppercase;">IT SECURITY</span>
    </td>
    <td style="padding-left:10px;font-size:14px;color:#cccccc;">Corporate Systems</td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px;">
  <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:4px;padding:14px 18px;margin-bottom:24px;">
    <p style="margin:0;font-size:14px;color:#dc2626;font-weight:600;">
      &#128274; Your password will expire in <span style="text-decoration:underline;">24 hours</span>
    </p>
  </div>
  <p style="margin:0 0 8px;font-size:13px;color:#666666;">Hello ${recipient_name},</p>
  <p style="margin:0 0 16px;font-size:15px;color:#222222;line-height:1.6;">
    Our records indicate your corporate account password is due to expire. To maintain uninterrupted access
    to company systems, you must reset your password before the deadline.
  </p>
  <table cellpadding="0" cellspacing="0" style="background:#f8f8f8;border:1px solid #e0e0e0;border-radius:4px;margin-bottom:24px;width:100%;">
    <tr><td style="padding:12px 20px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="font-size:12px;color:#888888;">Expires</td>
          <td align="right" style="font-size:12px;color:#dc2626;font-weight:600;">in 24 hours</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#888888;padding-top:6px;">Policy</td>
          <td align="right" style="font-size:12px;color:#444444;padding-top:6px;">90-day rotation required</td>
        </tr>
      </table>
    </td></tr>
  </table>
  <p style="margin:0 0 20px;font-size:14px;color:#222222;">
    Click below to reset your password through the secure company portal:
  </p>
  <table cellpadding="0" cellspacing="0"><tr>
    <td style="background:#1a1a2e;border-radius:2px;">
      <a href="${action_url}" style="display:block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
        Reset Password Now
      </a>
    </td>
  </tr></table>
  <p style="margin:20px 0 0;font-size:12px;color:#888888;">
    If you already reset your password, ignore this message. For help, contact the IT help desk.
  </p>
</td></tr>`;

  return {
    subject,
    html: wrapHtml(body, tracking_pixel_url),
    text: `Hello ${recipient_name},\n\nYour corporate account password will expire in 24 hours.\n\nReset your password: ${action_url}\n\nIf you need help, contact the IT help desk.`,
  };
};
