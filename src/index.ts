import crypto from 'crypto';
import axios, { AxiosError } from 'axios';

export type OrderIdType = string | number;
export type AmountType = string | number;

export interface ICreateSign {
  amount: AmountType;
  secretKey: string;
  orderId: OrderIdType;
  login: string;
}

export interface ICreateCheckOrderSign {
  token: string;
  transactionHash: string;
  secretKey: string;
  trackingId: OrderIdType;
  login: string;
}

export interface ICreateWebhookSign {
  token: string;
  amountForPay: AmountType;
  secretKey: string;
  transactionHash: string;
  paymentMethod: string;
  login: string;
}

export interface ICreateOrder {
  amount: AmountType;
  token: string;
  signature: string;
  login: string;
  orderId: OrderIdType;
}

export interface IZeroCryptoPayError {
  status: boolean;
  error_code: number;
  message: string;
}

export interface ICreateOrderSuccess {
  status: true;
  id: number;
  error_code: 0;
  hash_trans: string;
  order_id: string;
  url_to_pay: string;
}

export interface ICheckOrder {
  trackingId: OrderIdType;
  signature: string;
  token: string;
  transactionHash: string;
  login: string;
}

export interface ICheckOrderSuccess {
  status: true;
  error_code: 0;
  id_track: string;
  amount: string;
  amount_for_pay: string;
  hash_trans: string;
  unixtime: string;
  signature: string;
  order_id: string;
  event_status: 'paid' | 'unpaid' | 'pending';
}

export class ZeroCryptoPay {
  private static encodeData(data: object) {
    const params = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
      params.append(key, value);
    });

    return params;
  }

  public static createSign({ amount, secretKey, orderId, login }: ICreateSign) {
    const sign = crypto
      .createHash('sha256')
      .update(`${amount}${secretKey}${orderId}${login}`)
      .digest('hex');

    return sign;
  }

  public static createCheckOrderSign({
    token,
    transactionHash,
    secretKey,
    trackingId,
    login,
  }: ICreateCheckOrderSign) {
    const sign = crypto
      .createHash('sha256')
      .update(`${token}${transactionHash}${secretKey}${trackingId}${login}`)
      .digest('hex');

    return sign;
  }

  public static createWebhookSign({ token, amountForPay, secretKey, transactionHash, paymentMethod, login }: ICreateWebhookSign) {
    const sign = crypto
      .createHash('sha256')
      .update(`${token}${amountForPay}${secretKey}${transactionHash}${paymentMethod}${login}`)
      .digest('hex');

    return sign;
  }

  public static async createOrder({
    login,
    amount,
    token,
    orderId,
    signature,
  }: ICreateOrder) {
    try {
      const res = await axios.post<IZeroCryptoPayError | ICreateOrderSuccess>(
        'https://zerocryptopay.com/pay/newtrack/',
        this.encodeData({
          login,
          amount,
          token,
          order_id: orderId,
          signature,
        }),
      );

      return res.data;
    } catch (error) {
      const thisError = error as AxiosError;

      if (axios.isAxiosError(thisError) === true) {
        return thisError.response?.data as IZeroCryptoPayError;
      }

      throw thisError;
    }
  }

  public static async checkOrder({
    trackingId,
    signature,
    token,
    transactionHash,
    login,
  }: ICheckOrder) {
    try {
      const res = await axios.post<IZeroCryptoPayError | ICheckOrderSuccess>(
        'https://zerocryptopay.com/pay/status/',
        this.encodeData({
          id_track: trackingId,
          signature,
          token,
          hash_trans: transactionHash,
          login,
        }),
      );

      return res.data;
    } catch (error) {
      const thisError = error as AxiosError;

      if (axios.isAxiosError(thisError) === true) {
        return thisError.response?.data as IZeroCryptoPayError;
      }

      throw thisError;
    }
  }
}
