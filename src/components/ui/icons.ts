import type { Component } from 'vue'
import {
  Award,
  Backpack,
  BookOpen,
  Cake,
  CalendarDays,
  Drama,
  Egg,
  Ghost,
  HeartHandshake,
  KeyRound,
  Mail,
  Map as MapIcon,
  MountainSnow,
  Smile,
  Sparkles,
  Sun,
  TreePine,
} from 'lucide-vue-next'

/** Icons referenced by name from domain data (content types, occasions). */
export const ICONS: Record<string, Component> = {
  Award,
  Backpack,
  BookOpen,
  Cake,
  CalendarDays,
  Drama,
  Egg,
  Ghost,
  HeartHandshake,
  KeyRound,
  Mail,
  Map: MapIcon,
  MountainSnow,
  Smile,
  Sparkles,
  Sun,
  TreePine,
}

export function iconFor(name: string): Component {
  return ICONS[name] ?? Sparkles
}
