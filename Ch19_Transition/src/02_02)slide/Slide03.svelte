<script>
  import { slide } from 'svelte/transition'
  
  let visible = false
</script>
<div>
  <h4>slide - in: out:</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p 
    in:slide={{ axis:"y" }}
    out:slide={{ axis:"x" }}
  >Svelte Slide Effect</p>
  {/if}
</div>
<style>
  p {
    height: 100px;
    background-color: orange;
  }
</style>