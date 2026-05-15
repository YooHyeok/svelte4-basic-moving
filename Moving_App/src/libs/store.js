import axios from "axios"
import { writable } from "svelte/store"

const setDatas = (url) => {
  const options = {
    method: 'GET',
    url,
    params: {
      language: 'ko',
      page: '1'
    },
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNDdjYzYzMzBhZGRlNDk4OWEzMTRjYTk4NjZjNWM0YSIsIm5iZiI6MTcwOTA0ODU3OC4xMTM5OTk4LCJzdWIiOiI2NWRlMDMwMmE4OTRkNjAxODcwZDgzYjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Uq_kyfrmNB3wyRJIQKmw7L9MI0E4sdx3al8c_N1t8QU'
    }
  };
  const getDatas = async () => {
    try {
      const res = await axios.request(options)
      return res;
    } catch (error) {
      throw error
    }
  }
  const { subscribe } = writable(getDatas())
  return {
    subscribe,
  }
}

const setGenres = (url) => {
  const options = {
    method: 'GET',
    url,
    params: {
      language: 'ko',
    },
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNDdjYzYzMzBhZGRlNDk4OWEzMTRjYTk4NjZjNWM0YSIsIm5iZiI6MTcwOTA0ODU3OC4xMTM5OTk4LCJzdWIiOiI2NWRlMDMwMmE4OTRkNjAxODcwZDgzYjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Uq_kyfrmNB3wyRJIQKmw7L9MI0E4sdx3al8c_N1t8QU'
    }
  };
  const getGenres = async () => {
    try {
      const res = await axios.request(options)
      return res;
    } catch (error) {
      throw error
    }
  }
  const { subscribe } = writable(getGenres())
  return {
    subscribe,
  }
}

const BASIC_URL = "https://api.themoviedb.org/3/movie/"

export const nows = setDatas(`${BASIC_URL}now_playing`);
export const populars = setDatas(`${BASIC_URL}popular`);
export const tops = setDatas(`${BASIC_URL}top_rated`);
export const upcomings = setDatas(`${BASIC_URL}upcoming`);
export const genres = setGenres('https://api.themoviedb.org/3/genre/movie/list');
