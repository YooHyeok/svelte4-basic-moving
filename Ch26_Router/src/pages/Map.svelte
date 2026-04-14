<script>
  import { links } from "svelte-routing";
  
  export let id; // 라우트 url 파라미터

  const storeDatas = [
    {
      id: 1,
      name: '강남에비뉴점',
      addr: '서울특별시 서초구 서초대로77길 62'
    },
    {
      id: 2,
      name: '강남역신분당역사점',
      addr: '서울특별시 강남구 강남대로 396'
    },
    {
      id: 3,
      name: '강남우성점',
      addr: '서울특별시 강남구 강남대로 328'
    }
  ];
</script>
<section>
  <h2>오시는길 페이지입니다.</h2>
  <ul use:links>
    {#each storeDatas as storeData, index(storeData)}
      <li><a href={`/map/${storeData.id}`}>스토어{storeData.id}</a></li>
    {/each}
  </ul>
  <h3>{ storeDatas[id-1].name }</h3>
  <p>{ storeDatas[id-1].addr }</p>
  <img src="http://Placehold.co/300x200" alt="">
</section>
<style>
  h2 { background-color: aquamarine; }
</style>