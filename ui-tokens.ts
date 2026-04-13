/**
 * UI TOKENS – LONGTHU CRM
 * --------------------------------------------------
 * 🔒 NGUỒN SỰ THẬT DUY NHẤT CHO UI
 * - Không hardcode class trong page
 * - Component chỉ đọc token
 * - Mọi thay đổi UI → sửa ở đây
 */

/* ==================================================
   PAGE LAYOUT
================================================== */

export const pageUI = {
  wrapper: "min-h-screen bg-neutral-150",

  /** 👈 dùng cho header con, form, card */
   contentWide:
  "px-8 pt-2 pb-12 w-full max-w-full space-y-4",

  /** 👈 chỉ cho table + pagination */
  contentWideTable:
    "px-4 pt-0 pb-12 w-full space-y-4",

  contentNarrow:
    "px-6 py-4 max-w-[1400px] mx-auto space-y-4",
};

/* ==================================================
   PAGE HEADER
================================================== */



export const pageHeaderUI = {
  /** Page title – 16px */
  title:
    "text-base font-semibold leading-6 text-neutral-900",

  /** Page description */
  description:
    "text-xs leading-4 text-neutral-500",
};



/* ==================================================
   CARD / FORMBOX
================================================== */

export const cardUI = {
  /** Card container lớp bọc toàn trang */
  base:
    "bg-white border-2 border-neutral-300 rounded-lg",

 /** Card body – chỉ là container, tạo khoảng thở bên trong */
  body:
    `
    px-4 py-3
    `,
     /** Card header – đóng vai trò H2 nội dung */
  header:
    `
    px-4 py-4
    bg-neutral-50
    border-b border-neutral-200
    rounded-t-xl
    `,
 footer: `
    px-4 py-3
    border-t border-neutral-200
    flex items-center justify-end gap-2
  `,
  /** Card title – giữ size, header mạnh lên là tự nổi */
  title:
    "text-base font-medium leading-6 text-neutral-800",

  /** Card description */
  description:
    "mt-1 text-xs leading-4 text-neutral-500",
};



/* ==================================================
   FORM GROUP
================================================== */

export const formGroupUI = {
  wrapper: "space-y-1.5",

  /** Label – 14px */
  label:
    "text-sm font-medium leading-5 text-neutral-700",

  required: "text-red-500 ml-1",

  /** Hint – 12px */
  help:
    "text-xs leading-4 text-neutral-500",

  error:
    "text-xs leading-4 text-red-500",
};

/* ==================================================
   TYPOGRAPHY SYSTEM
================================================== */

export const textUI = {
  /** Page title – 16px */
  pageTitle:
    "text-base font-semibold leading-6 text-neutral-900",

  /** Section / card title – 16px */
  cardTitle:
    "text-base font-medium leading-6 text-neutral-800",

  /** 👇 THÊM */
  title:
    "text-base font-medium leading-6 text-neutral-800",

  /** 👇 THÊM */
  label:
    "text-sm leading-5 text-neutral-500",

  /** Body text – 14px */
  body:
    "text-sm leading-5 text-neutral-700",

  /** Body strong – 14px */
  bodyStrong:
    "text-sm font-medium leading-5 text-neutral-700",

  /** Link */
  link:
    "text-base leading-6 text-blue-600",

  /** Hint – 12px */
  hint:
    "text-xs leading-4 text-neutral-500",
  subtle:
    "text-sm leading-5 text-neutral-500",
	 caption:
    "text-xs leading-4 text-neutral-500",

  muted:
  "text-sm leading-5 text-neutral-500",
};

/**
 * 🔒 RULE:
 * - font-semibold CHỈ DÙNG cho:
 *   + Page title
 *   + Primary action button
 */

/* ==================================================
   TABLE SYSTEM
================================================== */

export const actionBarUI = {
  wrapper:
    "px-0 py-0 flex items-center justify-between",
};;

export const tableTopUI = {
  wrapper:
    "px-0 py-2 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between rounded-t-xl",
};


export const tableUI = {
  	
 container:
"bg-white border border-neutral-200 rounded-lg overflow-hidden",
   /** Header row – 16px */
 headerRow:
"bg-neutral-50 border-b border-neutral-200",

headerCell:
  "px-3 py-3 text-base font-medium text-neutral-700 align-middle",

row:
"border-b border-neutral-100 transition-colors hover:bg-blue-50",

cell:
  "px-3 py-3 text-sm leading-6 font-normal text-neutral-800 align-middle",
	
   rowActive:
    "bg-blue-100", // 👈 GIỐNG hover	

  /** Body cell – 14px */

  align: {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  },
};

/**
 * 🔒 TABLE RULE:
 * - Header: 16px
 * - Body: 14px
 * - Padding: px-4 py-3
 * - KHÔNG dùng font-semibold trong table
 */

/* ==================================================
   TABLE STATES
================================================== */

export const tableStateUI = {
  empty:
    "px-6 py-10 text-sm leading-5 text-center text-neutral-500",

  skeletonCell:
    "h-4 bg-neutral-200 rounded animate-pulse",
};

/* ==================================================
   FILTER / SEARCH
================================================== */

export const filterUI = {
  group: "space-y-1.5",
};

/* ==================================================
   DISABLED
================================================== */

export const badgeUI = {
  base:
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
  primary: "bg-blue-100 text-blue-700",
   neutral: "bg-neutral-100 text-neutral-700",
   success: "bg-green-100 text-green-700",
   
  type: {
    feedback: "bg-blue-100 text-blue-700",
    bug: "bg-red-100 text-red-700",
    request: "bg-green-100 text-green-700",
  },

  priority: {
    high: "bg-red-50 text-red-600",
    normal: "bg-neutral-100 text-neutral-700",
    low: "bg-neutral-50 text-neutral-500",
  },

  status: {
    open: "bg-yellow-100 text-yellow-700",
    replied: "bg-blue-100 text-blue-700",
    closed: "bg-neutral-200 text-neutral-600",
  },
  /* ✅ NEW – MONEY FLOW */
  money: {
    in: "bg-green-100 text-green-700",  // Thu
    out: "bg-red-100 text-red-700",     // Chi
  },
   invoiceType: {
    expense: "bg-red-100 text-red-700",
    purchase: "bg-blue-100 text-blue-700",
    asset: "bg-purple-100 text-purple-700",
	sale: "bg-green-100 text-green-700",    
  service: "bg-amber-100 text-amber-700", 
  },
   vat: {
    yes: "bg-green-100 text-green-700",
    no: "bg-neutral-100 text-neutral-500",
  },
};


export const disabledUI = {
  base:
     "w-full h-10 bg-neutral-100 text-neutral-500 px-3 rounded-md cursor-not-allowed",
};
// ui-tokens/buttonUI.ts
export const buttonUI = {
  base: `
    inline-flex items-center justify-center gap-2
    rounded-md
    transition
    font-medium
    disabled:opacity-60
    disabled:cursor-not-allowed
  `,

  size: {
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm",
  },
  back: `
  inline-flex items-center justify-center gap-2
  rounded-md
  bg-white
  border border-neutral-300
  text-neutral-800
  shadow-sm
  transition
  font-medium
  disabled:opacity-60
  disabled:cursor-not-allowed
`,
  

  primary: `
  bg-white
  text-blue-600
  border border-blue-600
  hover:bg-blue-50
  hover:text-blue-700
  hover:border-blue-700
  active:bg-blue-100
`,

  secondary: `
  bg-white
  text-amber-600
  border border-amber-600
  hover:bg-amber-50
  hover:border-amber-600
  active:bg-amber-100
`,

  danger: `
bg-white
text-red-600
border border-red-600
hover:bg-red-50
hover:text-red-700
hover:border-red-700
active:bg-red-100
`,


  link: `
    text-blue-600
    hover:text-blue-700
    underline-offset-2
    hover:underline
    bg-transparent
    border-none
    shadow-none
    p-0
  `,
};
/*   INPUT / TEXTFIELD
================================================== */

export const inputUI = {
  base: `
    w-full
    h-10                       /* 👈 QUAN TRỌNG */
    rounded-md
    border border-neutral-300   /* 👈 sẽ chỉnh màu ở phần 2 */
    bg-white
    px-3
    text-sm leading-5 text-neutral-800
    placeholder:text-neutral-400
    outline-none
    focus:ring-2 focus:ring-blue-100
    focus:border-blue-500
  `,

  disabled: `
    bg-neutral-100
    text-neutral-500
    cursor-not-allowed
  `,

  error: `
    border-red-400
    focus:ring-red-100
    focus:border-red-500
  `,
};

export const purchaseUI = {
  productCell: {
    wrapper: "flex flex-col gap-1",
    name: "text-base font-medium text-neutral-900 leading-6",
    sku: "text-sm text-blue-600 leading-5",
  },

  imageBox:
    "h-12 w-12 rounded border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center",

  emptyState: {
    wrapper: "py-14 flex flex-col items-center justify-center text-center",
    iconWrap: "h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center",
    text: "mt-3 text-sm text-neutral-500",
  },
  
};
export const productImageUI = {
  base: "rounded-md border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center",
  size: {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-14 w-14",
    xl: "h-16 w-16",
  },
};

export const infoUI = {
  /** Danh sách info */
  list: "space-y-3",

  /** 1 dòng info: Label | : | Value */
  row:
  "grid grid-cols-[140px_12px_1fr] items-start py-2",

  /** Label */
  label:
    "text-sm leading-5 text-neutral-500",

  /** Colon */
  colon:
    "text-sm leading-5 text-neutral-400",

  /** Value */
  value:
    "text-sm leading-5 text-neutral-800",

  /** Value strong (dòng quan trọng) */
  valueStrong:
    "text-sm font-medium leading-5 text-neutral-800",
};

export const variantRowUI = {
  base: `
    w-full
    grid grid-cols-[20px_40px_1fr]
    items-start
    gap-3
    px-3
    py-2
    rounded-md
    text-left
    transition
  `,
  hover: "hover:bg-neutral-50",
  active: `
    bg-blue-50
    ring-1 ring-blue-200
  `,
  image: `
  h-10 w-10
  rounded
  border
  bg-white
  flex items-center justify-center
  overflow-hidden
`,
  name: "text-sm font-medium text-neutral-900",
  meta: "text-xs text-neutral-500",
};
/* ================= SUPPORT / CHAT ================= */

export const supportUI = {
  pageWrapper: "max-w-4xl mx-auto px-6 pt-4 pb-32 space-y-6",

  backLink: "text-sm text-blue-600 hover:underline",

  ticketCard:
    "rounded-xl border bg-white p-5 shadow-sm space-y-2",
	
   ticketTitle:
    "text-lg font-semibold leading-7 text-neutral-900",


  badgePrimary:
    "rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-medium",

  badgeNeutral:
    "rounded-full bg-neutral-100 text-neutral-700 px-3 py-1 text-xs",

  ticketMeta: "text-sm text-neutral-600",

  messageList: "space-y-4",

  messageRow: "flex gap-3",

  avatarUser:
    "h-8 w-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-semibold",

  avatarAdmin:
    "h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold",

  bubbleUser:
    "max-w-[70%] rounded-xl bg-neutral-100 text-neutral-800 px-4 py-3 text-sm",

  bubbleAdmin:
    "max-w-[70%] rounded-xl bg-blue-50 text-blue-900 px-4 py-3 text-sm",

  bubbleTime: "mt-2 text-xs text-neutral-500",

  attachmentBtn:
    "flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs text-blue-600 hover:bg-blue-50",

  replyBar:
    "fixed bottom-0 left-64 right-0 bg-white border-t z-50",

  replyBoxWrapper: "px-6 py-4",

  replyBoxInner: "max-w-[1200px] mx-auto space-y-2",

  textarea:
    "w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500",

  sendBtn:
    "rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60",

  imageModal:
    "fixed inset-0 z-[100] bg-black/70 flex items-center justify-center",

  imageModalInner:
    "relative max-w-[90vw] max-h-[90vh]",

  imageModalClose:
    "absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white shadow flex items-center justify-center",
};
export const textareaUI = {
  base: `
    ${inputUI.base}
    min-h-[96px]
    resize-y
  `,
};