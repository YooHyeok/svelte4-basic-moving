<script>
  /* 인라인 스타일 시트 (동적으로 변경되는 값에 사용) */
  let color01 = 'pink';
</script>
<div>
  <h1>1) Svelte css 기본 - 인라인 style sheet</h1>
  <h3>제목태그1</h3>
  <h4 class="title02">제목태그2</h4>
  <h5 style="color: {color01}">{color01}</h5> <!-- 인라인 스타일 -->
</div>
<style>
  /* 내부 스타일 시트 */
  h3 {
    background-color: black;
    color: pink;
  }
  .title02 {
    background-color: black;
    color: yellow;
  }
</style>