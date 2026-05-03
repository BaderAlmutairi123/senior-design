import { m365Share } from "./m365-share";
import { packageDelivery } from "./package-delivery";
import { itPasswordReset } from "./it-password-reset";

export interface TemplateVars {
  recipient_name: string;
  action_url: string;
  tracking_pixel_url: string;
}

export type TemplateFn = (vars: TemplateVars) => {
  subject: string;
  html: string;
  text: string;
};

export const TEMPLATE_KEYS = [
  "m365_share",
  "package_delivery",
  "it_password_reset",
] as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  m365_share: "Microsoft 365 Document Share",
  package_delivery: "Package Delivery Failure",
  it_password_reset: "IT Password Expiry",
};

export const templateRegistry: Record<TemplateKey, TemplateFn> = {
  m365_share: m365Share,
  package_delivery: packageDelivery,
  it_password_reset: itPasswordReset,
};
