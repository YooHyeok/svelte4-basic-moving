<script>
  // import Recursive from "./Recursive.svelte";
  export let count;
</script>
<div>
  {#if count > 0}
    <p>카운트다운... {count}</p>
    <!-- <Recursive count={ count - 1 }/> -->
    <svelte:self count={ count - 1 }/>
  {:else}
    <p>발사!</p>
  {/if}
</div>