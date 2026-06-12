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
  id: number;
  userId: number;
  businessName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  status: SellerStatus;
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

export interface AuthUser {
  userId: number;
  email: string;
  role: RoleName;
  name: string;
  customerId?: number;
  sellerId?: number;
  sellerStatus?: SellerStatus;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}



