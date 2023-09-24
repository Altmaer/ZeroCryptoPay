# ZeroCryptoPay

<div align="center">
  <a href="https://www.npmjs.com/package/zerocryptopay">
    <img alt="npm version" src="https://img.shields.io/npm/v/zerocryptopay" />
  </a>
  <a href="https://www.npmjs.com/package/zerocryptopay">
    <img alt="npm downloads" src="https://img.shields.io/npm/dm/zerocryptopay" />
  </a>
    <a href="https://www.npmjs.com/package/zerocryptopay">
    <img alt="license" src="https://img.shields.io/npm/l/zerocryptopay" />
  </a>
</div>

Zerocryptopay.com API wrapper.

<div align="center">
  <a href="https://github.com/Altmaer/zerocryptopay">
    <img src="https://zerocryptopay.com/vendor/images/logo3.png" alt="Zerocryptopay logo" />
  </a>
</div>

## Usage

```js
import { ZeroCryptoPay } from 'zerocryptopay';

// ZeroCryptoPay.createOrder
(async () => {
  const LOGIN = 'mario33';
  const SECRET_KEY_FROM_DASHBOARD = '8XDa5j1Mlw5UE6T1ZR8uqH12gNv5n9kganb';
  const TOKEN_FROM_DASHBOARD = '9U68r6Xcl2ONvV86ISu200dke992DG6g65w';

  const signatureData = {
    login: LOGIN,
    amount: 100,
    secretKey: SECRET_KEY_FROM_DASHBOARD,
    orderId: Date.now(),
  };

  const signature = ZeroCryptoPay.createSign(signatureData);

  const orderData = {
    ...signatureData,
    token: TOKEN_FROM_DASHBOARD,
    signature,
  };

  const order = await ZeroCryptoPay.createOrder(orderData);

  if (order.status === false) {
    console.log('something went wrong while creating an order', order);
    return;
  }

  console.log('redirect your client to', order.url_to_pay);

  // ZeroCryptoPay.checkOrder
  const checkOrderSign = ZeroCryptoPay.createCheckOrderSign({
    token: TOKEN_FROM_DASHBOARD,
    transactionHash: order.hash_trans,
    secretKey: SECRET_KEY_FROM_DASHBOARD,
    trackingId: order.id,
    login: LOGIN,
  });

  const orderStatus = await ZeroCryptoPay.checkOrder({
    trackingId: order.id,
    signature: checkOrderSign,
    token: TOKEN_FROM_DASHBOARD,
    transactionHash: order.hash_trans,
    login: LOGIN,
  });

  console.log('orderStatus', orderStatus);
})();
```

## Available methods:

See the doc: https://zerocryptopay.com/partner/apidoc (sign in is required to see the doc).

* ZeroCryptoPay.createSign (https://zerocryptopay.com/partner/apidoc#sing_calc)
* ZeroCryptoPay.createCheckOrderSign (https://zerocryptopay.com/partner/apidoc#manual_check:~:text=Tracking%20Order%20ID-,signature,-Signature%20is%20formed)
* ZeroCryptoPay.createWebhookSign (https://zerocryptopay.com/partner/apidoc#webHooks:~:text=of%20payment%20method-,signature,-Signature%20is%20formed)
* ZeroCryptoPay.createOrder (https://zerocryptopay.com/partner/apidoc#create_bill)
* ZeroCryptoPay.checkOrder (https://zerocryptopay.com/partner/apidoc#manual_check)

## Testing

*Create .env first*

```
npm test
```

P.S. If some of the order action checks are failed, check that you put your ip for access in dashboard (https://zerocryptopay.com/partner/profile/api).
