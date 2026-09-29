import type { Metadata } from "next";
import { ApplicationsClient } from "./applications-client";

export const metadata: Metadata = { title: "My Applications" };

export default function ApplicationsPage() {
  return <ApplicationsClient />;
}
