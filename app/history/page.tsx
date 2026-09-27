import { HistoryPage } from "@/components/history";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function History() {
  const s = await getSession();
  if (!s) redirect("/login");
  return <HistoryPage role={s.role} />;
}
