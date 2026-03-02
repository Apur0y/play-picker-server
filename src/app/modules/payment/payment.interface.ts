export interface IPaymentRequest {
  transactionId: string;
  userId: string;
  packageId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaymentResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface ISSLCommerceInitiation {
  store_id: string;
  store_passwd: string;
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  shipping_method: string;
  product_name: string;
  product_category: string;
  product_profile: string;
}

export interface ISSLCommerceValidation {
  store_id: string;
  store_passwd: string;
  trans_id: string;
  amount: number;
  currency: string;
}

export interface ISSLCommerceResponse {
  status?: string;
  sessionkey?: string;
  gateway_url?: string;
  GatewayPageURL?: string;
  redirectGatewayURL?: string;
  MessageType?: string;
  status_code?: string;
  status_message?: string;
}

export interface IValidationResponse {
  status: string;
  tran_date: string;
  tran_amount: string;
  store_amount: string;
  currency: string;
  bank_tran_id: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  sanction_scanban_status: string;
}
