<script>
  import Error from "../components/common/Error.svelte";
  import ListSub from "../components/common/ListSub.svelte";
  import MainLoading from "../components/common/MainLoading.svelte";
  
  import { upcomings, genres } from "../libs/store"

  const promise = Promise.all([$upcomings, $genres])
  export let id;
</script>

{#await promise}
  <MainLoading/>
{:then [now, genres]}
  <ListSub {id} datas={now.data.results} genres={genres.data.genres}/>
{:catch error}
  <Error/>
{/await}