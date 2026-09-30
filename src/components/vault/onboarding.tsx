import { useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVault } from "@/lib/vault-context";

export function OnboardingDialog() {
  const v = useVault();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const open = !v.vault.profile.onboarded;

  const finish = async (goPersonal: boolean) => {
    setBusy(true);
    try {
      const trimmed = name.trim();
      if (trimmed && !v.vault.profile.personal.full_name) await v.savePersonalField("full_name", trimmed);
      await v.updateProfile({ display_name: trimmed.split(" ")[0] || "", onboarded: true });
      if (goPersonal) navigate({ to: "/personal" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && finish(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center sm:text-center">
          <span className="tint-tile mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-tint-blue">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <DialogTitle className="text-xl">Welcome to InfoVault</DialogTitle>
          <DialogDescription>
            Save your details once, then copy any field with a single click. Your vault is private to
            your account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="ob-name">What should we call you?</Label>
          <Input
            id="ob-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            maxLength={100}
            onKeyDown={(e) => e.key === "Enter" && finish(true)}
          />
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" disabled={busy} onClick={() => finish(false)}>
            Skip for now
          </Button>
          <Button disabled={busy} onClick={() => finish(true)}>
            Start with personal info
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
