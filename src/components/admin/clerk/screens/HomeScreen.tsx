import React from "react";
import { ArrowRight, Building2, Wallet, Shield, Receipt } from "lucide-react";
import { Transaction } from "../../../../types";
import RecentTransactionsTable from "../components/RecentTransactionsTable";

interface WorkflowCardProps {
  label: string;
  title: string;
  description: string;
  icon: React.ElementType;
  accent: "blue" | "amber";
  onClick: () => void;
}

const accentStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-600 ring-blue-100 group-hover:bg-blue-100/80",
    tag: "bg-blue-50 text-blue-600 ring-blue-100",
    cta: "text-blue-600 group-hover:text-blue-700",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100 group-hover:bg-amber-100/80",
    tag: "bg-amber-50 text-amber-600 ring-amber-100",
    cta: "text-amber-600 group-hover:text-amber-700",
  },
} as const;

function WorkflowCard({ label, title, description, icon: Icon, accent, onClick }: WorkflowCardProps) {
  const styles = accentStyles[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 text-left shadow-xs transition-all duration-200 hover:border-gray-300 hover:shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900/10 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors ${styles.icon}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <span className={`rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wider ring-1 ${styles.tag}`}>
          {label}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{description}</p>

      <div className={`mt-6 flex items-center gap-2 text-sm font-medium transition-colors ${styles.cta}`}>
        <span>Start entry</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

interface HomeScreenProps {
  adminUser: { name: string; role: string; avatarUrl?: string };
  onExit: () => void;
  onSelectAccount: () => void;
  onSelectCash: () => void;
  recentTransactions: Transaction[];
  onPrintTransaction: (tx: Transaction) => void;
}

export default function HomeScreen(props: HomeScreenProps) {
  const { recentTransactions, onPrintTransaction } = props;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
            Weighbridge Terminal
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 lg:text-3xl">
            Select transaction workflow
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Choose the billing stream for the vehicle currently on the scale.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <WorkflowCard
            label="B2B"
            title="Account Transaction"
            description="Process loading for established commercial customers. Pricing, contracts, and credit checks apply from the active job profile."
            icon={Building2}
            accent="blue"
            onClick={props.onSelectAccount}
          />
          <WorkflowCard
            label="Retail"
            title="Cash / Walk-in Transaction"
            description="Record weigh operations for one-off or immediate-payment deliveries. Accept card, EFTPOS, cash, or bank transfer before departure."
            icon={Wallet}
            accent="amber"
            onClick={props.onSelectCash}
          />
        </div>

        {/* Recent transactions */}
        <section className="mt-12 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                <Receipt className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Recent transactions
                </h4>
                <p className="mt-0.5 text-xs text-gray-500">
                  Last 5 completed tickets on this terminal
                </p>
              </div>
            </div>
          </div>

          <RecentTransactionsTable
            transactions={recentTransactions}
            onPrint={onPrintTransaction}
          />
        </section>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="h-3.5 w-3.5 shrink-0 text-emerald-500/70" strokeWidth={1.75} />
          <span>Terminal state is synced to the local depot scale sensor feed.</span>
        </div>
      </div>
    </div>
  );
}
