import { describe, expect, it } from 'vitest'
import { externalBrowserUrl, isInAppBrowser, platformOf } from '@/features/inapp/inAppBrowser'

const IG_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0 (iPhone14,5; iOS 17_5; et_EE)'
const IG_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0 Mobile Safari/537.36 Instagram 330.0.0.0 Android'
const FB_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 [FBAN/FBIOS;FBAV/470.0]'
const SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36'

describe('in-app browser', () => {
  it('recognises Instagram and Facebook but not the phone browsers', () => {
    expect(isInAppBrowser(IG_IOS)).toBe(true)
    expect(isInAppBrowser(IG_ANDROID)).toBe(true)
    expect(isInAppBrowser(FB_IOS)).toBe(true)
    expect(isInAppBrowser(SAFARI)).toBe(false)
    expect(isInAppBrowser(CHROME)).toBe(false)
  })

  it('opens Chrome on Android; iPhones get only the menu steps', () => {
    expect(platformOf(IG_ANDROID)).toBe('android')
    expect(platformOf(IG_IOS)).toBe('ios')
    expect(externalBrowserUrl('https://kirjavolu.ee/looming/abc?x=1', 'android')).toBe(
      'intent://kirjavolu.ee/looming/abc?x=1#Intent;scheme=https;package=com.android.chrome;end',
    )
    expect(externalBrowserUrl('https://kirjavolu.ee/looming/abc', 'ios')).toBeNull()
    expect(externalBrowserUrl('https://kirjavolu.ee/', 'other')).toBeNull()
  })
})
