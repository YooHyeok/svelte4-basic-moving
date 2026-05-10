<script>
  import Error from "../components/common/Error.svelte";
  import LoadingList from "../components/common/LoadingList.svelte";
  import UpComingList from "../components/sub/UpComingList.svelte";
  import { upcomings } from "../libs/store"
  const promise = $upcomings
</script>

{#await promise}
  <LoadingList/>
{:then value}
  <UpComingList datas={value.data.results}/>
{:catch error}
  <Error/>
{/await}