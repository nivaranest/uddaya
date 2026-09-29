import { companyFor } from "@/lib/data";

export function CompanyLogo({ company, size = 40 }: { company: string; size?: number }) {
  return (
    <div
      className="flex flex-none items-center justify-center rounded-[10px] font-display font-semibold text-white"
      style={{ width: size, height: size, background: companyFor(company).logoBg, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {company[0]}
    </div>
  );
}
