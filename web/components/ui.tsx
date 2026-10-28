import type { JobPriority, JobStatus } from "@/lib/types";

const STATUS_STYLES: Record<JobStatus, string> = {
  draft: "text-text-soft bg-surface-alt border-border",
  scheduled: "text-accent bg-accent-soft border-[#D7DEFB]",
  in_progress: "text-[#B45F04] bg-[#FEF3E1] border-[#FBE1B6]",
  done: "text-[#107C3B] bg-[#E7F8EE] border-[#BFEDD1]",
  cancelled: "text-stop bg-[#FEF2F2] border-[#F8D3D3]",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const PRIORITY_STYLES: Record<JobPriority, string> = {
  low: "text-text-soft bg-border-strong",
  normal: "text-text-soft bg-border-strong",
  high: "text-route bg-route",
  urgent: "text-stop bg-stop",
};

export function PriorityTag({ priority }: { priority: JobPriority }) {
  const emphasized = priority === "high" || priority === "urgent";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${emphasized ? (priority === "urgent" ? "text-stop" : "text-route") : "text-text-soft"}`}
    >
      <span className={`h-3 w-[3px] rounded-sm ${PRIORITY_STYLES[priority]}`} />
      {priority}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h2 className="mt-8 mb-3 flex items-center justify-between border-b border-border pb-2 text-[13px] font-bold text-text first:mt-0">
      {children}
      {count !== undefined && <span className="font-mono text-xs font-normal text-text-faint">{count}</span>}
    </h2>
  );
}

export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[1.4rem] font-bold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Kpi({ label, value, dotColor }: { label: string; value: number | string; dotColor?: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-text-soft">{label}</span>
        {dotColor && <span className="h-[7px] w-[7px] rounded-full" style={{ background: dotColor }} />}
      </div>
      <div className="font-mono text-2xl font-medium text-text">{value}</div>
    </div>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60 ${className}`}
    />
  );
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3.5 py-2 text-sm font-semibold text-text hover:bg-surface-alt ${className}`}
    />
  );
}

export function DangerButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-md border border-[#F8D3D3] bg-[#FEF2F2] px-3.5 py-2 text-sm font-semibold text-stop hover:bg-[#FEE2E2] ${className}`}
    />
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-text-soft">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-border-strong bg-surface px-2.5 py-2 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft";
