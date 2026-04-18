import Link from "next/link";
import { createOrganization } from "@/lib/organizations/actions";

export default function NewOrganizationPage() {
  return (
    <>
      <div className="mb-8">
        <Link
          href="/admin/organizations"
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] hover:text-[var(--cd-tertiary)] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Organizations
        </Link>
        <h1 className="font-headline font-bold text-4xl tracking-tighter text-[var(--cd-on-surface)]">
          New Organization
        </h1>
        <p className="mt-2 text-sm text-[var(--cd-on-surface-variant)]">
          Create an organization to group users and assign scenarios.
        </p>
      </div>

      <form
        action={createOrganization}
        className="max-w-xl space-y-6 rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-6"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="Acme Corporation"
            className="w-full rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface)] px-4 py-2.5 text-sm text-[var(--cd-on-surface)] placeholder:text-[var(--cd-on-surface-variant)]/60 focus:border-[var(--cd-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--cd-tertiary)]"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-[10px] font-mono uppercase tracking-widest text-[var(--cd-on-surface-variant)] mb-2"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Short description of the organization..."
            className="w-full rounded-md border border-[var(--cd-surface-container-highest)] bg-[var(--cd-surface)] px-4 py-2.5 text-sm text-[var(--cd-on-surface)] placeholder:text-[var(--cd-on-surface-variant)]/60 focus:border-[var(--cd-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--cd-tertiary)] resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-tertiary)] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Organization
          </button>
          <Link
            href="/admin/organizations"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--cd-surface-container-highest)] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-[var(--cd-on-surface-variant)] hover:border-[var(--cd-tertiary)]/40 hover:text-[var(--cd-on-surface)] transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
