<script>
  import Error from "../components/common/Error.svelte";
  import LoadingList from "../components/common/LoadingList.svelte";
  import TopList from "../components/sub/TopList.svelte";
  import { tops } from "../libs/store"
  const promise = $tops
</script>

{#await promise}
  <LoadingList/>
{:then value}
  <TopList datas={value.data.results}/>
{:catch error}
  <Error/>
{/await}