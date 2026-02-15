"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  createCategory,
  updateCategory,
  reorderCategories,
  toggleCategoryActive,
} from "@/app/actions/admin-actions";
import { slugify } from "@/lib/utils/slugify";
import { Category } from "@/types";

interface CategoriesClientProps {
  initialCategories: Category[];
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
}

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  color: "#5D4037",
  display_order: 0,
};

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: categories.length });
    setError("");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "",
      color: cat.color || "#5D4037",
      display_order: cat.display_order,
    });
    setError("");
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editingId ? f.slug : slugify(name),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");

    let result;
    if (editingId) {
      result = await updateCategory(editingId, {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        icon: form.icon || undefined,
        color: form.color || undefined,
        display_order: form.display_order,
      });
    } else {
      result = await createCategory({
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        icon: form.icon || undefined,
        color: form.color || undefined,
        display_order: form.display_order,
      });
    }

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowModal(false);
    router.refresh();
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...categories];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setCategories(newOrder);
    await reorderCategories(newOrder.map((c) => c.id));
  };

  const handleMoveDown = async (index: number) => {
    if (index === categories.length - 1) return;
    const newOrder = [...categories];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setCategories(newOrder);
    await reorderCategories(newOrder.map((c) => c.id));
  };

  const handleToggleActive = async (catId: number) => {
    await toggleCategoryActive(catId);
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, is_active: !c.is_active } : c))
    );
  };

  return (
    <>
      <div className="mt-4 flex justify-end">
        <Button onClick={openCreate}>Add Category</Button>
      </div>

      <div className="mt-4 space-y-2">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className={`flex items-center gap-4 rounded-lg border bg-white p-4 ${
              cat.is_active ? "border-light-stone" : "border-red-200 bg-red-50/20"
            }`}
          >
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="rounded p-0.5 text-dark-text/30 transition-colors hover:bg-light-stone hover:text-dark-text disabled:opacity-20"
                aria-label="Move up"
              >
                <ChevronUpIcon />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === categories.length - 1}
                className="rounded p-0.5 text-dark-text/30 transition-colors hover:bg-light-stone hover:text-dark-text disabled:opacity-20"
                aria-label="Move down"
              >
                <ChevronDownIcon />
              </button>
            </div>

            <span className="text-xl">{cat.icon || "📁"}</span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-dark-text">{cat.name}</p>
                {!cat.is_active && <Badge color="#dc2626">Inactive</Badge>}
              </div>
              <p className="text-xs text-dark-text/40">
                /{cat.slug} &middot; {cat.thread_count} threads &middot;{" "}
                {cat.post_count} posts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleActive(cat.id)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  cat.is_active ? "bg-olive-green" : "bg-dark-text/20"
                }`}
                aria-label={cat.is_active ? "Deactivate" : "Activate"}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    cat.is_active ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
              <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Category" : "Add Category"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-dark-text/70">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-light-stone px-3 py-2 text-sm text-dark-text focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-dark-text/70">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full rounded-lg border border-light-stone px-3 py-2 text-sm text-dark-text focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-dark-text/70">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-light-stone px-3 py-2 text-sm text-dark-text focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-text/70">
                Icon (emoji)
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🏛️"
                className="w-full rounded-lg border border-light-stone px-3 py-2 text-sm text-dark-text focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-text/70">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="h-9 w-12 cursor-pointer rounded border border-light-stone"
                />
                <span className="text-xs text-dark-text/40">{form.color}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={saving}>
              {editingId ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function ChevronUpIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
