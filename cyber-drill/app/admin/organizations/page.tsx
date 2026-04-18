import Link from "next/link";
import { getOrganizations } from "@/lib/organizations/queries";

export default async function AdminOrganizationsPage() {
  const orgs = await getOrganizations();

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-bold text-4xl tracking-tighter text-[var(--cd-on-surface)]">
            Organizations
          </h1>
          <p className="mt-2 text-sm text-[var(--cd-on-surface-variant)]">
            {orgs.length} organization{orgs.length === 1 ? "" : "s"} on the platform
          </p>
        </div>
        <Link
          href="/admin/organizations/new"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--cd-tertiary)] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-[var(--cd-surface)] transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Organization
        </Link>
      </div>

      {orgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] py-20 text-center">
          <span className="material-symbols-outlined mb-4 text-5xl text-[var(--cd-on-surface-variant)]">
            corporate_fare
          </span>
          <p className="font-headline text-lg font-bold text-[var(--cd-on-surface)]">
            No Organizations Yet
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
            Create one to onboard a company
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/admin/organizations/${org.id}`}
              className="group rounded-lg border border-[var(--cd-surface-container-highest)]/50 bg-[var(--cd-surface-container-low)] p-5 transition-all hover:border-[var(--cd-tertiary)]/40 hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--cd-tertiary)]/10 text-[var(--cd-tertiary)]">
                  <span className="material-symbols-outlined text-xl">
                    corporate_fare
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-headline font-bold text-[var(--cd-on-surface)] truncate group-hover:text-[var(--cd-tertiary)] transition-colors">
                    {org.name}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--cd-on-surface-variant)]">
                    {org.slug}
                  </p>
                </div>
              </div>

              {org.description && (
                <p className="text-sm text-[var(--cd-on-surface-variant)] line-clamp-2 mb-4">
                  {org.description}
                </p>
              )}

              <div className="flex items-center gap-4 border-t border-[var(--cd-surface-container-highest)]/50 pt-3">
                <div className="flex items-center gap-1 text-[var(--cd-on-surface-variant)]">
                  <span className="material-symbols-outlined text-sm text-[#8ff5ff]">
                    group
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    {org.member_count} member{org.member_count === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[var(--cd-on-surface-variant)]">
                  <span className="material-symbols-outlined text-sm text-[#a2f31f]">
                    precision_manufacturing
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    {org.scenario_count} scenario{org.scenario_count === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
