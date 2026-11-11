/** Where feedback about Kirjavõlu goes: a plain e-mail, nothing about the child leaves the browser. */
export const FEEDBACK_EMAIL = 'info@kirjavolu.ee'

export const FEEDBACK_MAILTO = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Kirjavõlu tagasiside')}&body=${encodeURIComponent('Tere!\n\n')}`
