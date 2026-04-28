import { writable } from "svelte/store";
import { initialBests } from "./bestData";

import { v4 as uuidv4 } from 'uuid'

/* 커스텀 스토어 */
const setBestData = () => {
  const { subscribe, update } = writable(initialBests);
  
  const onToggle = (id) => {
    update(datas => {
      const setDatas = datas.map(best => {
        return best.id === id ? { ...best, like: !best.like } : best;
      })
      datas = setDatas;
      return datas;
    })
  }
  const onRemove = (id) => {
    update(datas => {
      const setDatas = datas.filter(best => {
        return best.id !== id;
      })
      datas = setDatas;
      return datas;
    })
  }
  return {
    subscribe,
    onToggle,
    onRemove
  }
}

export const bests = setBestData();