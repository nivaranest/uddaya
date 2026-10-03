import type { Metadata } from "next";
import { CompanyClient } from "./company-client";

export const metadata: Metadata = { title: "Company & Team" };

export default function CompanyPage() {
  return <CompanyClient />;
}
