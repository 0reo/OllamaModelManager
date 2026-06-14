# Vendored Deep Chat bundle

`deepChat.bundle.js` is the [Deep Chat](https://github.com/OvidijusParsiunas/deep-chat)
web component, vendored locally so the chat UI loads with **no runtime CDN
dependency** (works offline / LAN-only / behind Tailscale).

- **Pinned version:** `2.4.2`
- **Referenced from:** `public/index.html` (`<script type="module" src="/vendor/deep-chat/deepChat.bundle.js" integrity="sha384-…">`)
- **SRI integrity:** `sha384-ire02ARbuqxh1f0vqLCtjJKh6BVWbziZzoiPht9u+EwKaLagZ6ESBXsXp+A8+x6m`

The `integrity` attribute is kept even though the file is now same-origin: the
browser still verifies the bundle hasn't been altered on disk/in transit.

## Updating to a new version

From a temp directory:

```sh
npm pack deep-chat@<new-version>
tar xzf deep-chat-<new-version>.tgz
# copy the bundle into the repo
cp package/dist/deepChat.bundle.js <repo>/public/vendor/deep-chat/deepChat.bundle.js
# compute the new SRI hash
echo "sha384-$(openssl dgst -sha384 -binary package/dist/deepChat.bundle.js | openssl base64 -A)"
```

Then in `public/index.html` update **both** the pinned version in the comment and
the `integrity="sha384-…"` value to the hash printed above.

> Sanity check: the hash you compute from `npm pack` must match the `integrity`
> you put in the HTML, or the browser will refuse to load the bundle (and chat
> will silently not initialise).
