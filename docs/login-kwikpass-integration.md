# Integration: Custom Shopify (Custom FE + Shopify BE)

# Audience: External merchants & partners. Status: external-safe. Last

# reviewed: 2026-04-

# Integration: Custom Shopify (Custom FE + Shopify BE)

For merchants whose storefront is a custom React / Next.js / Hydrogen / etc. app, but whose
backend (catalog, customers, checkout) lives in Shopify. KwikPass handles login + identity;
Shopify Multipass handles SSO into the Shopify-managed checkout.

## When to choose this path

```
✅ Your storefront is custom (Next.js, Hydrogen, Remix, custom React, Vue, etc.).
✅ Your backend is Shopify (you use Shopify checkout, Shopify customer accounts, Shopify
Admin).
✅ You want OTP login on the storefront and a seamless Multipass redirect into the Shopify
session when the user reaches account/checkout.
❌ If you're on a stock Shopify theme → Shopify Public App is simpler.
❌ If you're not on Shopify at all → Custom Web.
```
## Architecture

Two parallel things happen on OTP success:

```
1. Shopify session is created via Multipass (browser fetches the Multipass URL).
```
```
1 sequenceDiagram
2 participant U as User
3 participant FE as Custom FE<br/>(Next.js / Hydrogen)
4 participant KP as KwikPass Plugin
5 participant API as KwikPass API
6 participant Shop as Shopify Storefront API
7
8 U->>FE: Visits site
9 FE->>FE: Load kwikpass-core-functions-min.js (BEFORE)<br/>then kp-merchant-v2.js
10 FE->>KP: window.merchantInfo set; kpUpdateDOM() called
11 U->>FE: Clicks profile icon
12 FE->>KP: __KP_LOGIN_SDK_INSTANCE__.handleKpLogin()
13 KP->>U: Renders login modal
14 U->>KP: Enters phone + OTP
15 KP->>API: Verify OTP
16 API-->>KP: kpToken (JWE) + Shopify Multipass token
17 KP->>Shop: Hits Multipass URL → creates Shopify customer session
18 Shop-->>FE: Sets Shopify customer cookie
19 KP-->>FE: Dispatches kp_data_sent event with kpToken
20 FE->>FE: Decode kpToken → render logged-in UI
```

```
2. kpToken (JWE) is dispatched to your FE via the kp_data_sent event — contains phone,
email, shopifyCustomerId. You decrypt it server-side to extract user info safely.
```
## Prerequisites

```
Onboarding Checklist Phases 0–2 complete
JWE secret key received from KwikPass (separate keys for sandbox / prod, sent via email)
Engineering: ability to deploy script tags + decode JWE tokens server-side
Decision: are you using Multipass redirect (default) or just KwikPass identity (then own your
Shopify login flow)?
```
## Step 1 — Add the bootstrap script

Add before the closing </body> tag (or in your framework's equivalent — see Next.js section
below for the React/Next.js way).

# Critical ordering: kwikpass-core-functions-min.js must load before

# kp-merchant-v2.js. With Next.js afterInteractive strategy script

# order is not guaranteed; use the loader pattern in the Next.js section below.

For production, swap:

```
sandbox.pdp.gokwik.co → pdp.gokwik.co
environment: "sandbox" → environment: "production"
Use the prod MID (different from sandbox)
```
```
1 <script>
2 window.merchantInfo = {
3 ...window.merchantInfo,
4 environment: "sandbox", // "production" once you cut over
5 mid: "<MERCHANT_ID>", // sandbox MID for now
6 integrationType: "CUSTOM_SHOPIFY",
7 type: "merchantInfo"
8 };
9 </script>
10
11 <scriptsrc="https://sandbox.pdp.gokwik.co/kwikpass/kwikpass-core-functions-min.js"defer>
</script>
12 <scriptdefersrc="https://sandbox.pdp.gokwik.co/kwikpass/plugin/build/kp-merchant-v2.js">
</script>
13
14 <script>
15 window.addEventListener('DOMContentLoaded', function() {
16 if (typeof handleDOMUpdate === 'function') handleDOMUpdate();
17 });
18
19 window.addEventListener('update-dom', function() {
20 if (typeof handleDOMUpdate === 'function') handleDOMUpdate();
21 });
22 </script>
```

## Step 2 — Wire the login button

Add this onClick to your profile/login button:

Behavior:

```
If user is not logged in → opens the login modal.
If user is logged in → no-op (or fires kp_data_sent again with cached session).
```
# Step 3 — Listen for kp_data_sent (the login callback)

Place this before wiring the click handler — otherwise you can't tell whether the user was
already logged in on page load:

## Step 4 — Wire logout

This clears KwikPass session and ends the Shopify customer session. If you skip this and rely
on your own logout, the Shopify cookie stays; next "login" will silently re-use it instead of

```
1 __KP_LOGIN_SDK_INSTANCE__.handleKpLogin();
```
```
1 window.addEventListener('kp_data_sent',function(event){
2 console.log("KwikPass login event:", event.detail);
3 // event.detail = {
4 // kpToken: "<JWE token>", // contains phone, email, shopifyCustomerId
5 // success: true, // false on error
6 // error: undefined, // error details if failure
7 // kpLogout: false // if true, session was invalidated → consider page
reload
8 // }
9 });
```
```
kpToken JWE-encrypted token.
Decrypt server-side (see Step
5).
```
```
Send to your BE; never
decrypt on client.
```
```
success Boolean^ —^ login^ succeeded. If^ false,^ show^ error^ UI.
error Error code/message. Log; surface user-friendly
message.
kpLogout If true, KwikPass invalidated
the user's session (e.g. token
revoked).
```
```
Reload page or clear local
session state.
```
```
Field Meaning What to do
```
```
1 handleLogout(redirectTo); // optional redirectTo URL
```

triggering OTP.

# Step 5 — Decode kpToken (JWE) server-side

The token is a standard JWE. Always decode on the server — exposing the JWE secret in the
browser defeats the encryption.

KwikPass emails you two secret keys: one for sandbox, one for production. Don't mix them —
the keys are different and a sandbox key won't decrypt a production token.

Node.js (using jose)

Python 3 (using authlib)

PHP 8. 2 (using web-token/jwt-framework)

```
1 const jose = require('jose');
2
3 asyncfunctiondecodeKpToken(jweToken, secret){
4 const key = jose.base64url.decode(secret);
5 const{ payload, protectedHeader }=await jose.jwtDecrypt(jweToken, key);
6 return payload; // { phone, email, shopifyCustomerId, ... }
7 }
```
```
1 from base64 import urlsafe_b64decode
2 from authlib.jose import JsonWebEncryption
3
4 defdecode_kp_token(jwe_token:str, secret:str) ->dict:
5 def base64url(input):
6 padding_needed = 4 - (len(input) % 4 )
7 if padding_needed and padding_needed < 4 :
8 input+= "="* padding_needed
9 return urlsafe_b64decode(input)
10
11 cek = base64url(secret)
12 jwe = JsonWebEncryption()
13 return jwe.deserialize_compact(jwe_token, cek)['payload']
```
```
1 <?php
2 useJose\Component\Core\JWK;
3 useJose\Component\Core\AlgorithmManager;
4 useJose\Component\Encryption\JWEDecrypter;
5 useJose\Component\Encryption\Serializer\CompactSerializer;
6 useJose\Component\Encryption\Algorithm\KeyEncryption\Dir;
7 useJose\Component\Encryption\Algorithm\ContentEncryption\A128CBCHS256;
8
9 functionbase64url_decode($data){
10 $remainder =strlen($data)% 4 ;
11 if ($remainder) $data.= str_repeat('=', 4 - $remainder);
12 returnbase64_decode(strtr($data,'-_','+/'));
13 }
14
15 $cek=base64url_decode($secret);
16 $jwk=newJWK(['kty'=>'oct','k' =>rtrim(strtr(base64_encode($cek),'+/', '-_'), '=')]);
17
18 $decrypter= newJWEDecrypter(new AlgorithmManager([new Dir(), newA128CBCHS256()]));
19 $jwe=(new CompactSerializer())->unserialize($jweToken);
20 $decrypter->decryptUsingKey($jwe, $jwk, 0 );
21 $payload=json_decode($jwe->getPayload(),true);
```

JWE FAQ

```
Does the token expire? No. JWE itself doesn't carry an exp claim by default; decode
whenever you need user info. If you want session expiry, layer your own session token on top.
Do I need to verify a signature? No. JWE provides authenticated encryption; if decryption
succeeds, integrity is already guaranteed.
What's in the payload? At minimum phone, email, shopifyCustomerId. Other fields
may be present (e.g. name, custom fields configured in dashboard).
```
## Step 6 — Page-view event tracking

KwikPass needs page_view_kp events to power KwikEngage retargeting on Homepage /
Collection / Product / Cart pages. Fire these after the KwikPass scripts have loaded.

Product page

Collection page

Other pages (Home / Blog / etc.)

# Cart events: add_to_cart automation in KwikEngage requires cart_id.

# If you don't have it, KwikEngage cart retargeting won't fire.

```
1 window.dispatchEvent(newCustomEvent('page_view_kp',{
2 detail:{
3 type:'product', // [string, required]
4 data:{
5 cart_id:'', // [string, optional]
6 product_id:'<shopify_product_id>', // [string, required]
7 variant_id:'', // [string, optional]
8 image_url:'<absolute_url>', // [string, required]
9 name: '<product_title>', // [string, required]
10 price: '<numeric_price>', // [number, required]
11 handle:'<url_slug>' // [string, optional]
12 }
13 }
14 }));
```
```
1 window.dispatchEvent(newCustomEvent('page_view_kp',{
2 detail:{
3 type:'collection',
4 data:{
5 cart_id:'',
6 collection_id: '<shopify_collection_id>', // required
7 name: '<collection_name>', // required
8 image_url:'',
9 handle:''
10 }
11 }
12 }));
```
```
1 window.dispatchEvent(newCustomEvent('page_view_kp',{
2 detail:{type:'other',data:{ cart_id:''}}
3 }));
```

## Next.js / React integration pattern

Recommended structure: a <KwikPass /> component you mount once in _app.tsx, plus a
<KwikPassScript /> it renders.

```
components/KwikPass/KwikPassScript.tsx
```
```
components/KwikPass/index.tsx
```
```
1 importScriptfrom"next/script";
2
3 declareconstwindow:any;
4 declareconst kpUpdateDOM: any;
5
6 exportdefaultfunctionKwikPassScript({ onLoaded }:{onLoaded: ()=> void}) {
7 constonReady=()=>{
8 if (typeof kpUpdateDOM !=='undefined')kpUpdateDOM();
9 onLoaded();
10 };
11
12 return(
13 <>
14 <Scriptid="kwikpass-init"strategy="lazyOnload">{`
15 window.merchantInfo = {
16 ...window.merchantInfo,
17 mid: "${process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID}",
18 environment: "${process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT}",
19 integrationType: "CUSTOM_SHOPIFY",
20 type: "merchantInfo"
21 };
22 `}</Script>
23 <Script
24 id="kwikpass-core"
25 src={`${process.env.NEXT_PUBLIC_KP_BASE}/kwikpass/kwikpass-core-functions-min.js`}
26 strategy="afterInteractive"
27 />
28 <Script
29 id="kwikpass-merchant"
30 src={`${process.env.NEXT_PUBLIC_KP_BASE}/kwikpass/plugin/build/kp-merchant-v2.js`}
31 strategy="afterInteractive"
32 onReady={onReady}
33 />
34 </>
35 );
36 }
```
```
1 import{ useCallback, useEffect, useState }from'react';
2 import{ useRouter } from'next/router';
3 importKwikPassScriptfrom'./KwikPassScript';
4
5 exportdefaultfunctionKwikPass() {
6 const router =useRouter();
7 const[scriptLoaded, setScriptLoaded]= useState(false);
8
9 const onLoaded =useCallback(() =>setScriptLoaded(true),[]);
10
11 useEffect(()=>{
12 if (!scriptLoaded ||typeofwindow=== "undefined") return;
13
14 consthandleKpDataSent =async(event:any)=> {
15 console.log("kpToken:", event.detail.kpToken);
16 // POST to your BE for JWE decode + session sync
17 };
```

```
pages/_app.tsx
```
Env vars

## Vanilla JS (multi-page apps)

For non-SPA sites where each page navigation is a full reload:

```
18
19 window.addEventListener('kp_data_sent', handleKpDataSent);
20 return()=>window.removeEventListener('kp_data_sent', handleKpDataSent);
21 }, [scriptLoaded]);
22
23 useEffect(()=>{
24 if (!scriptLoaded ||typeofwindow=== "undefined") return;
25 if (typeof(windowasany).handleDOMUpdate=== 'function') (windowas
any).handleDOMUpdate();
26 constonUpdate =()=> (windowasany).handleDOMUpdate?.();
27 window.addEventListener('update-dom', onUpdate);
28 return()=>window.removeEventListener('update-dom', onUpdate);
29 }, [scriptLoaded]);
30
31 return<KwikPassScriptonLoaded={onLoaded}/>;
32 }
```
```
1 importKwikPassfrom'@/components/KwikPass';
2
3 exportdefaultfunctionMyApp({Component, pageProps }: AppProps){
4 return(
5 <>
6 <KwikPass/>
7 <Component{...pageProps}/>
8 </>
9 );
10 }
```
```
1 NEXT_PUBLIC_KWIKPASS_MERCHANT_ID=<your_sandbox_or_prod_mid>
2 NEXT_PUBLIC_KWIKPASS_ENVIRONMENT=sandbox # or production
3 NEXT_PUBLIC_KP_BASE=https://sandbox.pdp.gokwik.co # or https://pdp.gokwik.co
```
```
1 <scriptid="kwikpass-init">
2 window.merchantInfo = {
3 ...window.merchantInfo,
4 mid: "<MERCHANT_ID>",
5 environment: "sandbox",
6 integrationType: "CUSTOM_SHOPIFY",
7 type: "merchantInfo"
8 };
9 </script>
10 <scriptid="kwikpass-core" src="https://sandbox.pdp.gokwik.co/kwikpass/kwikpass-core-
functions-min.js"defer></script>
11 <script
12 src="https://sandbox.pdp.gokwik.co/kwikpass/plugin/build/kp-merchant-v2.js"
13 defer
14 onload="window.dispatchEvent(new CustomEvent('kp-script-loaded'))">
15 </script>
16
17 <script>
18 window.addEventListener('kp-script-loaded', function () {
19 if (typeof kpUpdateDOM !== 'undefined') kpUpdateDOM();
20 // Now safe to dispatch page_view_kp and wire login button onclick
21 });
22 </script>
```

## OTP template customization

By default, OTP SMS goes from GoKwik's handle with this template:

# "3822 is your login OTP. It is valid for next 5 minutes. Do not share your OTP

# with anyone. Powered by GoKwik!"

To use your own SMS handle, share with the KwikPass team:

Same for WhatsApp templates (Meta-approved authentication template required).

## Smoke testing — Custom Shopify specifics

Verify Multipass redirect

After OTP, confirm Shopify customer cookie is set:

Expect at least _shopify_y and customer-related cookies. Then visit /account — should
not re-prompt for login.

Verify tp2 analytics calls

In DevTools → Network → filter tp2. As you navigate pages, you'll see POSTs to the Snowplow
collector. Decode the cx query param via base64 — it contains the actual event payload,
including the page_view_kp event you fired.

Test SSO across the GoKwik network

KwikPass shares identity across all merchants on the GoKwik network. To test SSO:

```
1. Log in on a different test merchant first (KwikPass team will share the test environment URL).
2. Visit your sandbox storefront, click profile button → you should be auto-logged in (no OTP).
3. The kp_data_sent event fires with the cached kpToken.
```
## Common issues

```
1 Provider: GupShup / Kaleyra / etc.
2 Template ID: <DLT-registered template ID>
3 Template: Hey @_NAME_@, @_123_@ is your OTP for login at <BrandName>.
4 Sender ID: <6-char DLT sender ID>
5 Username: <provider account username>
6 Password: <provider account password>
```
```
1 document.cookie.split('; ').filter(c=> c.startsWith('_shopify_'))
```
```
Symptom Cause Fix
```

## Reference

### __KP_LOGIN_SDK_INSTANCE

```
__ is not defined
```
```
kp-merchant-v2.js ran
before kwikpass-core-
functions-min.js
```
```
Use the loader pattern with
kp-script-loaded event
(vanilla) or onReady in
next/script
OTP never arrives Sandbox MID hitting prod
gateway, or vice versa
```
```
Verify mid matches
environment
kp_data_sent event
listener wired but never fires
```
```
Listener attached after
handleKpLogin() was
called
```
```
Always attach listener before
any login button is clickable
```
```
JWE decryption fails with
"invalid key"
```
```
Using sandbox secret on prod
token, or vice versa
```
```
Two distinct keys — env-gate
them
Multipass redirect lands user
on wrong page
```
```
redirectTo not set or
coupling mode mismatch
```
```
Configure Coupling URL in
dashboard → Login Behavior
Page-view events not landing Dispatched before KwikPass
script ready
```
```
Wrap dispatch in kp-
script-loaded listener
(vanilla) or scriptLoaded
state (Next.js)
kpLogout: true received
unexpectedly
```
```
KP token revoked server-side
(e.g. account merge,
suspicious activity)
```
```
Reload page; user re-
authenticates
```
```
Init script https://sandbox.pdp.gok
wik.co/kwikpass/kwikpas
s-core-functions-
min.js
```
```
https://pdp.gokwik.co/k
wikpass/kwikpass-core-
functions-min.js
```
```
Merchant plugin https://sandbox.pdp.gok
wik.co/kwikpass/plugin/
build/kp-merchant-
v2.js
```
```
https://pdp.gokwik.co/k
wikpass/plugin/build/kp
-merchant-v2.js
```
```
Asset Sandbox URL Production URL
```

Sources consolidated from Kwikpass1: [1094778882] Custom FE Shopify BE Integration
Guide (canonical source for code samples), [1982201881] (recent revision), [975405112]
Kwikpass integration: Custom FE, Shopify BE without account management, [1800994818]
Shopify Customer Authentication Identifier. This page is the canonical replacement.

```
__KP_LOGIN_SDK_INSTANCE__.handleKpL
ogin()
```
```
Open the login modal
```
```
handleLogout(redirectTo?) End KP + Shopify session
handleDOMUpdate() Re-scan DOM for new login buttons (call on
SPA route change)
kpUpdateDOM() Lower-level alias for handleDOMUpdate
(called automatically on script load)
'kp_data_sent' event Login result
'kp-script-loaded' event Fires once on script load (vanilla pattern)
```
```
Function / Event Description
```

