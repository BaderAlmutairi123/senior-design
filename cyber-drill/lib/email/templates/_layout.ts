export function wrapHtml(body: string, pixelUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title></title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">
      ${body}
      <tr><td style="padding:24px 32px;border-top:1px solid #e8e8e8;">
        <p style="margin:0;font-size:11px;color:#999999;line-height:1.5;">
          This message was sent to you by your organization as part of a security awareness program.
          If you have questions, contact your IT department.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;"/>
</body>
</html>`;
}
