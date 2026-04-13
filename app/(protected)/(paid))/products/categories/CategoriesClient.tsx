// app/(protected)/(paid)/products/create/CategoriesClient.tsx

"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Search, X } from "lucide-react";
import PageHeader from "@/components/app/header/PageHeader";
import CategoriesHeaderActions from "./CategoriesHeaderActions";
import TableContainer from "@/components/app/table/TableContainer";
import CategoryTree, { buildCategoryTree, type Category } from "./CategoryTree";
import CategoryModal from "./CategoryModal";
import ConfirmModal from "@/components/app/modal/ConfirmModal";
import { textUI, pageUI } from "@/ui-tokens";
import EmptyState from "@/components/app/empty-state/EmptyState";
/* ================= TYPES ================= */
type Props = {
  categories: Category[];
  triggerRootCreate?: boolean;
  onRootCreateHandled?: () => void;
};

export default function CategoriesClient({
  categories,
  triggerRootCreate,
  onRootCreateHandled,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ====== AUTO OPEN ROOT CREATE MODAL IF TRIGGERED ====== */
  useEffect(() => {
    if (triggerRootCreate) {
      openCreateModal();
      onRootCreateHandled?.();
    }
  }, [triggerRootCreate]);

  /* ====== FILTER CATEGORIES ====== */
  const filteredCategories = useMemo(() => {
    if (!q.trim()) return categories;

    const keyword = q.toLowerCase();
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));

    const result = new Map<string, Category>();

    for (const c of categories) {
      if (c.name.toLowerCase().includes(keyword)) {
        let current: Category | undefined = c;
        while (current) {
          result.set(current.id, current);
          current = current.parent_id ? map.get(current.parent_id) : undefined;
        }
      }
    }

    return Array.from(result.values());
  }, [categories, q]);

  const treeData = useMemo(() => buildCategoryTree(filteredCategories), [filteredCategories]);

  /* ====== MODAL HANDLERS ====== */
  function openCreateModal(parent?: Category) {
    const siblings = parent
      ? categories.filter((c) => c.parent_id === parent.id)
      : categories.filter((c) => !c.parent_id);

    const nextOrder = siblings.length > 0 ? Math.max(...siblings.map((c) => c.sort_order)) + 1 : 0;

    setEditingCategory({
      id: "",
      name: "",
      parent_id: parent?.id ?? null,
      sort_order: nextOrder,
      is_active: true,
    });
    setOpenModal(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setOpenModal(true);
  }

  function handleDelete(category: Category) {
    const hasChildren = categories.some((c) => c.parent_id === category.id);
    if (hasChildren) {
      toast.error("Không thể xoá danh mục đang có danh mục con");
      return;
    }
    setDeleteTarget(category);
  }

  async function handleSubmitCategory(data: {
    id?: string;
    name: string;
    parent_id: string | null;
    sort_order: number;
    is_active: boolean;
  }) {
    if (saving) return;

    const isEdit = Boolean(data.id);
    const url = isEdit
      ? `/api/products/categories/${data.id}`
      : "/api/products/categories";

    try {
      setSaving(true);
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.error || "Lỗi thao tác");

      toast.success(isEdit ? "Đã cập nhật danh mục" : "Đã tạo danh mục");
      setOpenModal(false);
      setEditingCategory(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/products/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.error || "Không thể xoá");

      toast.success("Đã xoá danh mục");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Xoá thất bại");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
	
	<PageHeader
        title="Danh mục sản phẩm"
        description="Quản lý danh mục sản phẩm theo dạng cây"
        right={<CategoriesHeaderActions onCreateRoot={() => openCreateModal()} />}
      />
      {/* ===== SEARCH BAR ===== */}
      <div className="border-b bg-neutral-50">
        <div className={pageUI.contentWide}>
          <div className="relative w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên danh mục..."
              className={`
                h-10 w-full rounded-md border border-neutral-300 bg-white
                pl-10 pr-9 outline-none focus:border-blue-500
                focus:ring-2 focus:ring-blue-100
                ${textUI.body}
              `}
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== TABLE CONTENT ===== */}
      {treeData.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <span className={textUI.hint}>Không có danh mục phù hợp.</span>
        </div>
      ) : (
        <TableContainer>
          <CategoryTree
            tree={treeData}
            searchKeyword={q}
            onAddChild={openCreateModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </TableContainer>
      )}

      {/* ===== MODALS ===== */}
      <CategoryModal
        open={openModal}
        onClose={() => {
          if (saving) return;
          setOpenModal(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmitCategory}
        categories={categories}
        editingCategory={editingCategory}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa danh mục"
        description={`Anh chắc chắn muốn xóa danh mục "${deleteTarget?.name}"?`}
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        danger
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </>
  );
}
