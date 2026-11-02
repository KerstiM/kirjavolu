import type { ChildProfile, GeneratedContent } from '../domain/models'
import { migrate, type PersistedState } from '../utils/storage'

/**
 * Moving from kerstim.github.io/kirjavolu to kirjavolu.ee. Browser storage belongs to
 * one address, so the old page hands its children, creations and pictures to the new
 * one through a window it opens itself (postMessage). Both sides accept messages only
 * from the other's exact origin; nothing passes through a server.
 */
export const TRANSFER_VERSION = 1
export const MOVED_KEY = 'kirjavolu.moved'

export interface TransferImage {
  id: string
  dataUrl: string
}

export type TransferMessage =
  | { type: 'kirjavolu-ready' }
  | { type: 'kirjavolu-data'; version: number; state: unknown; images: TransferImage[] }
  | { type: 'kirjavolu-done'; children: number; creations: number }

export function isTransferMessage(value: unknown): value is TransferMessage {
  if (typeof value !== 'object' || value === null) return false
  const type = (value as { type?: unknown }).type
  return type === 'kirjavolu-ready' || type === 'kirjavolu-data' || type === 'kirjavolu-done'
}

/** Ids of every picture the creations use: the shared one and each child's own. */
export function imageIds(creations: GeneratedContent[]): string[] {
  const ids = creations.flatMap((creation) => [
    creation.decoration?.image?.id,
    ...Object.values(creation.decoration?.childDecorations ?? {}).map((own) => own.image?.id),
  ])
  return [...new Set(ids.filter((id): id is string => typeof id === 'string'))]
}

const looksLikeChild = (child: unknown): child is ChildProfile =>
  typeof child === 'object' && child !== null && typeof (child as ChildProfile).id === 'string' && typeof (child as ChildProfile).name === 'string'

const looksLikeCreation = (creation: unknown): creation is GeneratedContent =>
  typeof creation === 'object' &&
  creation !== null &&
  typeof (creation as GeneratedContent).id === 'string' &&
  Array.isArray((creation as GeneratedContent).items)

/**
 * What the old address brings that this one does not have yet. Children and
 * creations already here (same id) are kept as they are, so a second transfer adds nothing.
 */
export function newFromTransfer(
  current: Pick<PersistedState, 'children' | 'creations'>,
  incoming: unknown,
): { children: ChildProfile[]; creations: GeneratedContent[] } {
  const state = migrate(incoming)
  const childIds = new Set(current.children.map((child) => child.id))
  const creationIds = new Set(current.creations.map((creation) => creation.id))
  return {
    children: state.children.filter(looksLikeChild).filter((child) => !childIds.has(child.id)),
    creations: state.creations.filter(looksLikeCreation).filter((creation) => !creationIds.has(creation.id)),
  }
}

/** The page path without the old address's /kirjavolu/ prefix, e.g. "/looming/abc?x=1". */
export function pathOnNewAddress(location: Pick<Location, 'pathname' | 'search' | 'hash'>, base: string): string {
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base
  const path = prefix && location.pathname.startsWith(prefix) ? location.pathname.slice(prefix.length) : location.pathname
  return `${path || '/'}${location.search}${location.hash}`
}

export function readMoved(storage: Storage | undefined = safeStorage()): boolean {
  try {
    return !!storage?.getItem(MOVED_KEY)
  } catch {
    return false
  }
}

export function markMoved(storage: Storage | undefined = safeStorage()): void {
  try {
    storage?.setItem(MOVED_KEY, new Date().toISOString())
  } catch {
    // The banner then just keeps offering the transfer.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}
