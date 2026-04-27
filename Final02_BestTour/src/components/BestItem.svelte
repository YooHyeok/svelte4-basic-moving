<script>
  import Icon from "@iconify/svelte"
  export let best
  const { id, name, price, descript, image, like } = best

</script>
<li>
  <a href="#!">
    <img src={image} alt={name}>
    <button class="likebox">
      {#if like}
         <Icon icon="tdesign:heart-filled" />
         {:else}
         <Icon icon="tdesign:heart" />
      {/if}
    </button>
    <div class="box">
      <h4>{name}</h4>
      <h5>{price.toString().replace(/\B(?=(\d{3})*(?!\d))/g,",")}</h5>
      <p>{descript}</p>
      <button><Icon icon="gridicons:trash" /></button>
    </div>
  </a>
</li>