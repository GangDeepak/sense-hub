import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Play, Loader2 } from "lucide-react";
import { getAuthHeaders } from "@/utils/token";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ── In-memory cache ────────────────────────────────────────────────────────────
const cache: Record<string, any> = {};

async function cachedFetch<T>(url: string): Promise<T> {
  if (cache[url] !== undefined) return cache[url] as T;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const data = await res.json();
  cache[url] = data;
  return data;
}

function buildUserUrl(env: string, domains: string[]) {
  const params = new URLSearchParams({ env });
  domains.forEach((d) => params.append("tenant", `@${d}`));
  return `${API_BASE}/api/users?${params.toString()}`;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface Option { label: string; value: string }

interface FilterBarProps {
  onApply: (filters: {
    env: string;
    quickRange: string;
    startDate: string;
    endDate: string;
    tenants: string;
    users: string;
  }) => void;
  initialFilters?: {
    env: string;
    quickRange: string;
    startDate: string;
    endDate: string;
    tenants: string;
    users: string;
  };
}

interface MultiSelectDropdownProps {
  options: Option[];
  onChange: (selected: string[]) => void;
  selectedValues?: string[];
  loading?: boolean;
}

// ── MultiSelectDropdown ────────────────────────────────────────────────────────
const MultiSelectDropdown = ({
  options,
  onChange,
  selectedValues,
  loading,
}: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allChecked, setAllChecked] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedValues !== undefined) {
      if (selectedValues.length === 0) {
        setSelected(new Set());
        setAllChecked(true);
      } else {
        setSelected(new Set(selectedValues));
        setAllChecked(false);
      }
    }
  }, [selectedValues]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleAll = (checked: boolean) => {
    setAllChecked(checked);
    setSelected(new Set());
    onChange([]);
  };

  const toggleItem = (item: string) => {
    const next = new Set(selected);
    next.has(item) ? next.delete(item) : next.add(item);
    setSelected(next);
    setAllChecked(next.size === 0);
    onChange(Array.from(next));
  };

  const selectedLabels = options.filter((o) => selected.has(o.value)).map((o) => o.label);
  const displayText = loading
    ? "Loading…"
    : allChecked || selected.size === 0
      ? "ALL"
      : selected.size === 1
        ? selectedLabels[0]
        : `${selected.size} selected`;

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => !loading && setOpen((v) => !v)}
        className={`flex items-center justify-between gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs min-w-[180px] transition-colors ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary"
          }`}
      >
        <span className="truncate text-foreground/80">{displayText}</span>
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
        ) : (
          <span className="text-muted-foreground text-[10px] shrink-0">▼</span>
        )}
      </div>

      {open && !loading && (
        <div className="absolute top-full mt-1 left-0 z-50 min-w-full bg-card border border-primary rounded-lg shadow-lg max-h-[260px] overflow-y-auto py-1.5">
          {/* ALL */}
          <label className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
              className="accent-primary w-3 h-3"
            />
            ALL
          </label>

          {options.length === 0 ? (
            <div className="px-3 py-3 text-xs text-muted-foreground text-center">No options</div>
          ) : (
            options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(opt.value)}
                  onChange={() => toggleItem(opt.value)}
                  className="accent-primary w-3 h-3"
                />
                {opt.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── FilterBar ──────────────────────────────────────────────────────────────────
const FilterBar = ({ onApply, initialFilters }: FilterBarProps) => {
  const [env, setEnv] = useState(initialFilters?.env || "dev");
  const [quickRange, setQuickRange] = useState(initialFilters?.quickRange || "");

  // Helper to convert DD-MM-YYYY to YYYY-MM-DD for input[type=date]
  const toInputDate = (d?: string) => {
    if (!d) return "";
    const parts = d.split("-");
    if (parts.length !== 3) return d;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const [startDate, setStartDate] = useState(toInputDate(initialFilters?.startDate) || "2026-03-01");
  const [endDate, setEndDate] = useState(toInputDate(initialFilters?.endDate) || new Date().toISOString().split("T")[0]);

  const [tenantOptions, setTenantOptions] = useState<Option[]>([]);
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>(initialFilters?.tenants ? initialFilters.tenants.split(",") : []);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(initialFilters?.users ? initialFilters.users.split(",") : []);

  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  // ── fetchUsers helper ────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (currentEnv: string, domains: string[]) => {
    if (domains.length === 0) return;
    setUsersLoading(true);
    try {
      const data = await cachedFetch<string[]>(buildUserUrl(currentEnv, domains));
      setUserOptions(data.map((email) => ({ label: email, value: email })));
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // ── Bootstrap: fetch tenants + all-users IN PARALLEL on mount ───────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tenantData, userData] = await Promise.all([
          cachedFetch<Record<string, string>>(`${API_BASE}/api/tenants`),
          cachedFetch<string[]>(buildUserUrl(env, [])),
        ]);
        if (cancelled) return;
        setTenantOptions(Object.entries(tenantData).map(([label, value]) => ({ label, value })));
        setTenantsLoading(false);
        setUserOptions(userData.map((email) => ({ label: email, value: email })));
        setUsersLoading(false);
      } catch (err) {
        console.error("Bootstrap fetch failed:", err);
        if (!cancelled) { setTenantsLoading(false); setUsersLoading(false); }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-fetch users when env or tenant selection changes ──────────────────────
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) { skipFirst.current = false; return; }
    const domains = selectedTenants.length > 0
      ? selectedTenants
      : tenantOptions.map((t) => t.value);
    fetchUsers(env, domains);
  }, [env, selectedTenants]);

  // ── Quick range ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!quickRange || quickRange === "custom") return;
    const today = new Date();
    const start = new Date();
    if (quickRange === "1d") start.setDate(today.getDate() - 1);
    if (quickRange === "1w") start.setDate(today.getDate() - 7);
    if (quickRange === "1m") start.setMonth(today.getMonth() - 1);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, [quickRange]);

  // ── Apply ────────────────────────────────────────────────────────────────────
  const handleApply = () => {
    const fmt = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}-${m}-${y}`; };
    onApply({
      env,
      quickRange,
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      tenants: (selectedTenants.length ? selectedTenants : tenantOptions.map((t) => t.value)).join(","),
      users: (selectedUsers.length ? selectedUsers : userOptions.map((u) => u.value)).join(","),
    });
  };

  const datesDisabled = ["1d", "1w", "1m"].includes(quickRange);

  return (
    <div className="bg-card border-b border-border px-7 py-2.5 flex items-end gap-3 flex-wrap">

      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">Environment</span>
        <Select value={env} onValueChange={setEnv}>
          <SelectTrigger className="h-8 text-xs min-w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="dev">suw-dev</SelectItem>
            <SelectItem value="prod">suw-prod</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">Select Range</span>
        <Select value={quickRange} onValueChange={setQuickRange}>
          <SelectTrigger className="h-8 text-xs min-w-[140px]"><SelectValue placeholder="Custom" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="1d">Last 1 Day</SelectItem>
            <SelectItem value="1w">Last 1 Week</SelectItem>
            <SelectItem value="1m">Last 1 Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">Start Date</span>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
          disabled={datesDisabled} className="h-8 text-xs min-w-[140px]" />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">End Date</span>
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
          disabled={datesDisabled} className="h-8 text-xs min-w-[140px]" />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">Tenant</span>
        <MultiSelectDropdown
          options={tenantOptions}
          onChange={setSelectedTenants}
          selectedValues={selectedTenants}
          loading={tenantsLoading}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">User</span>
        <MultiSelectDropdown
          options={userOptions}
          onChange={setSelectedUsers}
          selectedValues={selectedUsers}
          loading={usersLoading}
        />
      </div>

      <Button
        size="sm"
        onClick={handleApply}
        disabled={tenantsLoading || usersLoading}
        className="text-[11px] tracking-wider uppercase font-semibold gap-1.5 self-end"
      >
        <Play className="h-3 w-3" /> Apply
      </Button>
    </div>
  );
};

export default FilterBar;