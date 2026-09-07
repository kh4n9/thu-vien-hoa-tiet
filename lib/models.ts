import mongoose from "mongoose";

// mongoose là CommonJS — default import để tương thích cả Node (type stripping) lẫn Next/Turbopack.
const { Schema, model, models } = mongoose;

export type ObjectId = mongoose.Types.ObjectId;

export const ROLE_VALUES = ["CUSTOMER", "ADMIN"] as const;
export const ORDER_STATUS_VALUES = ["PENDING", "PAID", "FAILED", "CANCELLED"] as const;

export type Role = (typeof ROLE_VALUES)[number];
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

// ===== Giao diện dữ liệu thô (không kèm _id / timestamps — mongoose tự thêm) =====
export interface UserBase {
  email: string;
  name: string | null;
  /** Ảnh đại diện từ OAuth (Google/GitHub…); tài khoản đăng ký thường để trống. */
  image: string | null;
  passwordHash: string;
  role: Role;
}

export interface CategoryBase {
  name: string;
  slug: string;
  description: string | null;
  order: number;
}

export interface ProductBase {
  slug: string;
  title: string;
  description: string;
  price: number;
  format: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  fileExt: string;
  imageKeys: string[];
  specs: Record<string, unknown> | null;
  license: string | null;
  isActive: boolean;
  category: ObjectId;
}

export interface OrderItemBase {
  product: ObjectId;
  title: string;
  price: number;
  /** True khi admin thu hồi quyền tải sản phẩm này (đơn cũ không có field này). */
  revoked?: boolean;
}

export interface OrderBase {
  code: string;
  user: ObjectId;
  status: OrderStatus;
  total: number;
  vnpTxnRef: string | null;
  paymentInfo: Record<string, string> | null;
  items: OrderItemBase[];
  paidAt: Date | null;
}

export interface DownloadRecordBase {
  user: ObjectId;
  product: ObjectId;
  order: ObjectId | null;
  ip: string | null;
}

// ===== Document (có _id + timestamps khi đọc từ DB) =====
export type UserDoc = mongoose.HydratedDocument<UserBase>;
export type CategoryDoc = mongoose.HydratedDocument<CategoryBase>;
export type ProductDoc = mongoose.HydratedDocument<ProductBase>;
export type OrderDoc = mongoose.HydratedDocument<OrderBase>;
export type DownloadRecordDoc = mongoose.HydratedDocument<DownloadRecordBase>;

// ===== Schemas =====
const userSchema = new Schema<UserBase>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: null },
    image: { type: String, default: null },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLE_VALUES, default: "CUSTOMER" },
  },
  { timestamps: true },
);

const categorySchema = new Schema<CategoryBase>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: false },
);

const productSchema = new Schema<ProductBase>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    format: { type: String, required: true },
    fileKey: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileExt: { type: String, required: true },
    imageKeys: { type: [String], default: [] },
    specs: { type: Schema.Types.Mixed, default: null },
    license: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true },
);
productSchema.index({ category: 1 });

const orderItemSchema = new Schema<OrderItemBase>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    revoked: { type: Boolean, default: false },
  },
  { _id: true },
);

const orderSchema = new Schema<OrderBase>(
  {
    code: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ORDER_STATUS_VALUES, default: "PENDING" },
    total: { type: Number, required: true },
    vnpTxnRef: { type: String, default: null },
    paymentInfo: { type: Schema.Types.Mixed, default: null },
    items: { type: [orderItemSchema], default: [] },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);
orderSchema.index({ user: 1, status: 1 });

const downloadRecordSchema = new Schema<DownloadRecordBase>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    ip: { type: String, default: null },
  },
  { timestamps: true },
);
downloadRecordSchema.index({ user: 1 });
downloadRecordSchema.index({ product: 1 });

// ===== Models (dùng lại nếu đã register — quan trọng với HMR) =====
export const User = models.User ?? model<UserBase>("User", userSchema);
export const Category = models.Category ?? model<CategoryBase>("Category", categorySchema);
export const Product = models.Product ?? model<ProductBase>("Product", productSchema);
export const Order = models.Order ?? model<OrderBase>("Order", orderSchema);
export const DownloadRecord =
  models.DownloadRecord ?? model<DownloadRecordBase>("DownloadRecord", downloadRecordSchema);

// ===== Helpers =====
/** Chuyển chuỗi id thành ObjectId an toàn (bỏ qua chuỗi không hợp lệ). */
export function toObjectId(id: string): ObjectId | null {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

/** Lọc mảng chuỗi id, chỉ giữ lại ObjectId hợp lệ. */
export function toObjectIds(ids: string[]): ObjectId[] {
  const out: ObjectId[] = [];
  for (const id of ids) {
    const oid = toObjectId(id);
    if (oid) out.push(oid);
  }
  return out;
}