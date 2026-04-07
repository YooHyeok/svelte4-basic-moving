<script>
  import { fade } from 'svelte/transition'
  let visible = false;

  const handleMouseenter = e => (visible = true);
  const handleMouseleave = e => (visible = false);
</script>
<svelte:body on:mouseenter={handleMouseenter} on:mouseleave={handleMouseleave} />
<div>
  <h2>03) body - body 마우스오버 미/출력 처리</h2>
  {#if visible}
    <div class="centered" out:fade>
      {#each 'SVELTE' as char, i}
        <span in:fade|global={{ delay: i * 150, duration: 800 }}>{ char }</span>
      {/each}
    </div>
  {/if}
</div>
<style>
  .centered {
    font-size: 20vw; position: absolute;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Overpass';
    letter-spacing: 0.12em;
    color: #676778; font-weight: 400;
  }
  .centered span { will-change: filter; }
</style>