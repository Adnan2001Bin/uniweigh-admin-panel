import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--sidebar)",
          color: "var(--sidebar-accent-foreground)",
          border: "1px solid var(--sidebar-border)",
          borderRadius: "var(--radius)",
          fontSize: "0.875rem",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
