"use client";
import React from "react";
import { Trash2 } from "lucide-react";

interface CategoriesSettingsProps {
  categories: any[];
  loadingCats: boolean;
  newCatName: string;
  setNewCatName: (name: string) => void;
  newCatColor: string;
  setNewCatColor: (color: string) => void;
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleDeleteCategory: (id: string) => void;
}

export function CategoriesSettings({
  categories,
  loadingCats,
  newCatName,
  setNewCatName,
  newCatColor,
  setNewCatColor,
  handleCreateCategorySubmit,
  handleDeleteCategory,
}: CategoriesSettingsProps) {
  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateCategorySubmit} className="flex gap-3 items-end">
        <div className="flex-1 text-input-val">
          <label className="block text-label-val uppercase text-muted mb-1">New Category Label</label>
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Design Sync, Urgent Review..."
            className="w-full h-9 px-3 border border-border bg-background text-foreground rounded-lg outline-none"
          />
        </div>
        <div>
          <label className="block text-label-val uppercase text-muted mb-1">Accent</label>
          <select
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="h-9 px-2 border border-border bg-background text-foreground rounded-lg outline-none text-caption"
          >
            <option value="#FF5A36">Coral Orange</option>
            <option value="#3e9b68">Green Forest</option>
            <option value="#ef6688">Pink Rose</option>
            <option value="#e49a3a">Amber Yellow</option>
          </select>
        </div>
        <button type="submit" className="btn-primary h-9 px-4 flex items-center justify-center shrink-0">
          Add Label
        </button>
      </form>

      <div className="border-t border-border pt-4 space-y-2">
        <h4 className="text-overline text-muted block mb-2">Existing Category Labels</h4>
        {loadingCats ? (
          <div className="text-caption font-semibold text-muted py-3">Loading labels...</div>
        ) : categories.length === 0 ? (
          <div className="text-caption font-semibold text-muted py-3">0 categories.</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <div key={c.id} className="p-2.5 border border-border rounded-xl bg-background flex items-center justify-between">
                <div className="flex items-center gap-2 text-body-sm font-bold">
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </div>
                <button onClick={() => handleDeleteCategory(c.id)} className="text-muted hover:text-danger transition">
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
