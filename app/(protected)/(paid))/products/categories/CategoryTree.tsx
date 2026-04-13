//// app/(protected)/(paid)/products/categories/CategoryTree.tsx

"use client";

import { useEffect, useState } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import StatusBadge from "@/components/app/status/StatusBadge";
import TableActions from "@/components/app/table/TableActions";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* =========================
   TYPES
========================= */
export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

export type CategoryNode = Category & {
  children: CategoryNode[];
};

/* =========================
   BUILD TREE
========================= */
export function buildCategoryTree(
  categories: Category[]
): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  categories.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  categories.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parent_id) {
      const parent = map.get(c.parent_id);
      parent ? parent.children.push(node) : roots.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortTree = (nodes: CategoryNode[]) => {
    nodes.sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    nodes.forEach((n) => sortTree(n.children));
  };

  sortTree(roots);
  return roots;
}

/* =========================
   COMPONENT
========================= */
export default function CategoryTree({
  tree,
  searchKeyword,
  onEdit,
  onAddChild,
  onDelete,
}: {
  tree: CategoryNode[];
  searchKeyword?: string;
  onEdit?: (c: Category) => void;
  onAddChild?: (c: Category) => void;
  onDelete?: (c: Category) => void;
}) {
  const keyword = searchKeyword?.trim().toLowerCase();

  /**
   * Mỗi level chỉ có 1 node được mở
   * key = level, value = categoryId
   */
  const [expandedByLevel, setExpandedByLevel] = useState<
    Record<number, string | null>
  >({});

  /* ===== AUTO EXPAND WHEN SEARCH ===== */
  useEffect(() => {
    if (!keyword) {
      setExpandedByLevel({});
      return;
    }

    const next: Record<number, string> = {};

    function dfs(node: CategoryNode, level: number): boolean {
      const selfMatch = node.name
        .toLowerCase()
        .includes(keyword);

      for (const child of node.children) {
        if (dfs(child, level + 1)) {
          next[level] = node.id;
          return true;
        }
      }

      if (selfMatch) {
        next[level] = node.id;
        return true;
      }

      return false;
    }

    tree.forEach((n) => dfs(n, 0));
    setExpandedByLevel(next);
  }, [keyword, tree]);

  function toggleNode(level: number, id: string) {
    setExpandedByLevel((prev) => ({
      ...prev,
      [level]: prev[level] === id ? null : id,
    }));
  }

  return (
    <tbody>
      {tree.map((node) => (
        <CategoryRow
          key={node.id}
          node={node}
          level={0}
          expandedByLevel={expandedByLevel}
          onToggle={toggleNode}
          keyword={keyword}
          onEdit={onEdit}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      ))}
    </tbody>
  );
}

/* =========================
   ROW
========================= */
function CategoryRow({
  node,
  level,
  expandedByLevel,
  onToggle,
  keyword,
  onEdit,
  onAddChild,
  onDelete,
}: {
  node: CategoryNode;
  level: number;
  expandedByLevel: Record<number, string | null>;
  onToggle: (level: number, id: string) => void;
  keyword?: string;
  onEdit?: (c: Category) => void;
  onAddChild?: (c: Category) => void;
  onDelete?: (c: Category) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedByLevel[level] === node.id;
  const isMatch =
    keyword &&
    node.name.toLowerCase().includes(keyword);

  return (
    <>
      <tr className="group border-b border-neutral-200 hover:bg-blue-50">
        <td className="px-4 py-3">
          <div
            className="flex items-center justify-between"
            style={{ paddingLeft: level * 24 }}
          >
            {/* LEFT */}
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() =>
                    onToggle(level, node.id)
                  }
                  className="rounded p-1 hover:bg-neutral-200"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              ) : (
                <span className="w-5" />
              )}

              {level === 0 ? (
                <Folder size={16} className="text-blue-600" />
              ) : (
                <FolderOpen
                  size={16}
                  className="text-neutral-700"
                />
              )}

              <span
                className={`text-sm ${
                  level === 0
                    ? "font-medium text-neutral-900"
                    : "text-neutral-700"
                } ${
                  isMatch
                    ? "bg-yellow-100 px-1 rounded"
                    : ""
                }`}
              >
                {node.name}
              </span>

              {node.is_active === false && (
                <StatusBadge status="inactive" />
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
              {onAddChild && (
                <SecondaryButton
                  onClick={() => onAddChild(node)}
                >
                  + Thêm con
                </SecondaryButton>
              )}

              {(onEdit || onDelete) && (
                <TableActions
                  onEdit={
                    onEdit ? () => onEdit(node) : undefined
                  }
                  onDelete={
                    onDelete
                      ? () => onDelete(node)
                      : undefined
                  }
                />
              )}
            </div>
          </div>
        </td>
      </tr>

      {hasChildren &&
        isExpanded &&
        node.children.map((c) => (
          <CategoryRow
            key={c.id}
            node={c}
            level={level + 1}
            expandedByLevel={expandedByLevel}
            onToggle={onToggle}
            keyword={keyword}
            onEdit={onEdit}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}
