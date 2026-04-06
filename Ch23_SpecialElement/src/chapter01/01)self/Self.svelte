<script>
  import Recursive from "./Recursive.svelte";
  export let count;
</script>
<div>
  <h2>01)Self</h2>
  <Recursive count={ 5 }/>
</div>