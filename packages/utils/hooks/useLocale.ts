import { computed, isRef, ref, unref } from 'vue'
import { deepGet } from '../shared'
import { en } from '../locale'
import { useGlobalConfig } from './useGlobalConfig'
import type { language } from '../locale'
import type { Ref } from 'vue'
import type { MaybeRef } from '../types'

export type OnuTranslatorOption = Record<string, string | number>
export type OnuTranslator = (path: string, option?: OnuTranslatorOption) => string
export interface OnuLocaleContext {
  locale: Ref<language>
  lang: Ref<string>
  t: OnuTranslator
}

export const translate = (path: string, option: OnuTranslatorOption | undefined, locale: language) => {
  return (deepGet(locale, path, path) as string).replace(/\{(\w+)\}/g, (_, key) => `${option?.[key] ?? `{${key}}`}`)
}

export const buildTranslator = (locale: MaybeRef<language>): OnuTranslator => (path, option) => translate(path, option, unref(locale))

export const buildLocaleContext = (locale: MaybeRef<language>): OnuLocaleContext => {
  const lang = computed(() => unref(locale).name)
  const RefLocale = isRef(locale) ? locale : ref(locale)

  return {
    locale: RefLocale,
    lang,
    t: buildTranslator(locale),
  }
}

export function useLocale() {
  const locale = useGlobalConfig('locale')
  return buildLocaleContext(computed(() => locale.value || en))
}
