<script>
  const options = ['h1', 'h3', 'p']
  let selected = options[0]
</script>
<div>
  <h2>03)Element</h2>
  <h3>음식을 선택하세요.</h3>
  <select bind:value={selected}>
    {#each options as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
  <svelte:element this={selected}>
    현재 요소는 {selected} 입니다.
  </svelte:element>
</div>