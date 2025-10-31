
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * AdminPage component to display the admin dashboard.
 * This is a placeholder for future admin-specific content.
 */
export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a protected area for administrators only. You can add admin-specific components and functionality here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
