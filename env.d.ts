/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Umami website id; set only for the published site, so development is never counted. */
  readonly VITE_UMAMI_WEBSITE_ID?: string
  /** Hosts that are counted, comma-separated, e.g. "kerstim.github.io,kirjavolu.ee". */
  readonly VITE_UMAMI_DOMAINS?: string
  /** Old address only: the new address, e.g. "https://kirjavolu.ee". Shows the moving banner. */
  readonly VITE_MOVED_TO?: string
  /** New address only: the old origin allowed to hand over its data, e.g. "https://kerstim.github.io". */
  readonly VITE_TRANSFER_FROM?: string
}
