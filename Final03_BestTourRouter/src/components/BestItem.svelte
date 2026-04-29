<script>
  import { bests } from "../store"
  import Icon from "@iconify/svelte"
  export let best
  const { id, name, price, descript, image, like } = best
  const { onToggle, onRemove } = bests
</script>
<li>
    <img src={image} alt={name}>
    <button class="likebox" on:click={() => onToggle(id)}>
      {#if like}
        <Icon icon="tdesign:heart-filled" />
      {:else}
        <Icon icon="tdesign:heart" />
      {/if}
    </button>
    <div class="box">
      <h4><a href={`/${id}?like=${like}`}>{name}</a></h4>
      <h5>{price.toString().replace(/\B(?=(\d{3})*(?!\d))/g,",")}</h5>
      <p>{descript}</p>
      <button on:click={() => onRemove(id)}><Icon icon="gridicons:trash" /></button>
    </div>
</li>
