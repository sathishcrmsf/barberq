// @cursor: Homepage redirects to new Dashboard v2.0
// Operational Intelligence Dashboard with KPIs, insights, and quick actions

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
