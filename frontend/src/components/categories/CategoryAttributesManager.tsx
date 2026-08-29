"use client";

import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  Tag,
  Type,
  Hash,
  ToggleLeft,
  List,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ProductAttributeService,
  ApiAttributeDefinition,
  AttributeInputType,
} from "@/services/product-attribute.service";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INPUT_TYPE_META: Record<
  AttributeInputType,
  { label: string; icon: React.ReactNode; description: string }
> = {
  SELECT: {
    label: "Dropdown (Select)",
    icon: <List className="h-4 w-4" />,
    description: "A pre-defined list of options (e.g. Colors, Shapes)",
  },
  TEXT: {
    label: "Free Text",
    icon: <Type className="h-4 w-4" />,
    description: "Any text value (e.g. Model Number, Notes)",
  },
  NUMBER: {
    label: "Number",
    icon: <Hash className="h-4 w-4" />,
    description: "A numeric value (e.g. Frame Size, Bridge Width)",
  },
  BOOLEAN: {
    label: "Yes / No",
    icon: <ToggleLeft className="h-4 w-4" />,
    description: "A simple true/false toggle",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent: Option Tag Input (for SELECT attributes)
// ─────────────────────────────────────────────────────────────────────────────

interface OptionTagInputProps {
  definitionId: number;
  existingOptions: Array<{ id: number; value: string }>;
  onOptionAdded: (newOption: { id: number; value: string }) => void;
  onOptionDeleted: (optionId: number) => void;
}

function OptionTagInput({ definitionId, existingOptions, onOptionAdded, onOptionDeleted }: OptionTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddOption = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const isDuplicate = existingOptions.some(
      (o) => o.value.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setError(`"${trimmed}" already exists.`);
      return;
    }
    setIsAdding(true);
    setError(null);
    try {
      const newOpt = await ProductAttributeService.createAttributeOption(definitionId, trimmed);
      onOptionAdded(newOpt);
      setInputValue("");
    } catch {
      setError("Failed to add option.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleDeleteOption = async (opt: { id: number; value: string }) => {
    if (!confirm(`Delete option "${opt.value}"?`)) return;
    try {
      await ProductAttributeService.deleteAttributeOption(opt.id);
      onOptionDeleted(opt.id);
    } catch {
      setError("Failed to delete option.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {existingOptions.length === 0 && (
          <span className="text-xs text-muted-foreground italic">
            No options yet — type below and press Enter to add
          </span>
        )}
        {existingOptions.map((opt) => (
          <Badge key={opt.id} variant="secondary" className="text-xs h-6 pr-1 gap-1 flex items-center">
            {opt.value}
            <button
              type="button"
              onClick={() => handleDeleteOption(opt)}
              className="rounded-full hover:bg-muted-foreground/20 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder='Type an option (e.g. "Black") and press Enter'
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
          disabled={isAdding}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          disabled={isAdding || !inputValue.trim()}
          className="shrink-0"
        >
          {isAdding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Add
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent: Attribute Row (expandable)
// ─────────────────────────────────────────────────────────────────────────────

interface AttributeRowProps {
  definition: ApiAttributeDefinition;
  onDelete: (id: number) => void;
  onOptionAdded: (defId: number, newOption: { id: number; value: string }) => void;
  onOptionDeleted: (defId: number, optionId: number) => void;
}

function AttributeRow({ definition, onDelete, onOptionAdded, onOptionDeleted }: AttributeRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const meta = INPUT_TYPE_META[definition.inputType];

  const handleDelete = async () => {
    if (!confirm(`Delete the "${definition.label}" attribute and all its options?`)) return;
    setIsDeleting(true);
    try {
      await ProductAttributeService.deleteAttributeDefinition(definition.id);
      onDelete(definition.id);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 flex-1 text-left min-w-0"
        >
          <span className="text-muted-foreground shrink-0">{meta.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{definition.label}</span>
              {definition.isRequired && (
                <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Required</Badge>
              )}
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
                {definition.name}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {meta.label}
              {definition.inputType === "SELECT" && (
                <> · {definition.options.length} option{definition.options.length !== 1 ? "s" : ""}</>
              )}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Expanded options panel */}
      {isExpanded && definition.inputType === "SELECT" && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Options
          </Label>
          <OptionTagInput
            definitionId={definition.id}
            existingOptions={definition.options}
            onOptionAdded={(opt) => onOptionAdded(definition.id, opt)}
            onOptionDeleted={(optId) => onOptionDeleted(definition.id, optId)}
          />
        </div>
      )}

      {isExpanded && definition.inputType !== "SELECT" && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {meta.description} — no predefined options needed.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent: Add Attribute Dialog
// ─────────────────────────────────────────────────────────────────────────────

interface AddAttributeDialogProps {
  categoryId: number;
  existingCount: number;
  onCreated: (def: ApiAttributeDefinition) => void;
}

function AddAttributeDialog({ categoryId, existingCount, onCreated }: AddAttributeDialogProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [inputType, setInputType] = useState<AttributeInputType>("SELECT");
  const [isRequired, setIsRequired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-derive camelCase `name` from the human-readable `label`
  const derivedName = label
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((word, i) =>
      i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");

  const resetForm = () => {
    setLabel("");
    setInputType("SELECT");
    setIsRequired(false);
    setError(null);
  };

  const handleCreate = async () => {
    if (!label.trim() || !derivedName) {
      setError("Please enter an attribute label.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const created = await ProductAttributeService.createAttributeDefinition({
        categoryId,
        name: derivedName,
        label: label.trim(),
        inputType,
        isRequired,
        displayOrder: existingCount,
      });
      onCreated({ ...created, options: [] });
      resetForm();
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to create attribute.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Attribute
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Attribute</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="attr-label">
              Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="attr-label"
              placeholder='e.g. "Frame Color"'
              value={label}
              onChange={(e) => { setLabel(e.target.value); setError(null); }}
            />
            {derivedName && (
              <p className="text-xs text-muted-foreground">
                Internal key:{" "}
                <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                  {derivedName}
                </code>
              </p>
            )}
          </div>

          {/* Input Type */}
          <div className="space-y-1.5">
            <Label>Input Type</Label>
            <Select
              value={inputType}
              onValueChange={(v) => setInputType(v as AttributeInputType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(INPUT_TYPE_META) as Array<[AttributeInputType, typeof INPUT_TYPE_META[AttributeInputType]]>).map(
                  ([type, meta]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        {meta.icon}
                        <span className="font-medium">{meta.label}</span>
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {INPUT_TYPE_META[inputType].description}
            </p>
          </div>

          {/* Required toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Required Field</p>
              <p className="text-xs text-muted-foreground">
                Products must fill this attribute to save
              </p>
            </div>
            <Switch checked={isRequired} onCheckedChange={setIsRequired} />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => { setOpen(false); resetForm(); }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Attribute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export: CategoryAttributesManager
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryAttributesManagerProps {
  categoryId: number;
  categoryName: string;
}

export function CategoryAttributesManager({
  categoryId,
  categoryName,
}: CategoryAttributesManagerProps) {
  const [definitions, setDefinitions] = useState<ApiAttributeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadAttributes() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ProductAttributeService.getAttributesByCategory(categoryId);
        if (mounted) setDefinitions(data);
      } catch {
        if (mounted) setError("Failed to load attributes.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadAttributes();
    return () => {
      mounted = false;
    };
  }, [categoryId]);

  const handleCreated = (def: ApiAttributeDefinition) => {
    setDefinitions((prev) => [...prev, def]);
  };

  const handleDeleted = (id: number) => {
    setDefinitions((prev) => prev.filter((d) => d.id !== id));
  };

  const handleOptionAdded = (defId: number, newOpt: { id: number; value: string }) => {
    setDefinitions((prev) =>
      prev.map((d) =>
        d.id === defId ? { ...d, options: [...d.options, { ...newOpt, attributeDefinitionId: defId, isActive: true }] } : d
      )
    );
  };

  const handleOptionDeleted = (defId: number, optionId: number) => {
    setDefinitions((prev) =>
      prev.map((d) =>
        d.id === defId ? { ...d, options: d.options.filter(o => o.id !== optionId) } : d
      )
    );
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6">
      {/* Section header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Attribute Schema</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Define the filters and properties that products in{" "}
            <span className="font-medium text-foreground">{categoryName}</span> will have.
            These drive the product form fields and inventory filtering.
          </p>
        </div>
        <AddAttributeDialog
          categoryId={categoryId}
          existingCount={definitions.length}
          onCreated={handleCreated}
        />
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading attributes…</span>
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : definitions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-10 text-center">
          <Tag className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">No attributes defined yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click <strong>Add Attribute</strong> to define properties like Color, Shape, or Brand.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {definitions.map((def) => (
            <AttributeRow
              key={def.id}
              definition={def}
              onDelete={handleDeleted}
              onOptionAdded={handleOptionAdded}
              onOptionDeleted={handleOptionDeleted}
            />
          ))}
        </div>
      )}

      {/* Footer summary */}
      {definitions.length > 0 && (
        <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
          <span>{definitions.length} attribute{definitions.length !== 1 ? "s" : ""} defined</span>
          <span>·</span>
          <span>
            {definitions.filter((d) => d.isRequired).length} required
          </span>
          <span>·</span>
          <span>
            {definitions.filter((d) => d.inputType === "SELECT").length} with dropdown options
          </span>
        </div>
      )}
    </div>
  );
}
