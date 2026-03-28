<script>
  import { fade } from 'svelte/transition'
  import { elasticInOut } from 'svelte/easing'
  
  let visible = false
</script>
<div>
  <h4>fade - 파라미터와 easing</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p 
    transition:fade={{
      delay: 500, // 0.5초 딜레이 후 출력
      duration: 1000, // 1초간 변화
      easing: elasticInOut, // easing의 경우 slide나 fly등 움직이는 효과에 주는것이 더 디테일하게 보인다. fade는 위치를 유지하며 출력되는 효과이므로, 움직임이 없어 다이나믹한 효과를 기대하기 어렵다.
    }}
  >Svelte Fade Effect</p>
  {/if}
</div>