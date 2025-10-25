import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view reports for your clinic.
        </p>
      </div>

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
