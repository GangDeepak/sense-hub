import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Play } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

interface FilterBarProps {
  onApply: (filters: {
    env: string;
    quickRange: string;
    startDate: string;
    endDate: string;
    tenants: string;
    users: string;
  }) => void;
}

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  domainFilters?: { label: string; domain: string }[];
  onChange: (selected: string[]) => void;
}

const MultiSelectDropdown = ({ options, domainFilters, onChange }: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allChecked, setAllChecked] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const toggleAll = (checked: boolean) => {
    setAllChecked(checked);
    if (checked) {
      setSelected(new Set());
      onChange([]);
    }
  };

  const toggleItem = (item: string) => {
    const next = new Set(selected);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setSelected(next);
    setAllChecked(next.size === 0);
    onChange(next.size === 0 ? [] : Array.from(next));
  };

  const toggleDomain = (domain: string) => {
    const domainUsers = options.filter((o) => o.endsWith(domain));
    const next = new Set(domainUsers);
    setSelected(next);
    setAllChecked(false);
    onChange(Array.from(next));
  };

  const displayText = allChecked || selected.size === 0
    ? "ALL"
    : selected.size === 1
      ? Array.from(selected)[0].split("@")[0]
      : `${selected.size} selected`;

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs cursor-pointer min-w-[180px] hover:border-primary transition-colors"
      >
        <span className="truncate">{displayText}</span>
        <span className="text-muted-foreground text-[10px]">▼</span>
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 min-w-full bg-card border border-primary rounded-lg shadow-lg max-h-[260px] overflow-y-auto py-1.5">
          {domainFilters && (
            <>
              <div className="px-3 py-1 text-[9px] tracking-wider text-primary uppercase font-bold">Quick Filters</div>
              <label className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer">
                <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} className="accent-primary w-3 h-3" />
                ALL
              </label>
              {domainFilters.map((df) => (
                <label key={df.domain} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!allChecked && options.filter((o) => o.endsWith(df.domain)).every((o) => selected.has(o))}
                    onChange={() => toggleDomain(df.domain)}
                    className="accent-primary w-3 h-3"
                  />
                  {df.label}
                </label>
              ))}
              <div className="h-px bg-border my-1" />
              <div className="px-3 py-1 text-[9px] tracking-wider text-primary uppercase font-bold">Individual</div>
            </>
          )}
          {!domainFilters && (
            <label className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer">
              <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} className="accent-primary w-3 h-3" />
              ALL
            </label>
          )}
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer">
              <input type="checkbox" checked={selected.has(opt)} onChange={() => toggleItem(opt)} className="accent-primary w-3 h-3" />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterBar = ({ onApply }: FilterBarProps) => {
  const [env, setEnv] = useState("dev");
  const [quickRange, setQuickRange] = useState("");
  const [startDate, setStartDate] = useState("2026-03-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [tenants, setTenants] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [tenantOptions, setTenantOptions] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/tenants`)
      .then((r) => r.json())
      .then((data) => setTenantOptions(Object.keys(data)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/users?env=${env}`)
      .then((r) => r.json())
      .then((data) => setUserOptions(data))
      .catch(console.error);
  }, [env]);

  const handleApply = () => {
    onApply({
      env,
      quickRange,
      startDate,
      endDate,
      tenants: selectedTenants.length ? selectedTenants.join(",") : "ALL",
      users: selectedUsers.length ? selectedUsers.join(",") : "ALL",
    });
  };

  const datesDisabled = quickRange === "1d" || quickRange === "1w" || quickRange === "1m";

  return (
    <div className="bg-card border-b border-border px-7 py-2.5 flex items-end gap-3 flex-wrap">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">Environment</span>
        <Select value={env} onValueChange={setEnv}>
          <SelectTrigger className="h-8 text-xs min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dev">suw-dev</SelectItem>
            <SelectItem value="prod">suw-prod</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">Select Range</span>
        <Select value={quickRange} onValueChange={setQuickRange}>
          <SelectTrigger className="h-8 text-xs min-w-[140px]">
            <SelectValue placeholder="Custom" />
          </SelectTrigger>
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
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={datesDisabled} className="h-8 text-xs min-w-[140px]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">End Date</span>
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={datesDisabled} className="h-8 text-xs min-w-[140px]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">Tenant</span>
        <MultiSelectDropdown label="Tenant" options={tenantOptions} onChange={setSelectedTenants} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">User</span>
        <MultiSelectDropdown
          label="User"
          options={userOptions}
          domainFilters={[
            { label: "@velocityrisk.com", domain: "@velocityrisk.com" },
            { label: "@bluepond.ai", domain: "@bluepond.ai" },
          ]}
          onChange={setSelectedUsers}
        />
      </div>
      <Button size="sm" onClick={handleApply} className="text-[11px] tracking-wider uppercase font-semibold gap-1.5 self-end">
        <Play className="h-3 w-3" /> Apply
      </Button>
    </div>
  );
};

export default FilterBar;
