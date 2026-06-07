import { ref } from 'vue'

export const activeSFormId = ref(null)
export let sformInstanceSeed = 0

export function nextSFormInstanceId() {
  sformInstanceSeed += 1
  return sformInstanceSeed
}