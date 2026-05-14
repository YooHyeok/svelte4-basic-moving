<script>
  import { links, link } from "svelte-routing"
  import Icon from "@iconify/svelte"
  import { onMount } from "svelte";

  onMount(() => {
    window.addEventListener("scroll", handleScroll)
    /* const timer = setInterval(() => {
    }, 100) */
    return () => {
      /* clearInterval(timer) */
      window.removeEventListener("scroll", handleScroll)
    }
  })
  let active = false
  const handleScroll = () => {
    let windowTop = window.scrollY;
    if (windowTop > 50) {
      active = true;
      return;
    }
    active = false;
  }
  let current = '';
  
</script>
<header class:active>
  <h1><a href={`${CONFIG.BASE_URL}/`} use:link class:active={current === ''} on:click={() => current = ''}><img src="img/moving_logo.svg" alt="무빙로고"></a></h1>
  <ul use:links>
    <li>
      <Icon icon="ic:round-live-tv" color="white" height="28" />
      <a href={`${CONFIG.BASE_URL}/now`} class:active={current === 'now'} on:click={() => current = 'now'}>현재상영작</a>
    </li>
    <li>
      <a href={`${CONFIG.BASE_URL}/popular`} class:active={current === 'popular'} on:click={() => current = 'popular'}>인기영화</a>
    </li>
    <li>
      <a href={`${CONFIG.BASE_URL}/upcoming`} class:active={current === 'upcoming'} on:click={() => current = 'upcoming'}>개봉예정작</a>
    </li>
    <li>
      <a href={`${CONFIG.BASE_URL}/top`} class:active={current === 'top'} on:click={() => current = 'top'}>높은평점</a>
    </li>
  </ul>
</header>