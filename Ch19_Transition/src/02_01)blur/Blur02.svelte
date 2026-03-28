<script>
  import { blur } from 'svelte/transition'
  let visible = false
</script>
<div>
  <h4>blur - 파라미터</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p transition:blur={{ amount: 50 }}>Svelte Blur Effect</p>
  {/if}
</div>
<style>
  p {
    height: 100px;
    background-color: orange;
  }
</style>