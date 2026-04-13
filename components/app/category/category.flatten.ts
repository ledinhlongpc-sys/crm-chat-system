import { CategoryNode } from "./category.tree";

/* ================= TYPES ================= */
export type FlatCategoryOption = {
  id: string;
  label: string;
  is_leaf: boolean; // 👈 QUAN TRỌNG
};

/* ================= FLATTEN TREE ================= */
export function flattenCategoryTree(
  nodes: CategoryNode[],
  prefix = ""
): FlatCategoryOption[] {
  let result: FlatCategoryOption[] = [];

  nodes.forEach((node) => {
    const label = prefix
      ? `${prefix} / ${node.name}`
      : node.name;

    const isLeaf = node.children.length === 0;

    result.push({
      id: String(node.id),
      label,
      is_leaf: isLeaf,
    });

    if (node.children.length > 0) {
      result = result.concat(
        flattenCategoryTree(node.children, label)
      );
    }
  });

  return result;
}
