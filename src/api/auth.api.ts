import { api } from "./client";
import type { AuthUser, Customer, Seller, User } from "@/types";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const ROLE_MAP: Record<number, "CUSTOMER" | "SELLER" | "ADMIN"> = {
  1: "CUSTOMER",
  2: "SELLER",
  3: "ADMIN",
};

export const authApi = {
  /** Email must be unique (PDF validation rule) */
  async checkEmailExists(email: string): Promise<boolean> {
    const { data } = await api.get<User[]>("/users", {
      params: { email: email.toLowerCase() },
    });
    return data.length > 0;
  },

  async registerCustomer(payload: RegisterPayload): Promise<AuthUser> {
    const exists = await this.checkEmailExists(payload.email);
    if (exists) {
      throw new Error("Email already registered. Please login instead.");
    }

    const { data: user } = await api.post<User>("/users", {
      email: payload.email.toLowerCase(),
      password: payload.password,
      roleId: 1,
      createdAt: new Date().toISOString(),
    });

    const { data: customer } = await api.post<Customer>("/customers", {
      userId: user.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      createdAt: new Date().toISOString(),
    });

    // create an empty cart for the new customer
    await api.post("/carts", {
      customerId: customer.id,
      createdAt: new Date().toISOString(),
    });

    return {
      userId: user.id,
      email: user.email,
      role: "CUSTOMER",
      name: `${customer.firstName} ${customer.lastName}`,
      customerId: customer.id,
    };
  },

  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data: users } = await api.get<User[]>("/users", {
      params: { email: payload.email.toLowerCase() },
    });

    const user = users[0];
    if (!user || user.password !== payload.password) {
      throw new Error("Invalid email or password.");
    }

    const role = ROLE_MAP[user.roleId];
    const authUser: AuthUser = {
      userId: user.id,
      email: user.email,
      role,
      name: user.email,
    };

    if (role === "CUSTOMER") {
      const { data: customers } = await api.get<Customer[]>("/customers", {
        params: { userId: user.id },
      });
      const c = customers[0];
      if (c) {
        authUser.name = `${c.firstName} ${c.lastName}`;
        authUser.customerId = c.id;
      }
    }

    if (role === "SELLER") {
      const { data: sellers } = await api.get<Seller[]>("/sellers", {
        params: { userId: user.id },
      });
      const s = sellers[0];
      if (s) {
        authUser.name = s.businessName;
        authUser.sellerId = s.id;
        authUser.sellerStatus = s.status;
      }
    }

    if (role === "ADMIN") {
      authUser.name = "Marketplace Admin";
    }

    return authUser;
  },
};
