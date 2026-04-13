import { Category } from "./category.types";

export type CategoryNode = Category & {
  children: CategoryNode[];
};

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

  const sort = (nodes: CategoryNode[]) => {
    nodes.sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    nodes.forEach((n) => sort(n.children));
  };

  sort(roots);
  return roots;
}
