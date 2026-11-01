/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Umami website id; set only for the published site, so development is never counted. */
  readonly VITE_UMAMI_WEBSITE_ID?: string
  /** Hosts that are counted, comma-separated, e.g. "kerstim.github.io,kirjavolu.ee". */
  readonly VITE_UMAMI_DOMAINS?: string
}
