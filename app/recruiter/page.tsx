import type { Metadata } from "next";
import { RecruiterClient } from "./recruiter-client";

export const metadata: Metadata = { title: "Recruiter Dashboard" };

export default function RecruiterPage() {
  return <RecruiterClient />;
}
