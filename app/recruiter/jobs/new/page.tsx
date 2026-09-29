import type { Metadata } from "next";
import { PostJobClient } from "./post-job-client";

export const metadata: Metadata = { title: "Post a Job" };

export default function PostJobPage() {
  return <PostJobClient />;
}
