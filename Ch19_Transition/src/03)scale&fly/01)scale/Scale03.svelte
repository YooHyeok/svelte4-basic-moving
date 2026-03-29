<script>
  import { scale } from 'svelte/transition'
  
  let visible = false
</script>
<div>
  <h4>scale - in: out:</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p 
    in:scale={{ start: 0.33 }}
    out:scale={{ start: 0.66 }}
  >Svelte Scale Effect</p>
  {/if}
</div>
<style>
  p {
    height: 100px;
    background-color: orange;
  }
</style>