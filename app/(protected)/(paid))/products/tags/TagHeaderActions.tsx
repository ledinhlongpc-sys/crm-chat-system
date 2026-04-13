// ..(paid))/products/tags/TagHeaderActions

"use client";

import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";

export default function TagHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      {/* Chờ Link mới */}
     
      {/* THÊM TAGS */}
      <PrimaryLinkButton href="tags/create">
        + Thêm tags
      </PrimaryLinkButton>
    </div>
  );
}
