import { ZeroCryptoPay, IZeroCryptoPayError, ICreateOrderSuccess } from '.';
import { hasOwn } from './utills';

const login = process.env.LOGIN;
const secretKey = process.env.SECRET_KEY;
const token = process.env.TOKEN;

if (login === undefined || secretKey === undefined || token === undefined) {
  throw new Error('Some of envs are undefined');
}

describe('ZeroCryptoPay', () => {
  let orderId = -1;
  let orderData = {} as IZeroCryptoPayError | ICreateOrderSuccess;

  it('should create a correct create order signature', () => {
    const data = {
      amount: 100,
      secretKey: 'superSecretKey',
      orderId: '3900b',
      login: 'mylogin',
    };

    const sign =
      '673ed3cf8e18945f73c085deee1899d964aada6098d331d22f7ebd7dcc7da888';

    expect(ZeroCryptoPay.createSign(data)).toBe(sign);
  });

  it('should create a correct check order signature', () => {
    const data = {
      token: 'superToken',
      transactionHash: 'myHash',
      secretKey: 'superSecretFR',
      trackingId: '555',
      login: 'ElonMusk',
    };

    const sign =
      'c84e336f4b8e96a5a0edb6dc22ae0c746b7f72c011c5b6f360797fb5f409548f';

    expect(ZeroCryptoPay.createCheckOrderSign(data)).toBe(sign);
  });

  it('should create a correct webhook signature', () => {
    const data = {
      token: 'myToken',
      amountForPay: 1,
      secretKey: 'superSecret',
      transactionHash: 'blablabla',
      paymentMethod: 'BTC',
      login: 'JohnSmith',
    };

    const sign =
      'eea8fc9576c5d4ab7df46ad1187dc934a6e324c21a207872759f2b9924bc8429';

    expect(ZeroCryptoPay.createWebhookSign(data)).toBe(sign);
  });

  it('should not create an order (tracking)', async () => {
    const order = await ZeroCryptoPay.createOrder({
      login,
      amount: 1,
      token: 'fakeToken',
      orderId: 'noOrderId',
      signature: 'noSign',
    });

    expect(order.status).toBe(false);
    expect(order.error_code).not.toBe(0);
    expect(hasOwn(order, 'id')).toBe(false);
    expect(hasOwn(order, 'hash_trans')).toBe(false);
    expect(hasOwn(order, 'order_id')).toBe(false);
    expect(hasOwn(order, 'url_to_pay')).toBe(false);
  });

  it('should create an order (tracking)', async () => {
    orderId = Date.now();

    const amount = 1;

    const signature = ZeroCryptoPay.createSign({
      amount,
      secretKey,
      orderId,
      login,
    });

    orderData = await ZeroCryptoPay.createOrder({
      login,
      amount,
      token,
      orderId,
      signature,
    });

    expect(orderData.status).toBe(true);
    expect(orderData.error_code).toBe(0);
    expect(hasOwn(orderData, 'id')).toBe(true);
    expect(hasOwn(orderData, 'hash_trans')).toBe(true);
    expect(hasOwn(orderData, 'order_id')).toBe(true);
    expect(hasOwn(orderData, 'url_to_pay')).toBe(true);
  });

  it('should not do an order check', async () => {
    const order = await ZeroCryptoPay.checkOrder({
      trackingId: 'no',
      signature: 'no',
      token: 'no',
      transactionHash: 'no',
      login: 'no',
    });

    expect(order.status).toBe(false);
    expect(order.error_code).not.toBe(0);
    expect(hasOwn(order, 'id_track')).toBe(false);
    expect(hasOwn(order, 'amount_for_pay')).toBe(false);
    expect(hasOwn(order, 'hash_trans')).toBe(false);
    expect(hasOwn(order, 'unixtime')).toBe(false);
    expect(hasOwn(order, 'signature')).toBe(false);
    expect(hasOwn(order, 'order_id')).toBe(false);
    expect(hasOwn(order, 'event_status')).toBe(false);
  });

  it('should do an order check', async () => {
    const orderParams = orderData as ICreateOrderSuccess;

    const checkOrderSign = ZeroCryptoPay.createCheckOrderSign({
      token,
      transactionHash: orderParams.hash_trans,
      secretKey,
      trackingId: orderParams.id,
      login,
    });

    const order = await ZeroCryptoPay.checkOrder({
      trackingId: orderParams.id,
      signature: checkOrderSign,
      token,
      transactionHash: orderParams.hash_trans,
      login,
    });

    expect(order.status).toBe(true);
    expect(order.error_code).toBe(0);
    expect(hasOwn(order, 'id_track')).toBe(true);
    expect(hasOwn(order, 'amount_for_pay')).toBe(true);
    expect(hasOwn(order, 'hash_trans')).toBe(true);
    expect(hasOwn(order, 'unixtime')).toBe(true);
    expect(hasOwn(order, 'signature')).toBe(true);
    expect(hasOwn(order, 'order_id')).toBe(true);
    expect(hasOwn(order, 'event_status')).toBe(true);
  });
});
