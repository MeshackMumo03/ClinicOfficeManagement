
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InfoRowProps {
  label: string;
  value?: string | null;
}

/**
 * A reusable component to display a label and a value.
 * It will not render if the value is not provided.
 * @param {InfoRowProps} props The properties for the component.
 */
function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <div className="grid gap-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  items: { label: string; value?: string | null }[];
}

/**
 * A reusable card component to display a list of information items.
 * @param {InfoCardProps} props The properties for the component.
 */
export function InfoCard({ title, items }: InfoCardProps) {
  // Filter out items that don't have a value to avoid rendering empty sections.
  const validItems = items.filter(item => item.value);

  if (validItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          {validItems.map((item) => (
            <InfoRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
