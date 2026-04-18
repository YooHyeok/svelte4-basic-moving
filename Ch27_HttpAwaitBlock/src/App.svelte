<script>
  import FetchEachElse from './FetchEachElse.svelte';
  import AxiosEachElse from './AxiosEachElse.svelte';
  import AxiosAwaitBlock from './AxiosAwaitBlock.svelte';
</script>



<h1>회원 정보</h1>
<div class="comments">
  <FetchEachElse />
  <AxiosEachElse />
  <AxiosAwaitBlock />
</div>
<style>
  .comments {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 8px;
  }
</style>