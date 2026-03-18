<script>
  import { count } from '../store/writable'
  const increment = () => count.update(n => n + 1)
</script>
<button on:click={increment}>+</button>