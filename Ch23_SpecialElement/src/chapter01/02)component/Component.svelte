<script>
  import Food01 from "./Food01.svelte";
  import Food02 from "./Food02.svelte";
  import Food03 from "./Food03.svelte";
  const options = [
    { name: '햄버거', component: Food01 },
    { name: '피자', component: Food02 },
    { name: '치킨', component: Food03 },
  ]
  let selected = options[0]
</script>
<div>
  <h2>02)Component</h2>
  <h3>음식을 선택하세요.</h3>
  <select bind:value={selected}>
    {#each options as option (option.name)}
      <option value={option}>{option.name}</option>
    {/each}
  </select>
  <!-- {#if selected.name == '햄버거'} 
    <Food01 />
  {:else if selected.name == '치킨'}
    <Food02 />
  {:else}
    <Food03 />
  {/if} -->
  <svelte:component this={selected.component} />
</div>