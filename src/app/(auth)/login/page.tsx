import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 overflow-hidden rounded-lg">
          <Image
            data-ai-hint="abstract illustration office"
            src="https://picsum.photos/seed/login-banner/800/200"
            alt="ClinicOffice banner"
            width={800}
            height={200}
            className="object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold font-headline">ClinicOffice</h1>
        <p className="text-muted-foreground">
          Digitizing Doctor Office Operations
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select>
                <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <div className="text-center">
            <Link
            href="#"
            className="inline-block text-sm text-primary hover:underline"
            >
            Forgot Password?
            </Link>
        </div>
      </div>
    </div>
  );
}
