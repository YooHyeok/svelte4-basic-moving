<script>
  import { blur } from 'svelte/transition'
  
  let visible = false
</script>
<div>
  <h4>blur - in: out:</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p 
    in:blur={{ amount:"50px" }}
    out:blur={{ amount:0 }}
  >Svelte Blur Effect</p>
  {/if}
</div>
<style>
  p {
    height: 100px;
    background-color: orange;
  }
</style>