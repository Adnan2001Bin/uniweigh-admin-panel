import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

/**
 * Promise-based replacements for window.confirm / window.prompt, rendered
 * with the design-system dialogs. Mount <DialogHost /> once per app root;
 * then `await confirmDialog("...")` / `await promptDialog("...")` anywhere.
 */

export interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export interface PromptOptions {
  title?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type ConfirmRequest = {
  kind: "confirm";
  message: string;
  opts: ConfirmOptions;
  resolve: (ok: boolean) => void;
};

type PromptRequest = {
  kind: "prompt";
  message: string;
  opts: PromptOptions;
  resolve: (value: string | null) => void;
};

type Request = ConfirmRequest | PromptRequest;

let enqueue: ((req: Request) => void) | null = null;

export function confirmDialog(message: string, opts: ConfirmOptions = {}): Promise<boolean> {
  if (!enqueue) return Promise.resolve(window.confirm(message));
  return new Promise((resolve) => enqueue!({ kind: "confirm", message, opts, resolve }));
}

export function promptDialog(message: string, opts: PromptOptions = {}): Promise<string | null> {
  if (!enqueue) return Promise.resolve(window.prompt(message, opts.defaultValue ?? "") );
  return new Promise((resolve) => enqueue!({ kind: "prompt", message, opts, resolve }));
}

export function DialogHost() {
  const [queue, setQueue] = React.useState<Request[]>([]);
  const [promptValue, setPromptValue] = React.useState("");
  const active = queue[0] ?? null;

  React.useEffect(() => {
    enqueue = (req) => {
      if (req.kind === "prompt") setPromptValue(req.opts.defaultValue ?? "");
      setQueue((q) => [...q, req]);
    };
    return () => {
      enqueue = null;
    };
  }, []);

  const settle = (result: boolean | string | null) => {
    if (!active) return;
    if (active.kind === "confirm") active.resolve(Boolean(result));
    else active.resolve(typeof result === "string" ? result : null);
    setQueue((q) => q.slice(1));
    setPromptValue("");
  };

  if (!active) return null;

  if (active.kind === "confirm") {
    return (
      <AlertDialog open onOpenChange={(open) => !open && settle(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{active.opts.title ?? "Please confirm"}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {active.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => settle(false)}>
              {active.opts.cancelLabel ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction destructive={active.opts.destructive} onClick={() => settle(true)}>
              {active.opts.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && settle(null)}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            settle(promptValue);
          }}
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>{active.opts.title ?? "Input required"}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">{active.message}</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={promptValue}
            placeholder={active.opts.placeholder}
            onChange={(e) => setPromptValue(e.target.value)}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => settle(null)}>
              {active.opts.cancelLabel ?? "Cancel"}
            </Button>
            <Button type="submit">{active.opts.confirmLabel ?? "OK"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
