import React, { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, LayoutGrid, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AnalysisRow {
  path: string;
  type: string;
  presence: string; // e.g. "5/5"
  examples: string[];
  isConsistent: boolean;
  isPresentInAll: boolean;
}

function getSmartType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length > 0) {
      const itemType = getSmartType(value[0]);
      return `Array of ${itemType === 'object' ? 'Objects' : itemType + 's'}`;
    }
    return 'Array (Empty)';
  }
  
  const type = typeof value;
  if (type === 'number') {
    return Number.isInteger(value) ? 'Integer' : 'Float';
  }
  
  if (type === 'string') {
    // Basic date regex for MM/DD/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return 'String (MM/DD/YYYY)';
    // ISO Date regex
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'String (ISO Date)';
    return 'String';
  }
  
  return type;
}

function collectAdvancedPaths(
  sources: { id: string; data: any }[],
  path: string = '',
  results: Record<string, { presence: Set<string>; types: Set<string>; examples: Set<any> }> = {}
): Record<string, { presence: Set<string>; types: Set<string>; examples: Set<any> }> {
  
  const allIds = sources.map(s => s.id);

  sources.forEach(source => {
    const rawData = source.data;
    // Always look inside 'data' key if it exists as per user request
    const data = (rawData && typeof rawData === 'object' && 'data' in rawData) ? rawData.data : rawData;

    if (!data || typeof data !== 'object') return;

    const traverse = (obj: any, currentPath: string) => {
      if (!obj || typeof obj !== 'object') return;

      Object.entries(obj).forEach(([key, val]) => {
        // Skip numeric keys at the root or within arrays to avoid "0.data" prefixes
        const isNumericKey = /^\d+$/.test(key);
        const fullPath = currentPath 
          ? (isNumericKey ? currentPath : `${currentPath}.${key}`)
          : (isNumericKey ? '' : key);
        
        if (fullPath) {
          if (!results[fullPath]) {
            results[fullPath] = { presence: new Set(), types: new Set(), examples: new Set() };
          }
          results[fullPath].presence.add(source.id);
          
          const type = getSmartType(val);
          results[fullPath].types.add(type);
          
          if (val !== undefined && val !== null && typeof val !== 'object') {
            if (results[fullPath].examples.size < 5) {
              results[fullPath].examples.add(val);
            }
          }
        }

        // Recurse into objects
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          traverse(val, fullPath);
        } 
        // Handle Arrays
        else if (Array.isArray(val) && val.length > 0) {
          const arrayPath = fullPath ? `${fullPath}[]` : '[]';
          
          if (!results[arrayPath]) {
            results[arrayPath] = { presence: new Set(), types: new Set(), examples: new Set() };
          }
          results[arrayPath].presence.add(source.id);
          
          // Sample first item for structure
          const firstItem = val[0];
          results[arrayPath].types.add(getSmartType(firstItem));

          if (typeof firstItem === 'object' && firstItem !== null) {
            // Flatten internal structure of array objects
            Object.entries(firstItem).forEach(([subKey, subVal]) => {
              const subPath = `${arrayPath}.${subKey}`;
              if (!results[subPath]) {
                results[subPath] = { presence: new Set(), types: new Set(), examples: new Set() };
              }
              results[subPath].presence.add(source.id);
              results[subPath].types.add(getSmartType(subVal));
              if (subVal !== null && typeof subVal !== 'object') {
                if (results[subPath].examples.size < 5) results[subPath].examples.add(subVal);
              }

              // Deep recursion for nested objects inside arrays
              if (subVal && typeof subVal === 'object' && !Array.isArray(subVal)) {
                traverse(subVal, subPath);
              }
            });
          }
        }
      });
    };

    traverse(data, path);
  });

  return results;
}

export function ComparisonView({ sources, endpoint, showOnlyDiffs, onDiffCountChange }: { 
  sources: { id: string; data: any }[];
  endpoint: string;
  showOnlyDiffs: boolean;
  onDiffCountChange: (count: number) => void;
}) {
  const analysis = useMemo(() => {
    const pathsMap = collectAdvancedPaths(sources);
    const totalIds = sources.length;

    return Object.entries(pathsMap).map(([path, data]) => {
      const typeList = Array.from(data.types);
      const examples = Array.from(data.examples).map(ex => 
        typeof ex === 'string' ? `"${ex}"` : String(ex)
      );

      return {
        path,
        type: typeList.length > 1 ? typeList.join(' or ') : (typeList[0] || 'Unknown'),
        presence: `${data.presence.size}/${totalIds}`,
        examples: examples,
        isPresentInAll: data.presence.size === totalIds,
        isConsistent: typeList.length <= 1
      };
    }).sort((a, b) => a.path.localeCompare(b.path));
  }, [sources]);

  const filteredAnalysis = useMemo(() => {
    if (!showOnlyDiffs) return analysis;
    return analysis.filter(row => !row.isPresentInAll || !row.isConsistent);
  }, [analysis, showOnlyDiffs]);

  const diffCount = useMemo(() => 
    analysis.filter(row => !row.isPresentInAll || !row.isConsistent).length
  , [analysis]);

  React.useEffect(() => {
    onDiffCountChange(diffCount);
  }, [diffCount, onDiffCountChange]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">

      <div className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border/40">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[30%]">Key Name</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[15%]">Data Type</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center w-[15%]">Presence</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[40%]">Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredAnalysis.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-teal-500 opacity-40" />
                      <p className="text-xs text-muted-foreground">All schemas are perfectly aligned across these transactions.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAnalysis.map((row) => (
                  <tr key={row.path} className={cn(
                    "hover:bg-secondary/10 transition-colors group",
                    (!row.isPresentInAll || !row.isConsistent) && "bg-rose-500/[0.02]"
                  )}>
                    <td className="px-4 py-3">
                      <code className="text-[11px] font-mono text-foreground break-all leading-tight font-semibold">
                        {row.path}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "text-[10px] font-medium",
                          row.isConsistent ? "text-muted-foreground" : "text-rose-500 font-bold"
                        )}>
                          {row.type}
                        </span>
                        {!row.isConsistent && <Badge variant="outline" className="text-[8px] h-3 py-0 border-rose-500/20 text-rose-500 w-fit">Type Mismatch</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={cn(
                          "text-[11px] font-mono font-bold",
                          row.isPresentInAll ? "text-teal-600" : "text-amber-600"
                        )}>
                          {row.presence}
                        </span>
                        {!row.isPresentInAll && <Badge variant="outline" className="text-[8px] h-3 py-0 border-amber-500/20 text-amber-500 uppercase">Missing Keys</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.examples.length > 0 ? (
                          row.examples.map((ex, i) => (
                            <span key={i} className="text-[10px] text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded border border-border/20 max-w-[200px] truncate">
                              {ex}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic opacity-50">No primitive values sampled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
