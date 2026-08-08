/// <reference types="astro/client" />

interface Turnstile {
  reset: () => void;
}

interface Window {
  turnstile?: Turnstile;
}
