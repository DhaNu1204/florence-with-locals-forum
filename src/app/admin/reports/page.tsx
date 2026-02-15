import { getReports } from "@/app/actions/admin-actions";
import { ReportStatus } from "@/types";
import { ReportsClient } from "./ReportsClient";

interface Props {
  searchParams: { status?: string };
}

export default async function ReportsPage({ searchParams }: Props) {
  const statusFilter = (
    ["pending", "reviewed", "resolved", "dismissed"].includes(searchParams.status ?? "")
      ? searchParams.status
      : undefined
  ) as ReportStatus | undefined;

  const reports = await getReports(statusFilter);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-dark-text sm:text-3xl">
        Reports
      </h1>
      <ReportsClient initialReports={reports} currentFilter={statusFilter} />
    </div>
  );
}
