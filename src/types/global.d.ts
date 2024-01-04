export {};

declare global {
  interface IError extends Error {
    statusCode?: number;
  }

  interface ICart {
    id: number;
    total_price: number;
    user_id: number;
    created_at: string;
    updated_at: string;
  }

  interface ICartItem {
    id: number;
    quantity: number;
    cart_id: number;
    product_id: number;
    created_at: string;
    updated_at: string;
  }

  interface ICategory {
    id: number;
    category_name: string;
    created_at: string;
    updated_at: string;
  }

  interface IProduct {
    id: number;
    title: string;
    description: string;
    price: number;
    image_url: string;
    discount_percentage: number;
    discounted_price: number;
    stock_quantity: number;
    category_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
  }

  interface IResetPassword {
    id: number;
    user_id: number;
    token: string;
    created_at: string;
    updated_at: string;
  }

  interface IRole {
    id: number;
    role_name: string;
    created_at: string;
    updated_at: string;
  }

  export interface IUser {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    address: string;
    phone_number: string;
    role_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
  }

  export interface IWishlist {
    id: number;
    product_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
  }
}
