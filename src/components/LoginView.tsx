import React, { useState } from "react";
import { Lock, Mail, ShieldCheck, Scale, ClipboardCheck, Code2, ArrowRight } from "lucide-react";
import { AdminUser } from "../types";
import { DEMO_LOGIN_ACCOUNTS, authenticateDemoUser } from "../data";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

interface LoginViewProps {
  onLogin: (user: AdminUser) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const user = authenticateDemoUser(email, password);
    if (!user) {
      toast.error("Invalid email or password. Use a demo account below.");
      setIsSubmitting(false);
      return;
    }

    onLogin(user);
    toast.success(`Welcome back, ${user.name}`);
    setIsSubmitting(false);
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const roleIcon = (role: string) => {
    if (role === "Administrator") return ShieldCheck;
    if (role === "Developer") return Code2;
    if (role === "Weighbridge Operator") return Scale;
    return ClipboardCheck;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background text-foreground">
      <div className="flex h-16 items-center border-b border-border bg-sidebar px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xl">
            U
          </div>
          <span className="text-lg font-bold tracking-tight text-sidebar-accent-foreground">uniweigh</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in to UniWeigh</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Administrators, developers, and auditors access the admin panel. Weighbridge operators sign in to the clerk terminal only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@uniweigh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-bold" disabled={isSubmitting}>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
        </div>
      </div>

      {/* Demo accounts — bottom right */}
      <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm px-4 sm:px-0 sm:w-auto">
        <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Demo Test Accounts
          </p>
          <div className="space-y-2">
            {DEMO_LOGIN_ACCOUNTS.map((account) => {
              const Icon = roleIcon(account.role);
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemoAccount(account.email, account.password)}
                  className="w-full rounded-md border border-border bg-muted/50 px-3 py-2.5 text-left hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className="h-4 w-4 mt-0.5 text-info shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">{account.role}</p>
                      <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                      <p className="text-xs font-mono text-muted-foreground">Password: {account.password}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Click an account to auto-fill credentials.</p>
        </div>
      </div>
    </div>
  );
}
