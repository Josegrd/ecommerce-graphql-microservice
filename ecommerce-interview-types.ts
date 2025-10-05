export interface User {
  user_id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: Date;
}
// PURPOSE: Basic user model dengan soft delete (is_active),
// untuk authentication dan profile

export interface UserAddress {
  address_id: number;
  user_id: number;
  street_address: string;
  city: string;
  postal_code: string;
  is_default: boolean;
}
// PURPOSE: Normalized address (1:N dengan User),
// is_default untuk alamat utama shipping

// Product catalog interfaces
export interface Category {
  category_id: number;
  parent_category_id?: number;
  category_name: string;
  is_active: boolean;
}
// PURPOSE: Hierarchical categories (Electronics > Smartphones),

export interface Product {
  product_id: number;
  category_id: number;
  product_name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: Date;
}
// PURPOSE: Core product model dengan inventory (stock_quantity),
// SKU untuk business identifier, soft delete

export interface ProductVariant {
  variant_id: number;
  product_id: number;
  variant_name: string;
  variant_value: string;
  price_adjustment: number;
  stock_quantity: number;
}
// PURPOSE: Product variants (Size: Large, Color: Red),
// price_adjustment untuk harga berbeda, separate stock tracking

export interface ShoppingCartItem {
  cart_id: number;
  user_id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  added_at: Date;
}
// PURPOSE: Persistent cart per user, support variants,
// optional variant_id untuk produk tanpa varian

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
// PURPOSE: Controlled vocabularies untuk order lifecycle,
// separate payment status dari order status

export interface Order {
  order_id: number;
  user_id: number;
  order_number: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address: string;
  shipping_city: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  created_at: Date;
}
// PURPOSE: Complete order dengan financial breakdown,
// denormalized shipping untuk historical data, order_number untuk human-readable ID

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
// PURPOSE: Order line items dengan denormalized product info,
// snapshot prices saat order dibuat untuk historical accuracy

// Payment interfaces
export interface PaymentMethod {
  payment_method_id: number;
  method_name: string;
  is_active: boolean;
  processing_fee_percentage: number;
}
// PURPOSE: Master data untuk payment options,
// processing_fee untuk cost calculation

export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";

export interface PaymentTransaction {
  transaction_id: number;
  order_id: number;
  payment_method_id: number;
  transaction_status: TransactionStatus;
  amount: number;
  processing_fee: number;
  gateway_response?: Record<string, any>;
  created_at: Date;
}
// PURPOSE: Payment tracking dengan gateway integration,
// support multiple payments per order, flexible gateway_response

// Marketing interfaces
export type DiscountType = "percentage" | "fixed_amount";

export interface Coupon {
  coupon_id: number;
  coupon_code: string;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order_amount: number;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  expires_at: Date;
  created_at: Date;
}
// PURPOSE: Flexible discount system (10% atau $5 off),
// usage tracking, business rules dengan minimum order

export interface ProductReview {
  review_id: number;
  product_id: number;
  user_id: number;
  order_id: number;
  rating: number; // 1-5
  review_text?: string;
  is_approved: boolean;
  created_at: Date;
}
// PURPOSE: Verified purchase reviews (linked to order),
// moderation system dengan is_approved

// API request/response interfaces
export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AddToCartRequest {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

export interface CheckoutRequest {
  shipping_address_id: number;
  payment_method_id: number;
  coupon_code?: string;
}

export interface CheckoutResponse {
  order_id: number;
  order_number: string;
  total_amount: number;
  payment_required: boolean;
  message: string;
}

// Search and filter interfaces
export interface ProductSearchFilters {
  query?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
}

export interface ProductSummary {
  product_id: number;
  product_name: string;
  price: number;
  stock_quantity: number;
  category_name: string;
  average_rating: number;
  review_count: number;
}

// Pagination utility
export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Business logic helpers
export class OrderCalculator {
  static calculateSubtotal(items: OrderItem[]): number {
    return items.reduce((total, item) => total + item.total_price, 0);
  }

  static calculateTax(subtotal: number, taxRate: number = 0.1): number {
    return Math.round(subtotal * taxRate * 100) / 100;
  }

  static calculateTotal(
    subtotal: number,
    tax: number,
    shipping: number,
    discount: number
  ): number {
    return Math.round((subtotal + tax + shipping - discount) * 100) / 100;
  }

  static applyCoupon(subtotal: number, coupon: Coupon): number {
    if (subtotal < coupon.minimum_order_amount) return 0;

    if (coupon.discount_type === "percentage") {
      return Math.round(subtotal * (coupon.discount_value / 100) * 100) / 100;
    }
    return Math.min(coupon.discount_value, subtotal);
  }
}
// PURPOSE: Business logic untuk order calculations,
// centralized calculation methods, coupon validation

export class InventoryManager {
  static isStockSufficient(
    currentStock: number,
    requestedQuantity: number
  ): boolean {
    return currentStock >= requestedQuantity;
  }

  static calculateStockAfterOrder(
    currentStock: number,
    orderQuantity: number
  ): number {
    return Math.max(0, currentStock - orderQuantity);
  }
}
// PURPOSE: Inventory management helpers,
// stock validation dan calculation methods
