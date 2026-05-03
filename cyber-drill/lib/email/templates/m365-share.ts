import { wrapHtml } from "./_layout";
import type { TemplateFn } from "./index";

export const m365Share: TemplateFn = ({ recipient_name, action_url, tracking_pixel_url }) => {
  const subject = "Alex Johnson shared a document with you";

  const body = `
<tr><td style="background:#0078d4;padding:20px 32px;">
  <table cellpadding="0" cellspacing="0"><tr>
    <td style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Microsoft</td>
    <td style="padding-left:8px;font-size:14px;color:#c7e0f4;padding-top:3px;">SharePoint</td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px;">
  <p style="margin:0 0 8px;font-size:13px;color:#666666;">Hi ${recipient_name},</p>
  <p style="margin:0 0 24px;font-size:16px;color:#222222;line-height:1.5;">
    <strong>Alex Johnson</strong> shared a file with you.
  </p>
  <table cellpadding="0" cellspacing="0" style="background:#f8f8f8;border:1px solid #e0e0e0;border-radius:4px;margin-bottom:24px;width:100%;">
    <tr>
      <td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:13px;color:#0078d4;font-weight:600;">
          &#128196; Q4_Security_Report_Final.xlsx
        </p>
        <p style="margin:0;font-size:12px;color:#888888;">Shared · Microsoft Excel · 2.3 MB</p>
      </td>
    </tr>
  </table>
  <table cellpadding="0" cellspacing="0"><tr>
    <td style="background:#0078d4;border-radius:2px;">
      <a href="${action_url}" style="display:block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
        Open in SharePoint
      </a>
    </td>
  </tr></table>
  <p style="margin:24px 0 0;font-size:12px;color:#888888;">
    Sign in with your Microsoft account to view this file. Access will expire in 7 days.
  </p>
</td></tr>`;

  return {
    subject,
    html: wrapHtml(body, tracking_pixel_url),
    text: `Hi ${recipient_name},\n\nAlex Johnson shared "Q4_Security_Report_Final.xlsx" with you.\n\nOpen the file: ${action_url}\n\nSign in with your Microsoft account to access.`,
  };
};
