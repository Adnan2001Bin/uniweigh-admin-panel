import { Job } from "../../../../types";

export type ExportScope =
  | "current"
  | "selected"
  | "filtered"
  | "individual"
  | "txs"
  | "pricing";

export interface ExportSimulationContext {
  jobsCount: number;
  checkedCount: number;
  filteredCount: number;
  activeJob: Job | null;
  activeJobTxCount: number;
  setIsExporting: (value: boolean) => void;
  setExportProgress: (value: number | ((prev: number) => number)) => void;
  setExportMessage: (value: string) => void;
  onComplete: (filename: string, description: string) => void;
}

export function triggerExportSimulation(
  scope: ExportScope,
  format: "CSV" | "Excel" | "PDF",
  ctx: ExportSimulationContext
) {
  ctx.setIsExporting(true);
  ctx.setExportProgress(10);
  ctx.setExportMessage("Filtering selected records...");

  let filename = "uniweigh_jobs_report";
  let desc = "";

  if (scope === "individual" && ctx.activeJob) {
    filename = `uniweigh_job_summary_${ctx.activeJob.id}`;
    desc = `Individual Job Summary report for contract ${ctx.activeJob.id} (${ctx.activeJob.customerOrderRef}).`;
  } else if (scope === "txs" && ctx.activeJob) {
    filename = `uniweigh_job_txs_${ctx.activeJob.id}`;
    desc = `Full operational delivery ledger containing transactions for job ${ctx.activeJob.id}.`;
  } else if (scope === "pricing" && ctx.activeJob) {
    filename = `uniweigh_job_pricing_${ctx.activeJob.id}`;
    desc = `Contract pricing rule sheet for job ${ctx.activeJob.id}.`;
  } else if (scope === "selected") {
    filename = `uniweigh_selected_jobs_export`;
    desc = `Export payload containing ${ctx.checkedCount} checked jobs.`;
  } else if (scope === "filtered") {
    filename = `uniweigh_filtered_jobs_export`;
    desc = `Export payload containing ${ctx.filteredCount} filtered jobs.`;
  } else {
    filename = `uniweigh_all_jobs_master`;
    desc = `Master customer projects & jobs directory registry listing (${ctx.jobsCount} jobs).`;
  }

  const interval = setInterval(() => {
    ctx.setExportProgress((prev) => {
      if (prev >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          ctx.onComplete(filename, desc);
        }, 350);
        return 100;
      }

      if (prev === 40) {
        ctx.setExportMessage("Parsing data headers & ledger weights...");
      } else if (prev === 80) {
        ctx.setExportMessage(`Assembling ${format} document format...`);
      }
      return prev + 30;
    });
  }, 200);
}
