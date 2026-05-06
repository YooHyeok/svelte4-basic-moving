<script>
  import Error from "../components/common/Error.svelte";
  import LoadingList from "../components/common/LoadingList.svelte";
  import NowList from "../components/sub/NowList.svelte";
  import { nowPromise } from "../libs/store"
  import { nows } from "../libs/store"
  const promise = $nowPromise
</script>

{#await promise}
  <LoadingList/>
{:then value}
  <NowList datas={value.data.results}/>
{:catch error}
  <Error/>
{/await}