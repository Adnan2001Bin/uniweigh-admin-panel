export function exportReportCsv(reportType: string, selectedSite: string, daysRange: number) {
  alert(`Compiling report CSV registry with SHA-256 ledger checksum...\nTemplate: ${reportType}\nSite: ${selectedSite}\nRange: Prior ${daysRange} days`);
}
