export type PagarmeCustomerInput = {
  name: string;
  email: string;
  type: "individual";
  document: string;
  document_type: "CPF";
  phones: {
    mobile_phone: {
      country_code: string;
      area_code: string;
      number: string;
    };
  };
};

export type PagarmeCreateOrderInput = {
  code: string;
  customer: PagarmeCustomerInput;
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
    code: string;
  }>;
  payments: Array<Record<string, unknown>>;
  metadata?: Record<string, string>;
};

export type PagarmeCharge = {
  id?: string;
  status?: string;
  payment_method?: string;
  last_transaction?: {
    status?: string;
    qr_code?: string;
    qr_code_url?: string;
    pdf?: string;
    line?: string;
    url?: string;
    expires_at?: string;
  };
};

export type PagarmeOrderResponse = {
  id?: string;
  status?: string;
  charges?: PagarmeCharge[];
};

export type PagarmeSubscriptionResponse = {
  id?: string;
  code?: string;
  status?: string;
  next_billing_at?: string;
  current_cycle?: {
    billing_at?: string;
  };
  charges?: PagarmeCharge[];
};
