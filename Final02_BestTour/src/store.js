import { writable } from "svelte/store";
import { initialBests } from "./bestData";

import { v4 as uuidv4 } from 'uuid'

/* 커스텀 스토어 */
const setBestData = () => {
  const { subscribe, update } = writable(initialBests);
  return {
    subscribe
  }
}

export const bests = setBestData();