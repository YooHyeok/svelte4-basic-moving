<script>
  import { slide } from 'svelte/transition'
  let visible = false
</script>
<div>
  <h4>slide - 파라미터</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p transition:slide={{ axis: "y" }}>Svelte Slide Effect</p>
  {/if}
</div>
<style>
  p {
    height: 100px;
    background-color: orange;
  }
</style>