/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Umami website id; set only for the published site, so development is never counted. */
  readonly VITE_UMAMI_WEBSITE_ID?: string
  /** Hosts that are counted, e.g. "kerstim.github.io". */
  readonly VITE_UMAMI_DOMAINS?: string
}
