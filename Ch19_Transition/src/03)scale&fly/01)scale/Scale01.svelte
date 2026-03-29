<script>
  import { scale } from 'svelte/transition'
  let visible = false
</script>
<div>
  <h4>scale - 기본예제</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p transition:scale>Svelte Scale Effect</p>
  {/if}
</div>
<style>
  p {
    height: 100px;
    background-color: orange;
  }
</style>