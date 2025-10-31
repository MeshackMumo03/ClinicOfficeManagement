// Import necessary components from ShadCN.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * ReportsPage component to display a placeholder for future reports.
 * This page is currently under construction.
 */
export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header section with page title and description. */}
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view reports for your clinic.
        </p>
      </div>

      {/* A card indicating that the page is under construction. */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. Please check back later for reporting features.</p>
        </CardContent>
      </Card>
    </div>
  );
}
