export function DataTablePlaceholder() {
  return (
    <div className="w-full">
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="bg-card hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">#INV-{1000 + i}</td>
                <td className="px-4 py-3 text-muted-foreground">Placeholder item description</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                    Completed
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">Oct {10 + i}, 2023</td>
                <td className="px-4 py-3 text-right font-medium text-foreground">${(i * 125.50).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
