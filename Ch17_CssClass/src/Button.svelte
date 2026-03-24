<script>
  let current = 'first';
</script>

<div>
  <h1>2)class directive - 기본 문법</h1>
  <button class:active={current === 'first'} on:click={() => current = "first"}>첫번째 버튼</button>
  <button class:active={current === 'second'} on:click={() => current = "second"}>두번째 버튼</button>
  <button class:active={current === 'third'} on:click={() => current = "third"}>세번째 버튼</button>
  <p>{current}</p>
</div>

<style>
  button{
    border: none; border-radius: 5px; background-color: #ededed; 
    padding: 5px 20px; cursor: pointer;
  }
  button::after{ content: ' - 비활성'; }
  .active{ background-color: cornflowerblue; color: white; }
  .active::after{ content: ' - 활성'; }
</style>