<script>
  let key, keyCode;
  
  const handleKeydown = e => {
    key = e.key;
    keyCode = e.keyCode;
  }

</script>
<svelte:window on:keydown={handleKeydown}/>
<div>
  <h2>01) window - 키입력 예제</h2>
  {#if key}
    <kbd><!-- kbd: 키보드 입력, 음성 입력 등 임의의 장치를 사용한 사용자의 입력 출력을 표현하는 시멘틱 태그 -->
      { key === '' ? 'space' : key }
    </kbd>
    <p>keyCode: { keyCode }</p>
  {:else}
    <p>창을 클릭 후 키보드를 눌러주세요.</p>
  {/if}
</div>

<style>
  div{
    display: flex; height: 100%; 
    text-align: center; align-items: center;
    justify-content: center; flex-direction: column;
  }
  kbd{
    background-color: #eee; border-radius: 3px;
    border: 1px solid #b4b4b4;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),
    0 2px 0 0 rgba(255, 255, 255, 0.7) inset;
    color: #333; display: inline-block;
    font-size: 0.85em; font-weight: 700;
    line-height: 1; padding: 0.2em 0.5em;
    font-size: 20px; white-space: nowrap;
  }
</style>