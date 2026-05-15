<script>
  import { onMount } from "svelte"
  import { routeHref, tmdbImage } from "../../libs/router";
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import { Autoplay, Pagination, EffectFade } from "swiper";

  import 'swiper/css'
  import 'swiper/css/autoplay'
  import 'swiper/css/pagination'
  import 'swiper/css/effect-fade'

  export let datas;

  let mains = [];
  const random = Math.floor(Math.random() * 15);
  mains = datas.slice(random, random + 5)

  let swiper;
  onMount(() => {
    const swiperinstance = document.querySelector('.mainSwiper').swiper;
    swiper = swiperinstance
  })

  let cnt = false;
  const onHandleClick = () => {
    if (cnt) {
      swiper.autoplay.start();
      return;
    }
    swiper.autoplay.stop();
    cnt = !cnt
  }
</script>

<main>
  <Swiper
    modules={[Autoplay, Pagination, EffectFade]}
    pagination={{clickable: true}}
    effect={'fade'}
    autoplay={{
      delay: 3000,
      ableOnInteraction: false,
    }}
    class="mainSwiper"
    bind:this={swiper}
  >
    {#each mains as main, index (main)}
      <SwiperSlide>
        <img src={tmdbImage(main.backdrop_path, 'w1280')} alt={main.title}>
        <h3>{main.title}</h3>
        <p>
          {#if main.overview === ''}
            새롭게 개봉한 [{main.title}]를 만나볼까요?
          {:else}
            {main.overview}
          {/if}
        </p>
        <a href={routeHref(`/now/${main.id}`)}>자세히보기</a>
      </SwiperSlide>
    {/each}
  </Swiper>
  <div class="swiper-playpause">
    <button
      class="btn_pause"
      class:active={cnt === true}
      on:click={onHandleClick}
    >
    </button>
    <button
      class="btn_play"
      class:active={cnt === false}
      on:click={onHandleClick}
    >
    </button>
  </div>
</main>
