"use client";

import { useSearchParams } from "next/navigation";
import { pageUI } from "@/ui-tokens";

import HeaderBar from "./boxes/HeaderBar";
import ConversationList from "./boxes/ConversationList";
import ChatDetail from "./boxes/ChatDetail";
import EmptyState from "./boxes/EmptyState";

export default function FacebookClient({
  conversations,
  tenant_id,
}: any) {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("conversation_id"); // 🔥 dùng URL

  return (
    <div className={pageUI.container}>
      
      {/* BOX 3 */}
      <HeaderBar />

      {/* CONTENT */}
      <div className="flex h-[calc(100vh-120px)]">

        {/* BOX 1 */}
        <div className="w-[320px] border-r border-neutral-200">
          <ConversationList 
		  initialData={conversations}
		  tenantId={tenant_id}
		  />
        </div>

        {/* BOX 2 */}
        <div className="flex-1">
          {!selectedId ? (
            <EmptyState />
          ) : (
            <ChatDetail conversationId={selectedId} />
          )}
        </div>

      </div>
    </div>
  );
}