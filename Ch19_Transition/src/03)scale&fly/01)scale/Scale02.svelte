<script>
  import { scale } from 'svelte/transition'
  let visible = false
</script>
<div>
  <h4>scale - 파라미터</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p transition:scale={{ start: 0.5 }}>Svelte Scale Effect</p>
  {/if}
</div>
<style>
  p {
    height: 100px;
    background-color: orange;
  }
</style>