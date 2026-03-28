<script>
  import { fade } from 'svelte/transition'
  
  let visible = false
</script>
<div>
  <h4>fade - in: out:</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p 
    in:fade={{ duration:400 }}
    out:fade={{ duration:0 }}
  >Svelte Fade Effect</p>
  {/if}
</div>