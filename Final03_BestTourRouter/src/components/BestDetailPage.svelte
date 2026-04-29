<script>
  import { bests } from "../store"
  import { afterUpdate } from "svelte";
  import { navigate } from "svelte-routing";
  import Icon from "@iconify/svelte"
  import queryString from "query-string"

  export let id
  let best;
  $: if (!best) {
    navigate("/", { replace: true });
  }

  let parsed = queryString.parse(window.location.search)
  const fetchBest = () => {
    best = $bests.find(b => b.id == id)
    parsed = queryString.parse(window.location.search)
  }

  fetchBest() // 마운트 전 즉시 호출하여 초기 렌더링 시점에 값 준비
  afterUpdate(() => {
    fetchBest()
  })
  $: ({ name, price, descript, image, like } = best || {}) // 좋아요 구현
  const { onToggle, onRemove } = bests
</script>
{#if best}
<div class="bestpage">
  <img src={image} alt={name}>
  <div class="textwrap">
    <h4>
      <span on:click={() => onRemove(id)}><Icon  icon="gridicons:trash" /></span>
      <span on:click={() => onToggle(id)}>
        {#if like }
          <Icon icon="tdesign:heart-filled" />
        {:else}
          <Icon icon="tdesign:heart" />
        {/if}
      </span>
      {name}
    </h4>
    <p>{descript}</p>
    <span>>₩ {price.toString().replace(/\B(?=(\d{3})*(?!\d))/g,",")}</span>
    <button>신청하기</button>
    <!-- <button>삭제</button> -->
  </div>
</div>
{/if}

  
