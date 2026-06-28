export type RoleName = "CUSTOMER" | "SELLER" | "ADMIN";

export type SellerStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
export type BookStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
export type OrderStatus =
  | "CREATED"
  | "ACCEPTED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Role {
  id: number;
  name: RoleName;
}

export interface User {
  id: number;
  email: string;
  password?: string;
  roleId: number;
  createdAt: string;
}

export interface Customer {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface Seller {
  // Real backend uses a Mongo string `_id` (normalized into `id`); the mock
  // used numeric ids — hence `string | number`.
  id: string | number;
  _id?: string;
  userId: string | number;
  businessName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  status: SellerStatus;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  description: string;
  category: string;
  coverImage: string;
  status: BookStatus;
  tags: string[];
  createdAt: string;
}

export interface Listing {
  id: number;
  bookId: number;
  sellerId: number;
  price: number;
  mrp: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface ListingWithSeller extends Listing {
  seller?: Seller;
}

export interface BookWithListings extends Book {
  listings: ListingWithSeller[];
  minPrice?: number;
  maxMrp?: number;
}

export interface CartItem {
  listingId: number;
  bookId: number;
  sellerId: number;
  sellerName: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  quantity: number;
  stock: number;
}

/**
 * The authenticated identity returned by the NestJS backend.
 * NOTE: the real backend uses MongoDB string ids (e.g. "665f1a..."),
 * unlike the legacy mock json-server which used numeric ids.
 */
export interface AuthUser {
  userId: string;
  email: string;
  role: RoleName;
  name: string;
  customerId?: string;
  sellerId?: string;
  sellerStatus?: SellerStatus;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

// ───────────────────────── Auth / OTP contracts ─────────────────────────

/** Purpose discriminator the backend's OTP endpoints expect. */
export type OtpPurpose = "REGISTRATION" | "PASSWORD_RESET";

/** A pair of JWTs issued by the backend on login / register-verify. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Shape of `data.user` returned by login / verify-otp (REGISTRATION). */
export interface BackendAuthUser {
  userId: string;
  email: string;
  role: RoleName;
  name: string;
  customerId?: string;
  sellerId?: string;
  sellerStatus?: SellerStatus;
}

/** Full auth payload: tokens + user. */
export interface AuthResult extends AuthTokens {
  user: BackendAuthUser;
}

/** Standard success envelope wrapping every backend response. */
export interface ApiEnvelope<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

/** Standard error envelope the backend returns on failures. */
export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  message: string;
  details?: unknown;
  path: string;
  timestamp: string;
}



