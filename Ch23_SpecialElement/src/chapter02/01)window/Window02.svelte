<script>
  let y;

</script>
<svelte:window bind:scrollY={y}/>
<div>
  <h2>01) window02 - 스크롤바 좌표 예제(우측 상단)</h2>
  <!-- <div class="div"></div> -->
  <h3>스크롤바 좌표 : {y}</h3>
</div>

<style>
    .div{ height: 2000px; }
    h3{ position: fixed; right: 10px; top: 10px; }
</style>