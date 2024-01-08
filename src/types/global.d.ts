export {};

declare global {
  interface IError extends Error {
    statusCode?: number;
  }

  interface IMidtransResponse {
    token: string;
    redirect_url: string;
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
    cart_item: {
      quantity: number;
    };
  }

  interface IMidtransNotification {
    transaction_time: string;
    transaction_status: string;
    transaction_id: string;
    status_message: string;
    status_code: string;
    signature_key: string;
    payment_type: string;
    order_id: string;
    merchant_id: string;
    masked_card: string;
    gross_amount: string;
    fraud_status: string;
    eci: string;
    currency: string;
    channel_response_message: string;
    channel_response_code: string;
    card_type: string;
    bank: string;
    approval_code: string;
  }
}
