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
  const onSubmit = (bestTexts) => {
    if (bestTexts) {
      const best = {
        id: uuidv4(),
        name: bestTexts.name,
        price: bestTexts.price,
        image: bestTexts.image,
        descript: bestTexts.descript,
        like: false
      }
      update(datas => {
        console.debug(datas)
        datas.push(best)
        return datas;
      })
    }
  }
  return {
    subscribe,
    onToggle,
    onRemove,
    onSubmit
  }
}

const setFormBest = () => {
  let formText = {
    name: '',
    price: '',
    image: '',
    descript: ''
  }
  const { subscribe, update, set } = writable(formText);

  const resetForm = () => {
    set({ name: '', price: '', image: '', descript: '' })
  }  

  return {
    subscribe,
    set,
    resetForm,
  }
}

export const bests = setBestData();
export const bestTexts = setFormBest();