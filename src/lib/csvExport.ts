export function exportToCSV(data: any[], filename: string, headers: string[]) {
  if (!data || !data.length) {
    alert("No data to export");
    return;
  }

  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const val = row[header] || "";
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
