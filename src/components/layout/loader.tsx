// Import the Stethoscope icon from lucide-react.
import { Stethoscope } from 'lucide-react';

/**
 * Loader component to display a loading animation.
 * It features a pulsing stethoscope icon, consistent with the app's theme.
 */
export function Loader() {
  return (
    // Centered container for the loader.
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <div className="relative flex h-24 w-24 items-center justify-center">
            {/* Pulsing animation element. */}
            <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75"></div>
            {/* Stethoscope icon container. */}
            <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Stethoscope className="h-10 w-10" />
            </div>
        </div>
        {/* Loading text. */}
        <p className="text-lg font-medium text-muted-foreground">Loading...</p>
    </div>
  );
}
