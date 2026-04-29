<script>
  import { bests } from "../store"
  import { links } from "svelte-routing"
  import BestItem from "./BestItem.svelte";
  import BestCreate from "./BestCreate.svelte";
  
</script>
<ul use:links>
  {#each $bests as best (best)}
    <BestItem {best}/>
  {/each}
</ul>
<BestCreate/>