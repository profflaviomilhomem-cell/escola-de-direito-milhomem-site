// jest.setup.js
require("@testing-library/jest-dom");

// Polyfills do Node para o ambiente jsdom
const { TextEncoder, TextDecoder } = require("node:util");
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

// `structuredClone` é global no Node 17+, mas o jsdom não o expõe.
// `jose` usa para clonar claims antes de assinar.
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (value) =>
    value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

// WebCrypto: jose usa `crypto.subtle` para HS256. jsdom não expõe.
const { webcrypto } = require("node:crypto");
if (typeof global.crypto === "undefined" || !global.crypto.subtle) {
  // O `webcrypto` do Node implementa a mesma interface da WebCrypto API.
  global.crypto = webcrypto;
}

// Mock de matchMedia (só no ambiente jsdom; testes com
// `@jest-environment node` não têm `window`).
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
