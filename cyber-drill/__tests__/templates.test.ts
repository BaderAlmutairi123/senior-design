import { describe, it, expect } from "vitest";
import { templateRegistry, TEMPLATE_KEYS, type TemplateKey } from "@/lib/email/templates";

const VARS = {
  recipient_name: "TestUser",
  action_url: "https://example.com/action",
  tracking_pixel_url: "https://example.com/pixel",
};

describe("phishing email templates", () => {
  for (const key of TEMPLATE_KEYS) {
    describe(key, () => {
      const renderFn = templateRegistry[key as TemplateKey];

      it("renders without throwing", () => {
        expect(() => renderFn(VARS)).not.toThrow();
      });

      it("has a non-empty subject", () => {
        const { subject } = renderFn(VARS);
        expect(subject.length).toBeGreaterThan(0);
      });

      it("substitutes recipient_name in html", () => {
        const { html } = renderFn(VARS);
        expect(html).toContain(VARS.recipient_name);
      });

      it("leaves no unreplaced {{...}} tokens", () => {
        const { html, text } = renderFn(VARS);
        expect(html).not.toMatch(/\{\{[^}]+\}\}/);
        expect(text).not.toMatch(/\{\{[^}]+\}\}/);
      });

      it("embeds tracking pixel in html", () => {
        const { html } = renderFn(VARS);
        expect(html).toContain(VARS.tracking_pixel_url);
        expect(html).toMatch(/<img[^>]+src="[^"]*\/pixel[^"]*"/);
      });

      it("contains action_url inside an anchor tag", () => {
        const { html } = renderFn(VARS);
        expect(html).toContain(`href="${VARS.action_url}"`);
      });

      it("has non-empty text fallback", () => {
        const { text } = renderFn(VARS);
        expect(text.length).toBeGreaterThan(20);
      });
    });
  }
});
