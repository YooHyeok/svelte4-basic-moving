console.log(window.location)
const HOSTNAME = window.location.hostname
const CONFIG = {
  BASE_URL: ['localhost', '127.0.0.1'].includes(HOSTNAME) ? '' : '/svelte4-basic-moving'
}