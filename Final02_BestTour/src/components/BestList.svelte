<script>
  import { bests } from "../store"
  import BestItem from "./BestItem.svelte";


</script>
<ul>
  {#each $bests as best (best)}
    <BestItem {best}/>
  {/each}
</ul>
