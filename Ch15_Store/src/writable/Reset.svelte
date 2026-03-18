<script>
  import { count } from '../store/writable'
  const reset = () => count.set(0)
</script>
<button on:click={reset}>reset</button>