<script>
  import H2Title from "../common/H2Title.svelte";
  import { routeHref, tmdbImage } from "../../libs/router";
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import { Navigation } from "swiper";

  import 'swiper/css'
  import 'swiper/css/navigation'

  export let datas;
</script>

<section class="list_box">
  <H2Title name="새로 개봉한 현재 상영작"/>
  <Swiper
    modules={[Navigation]}
    spaceBetween={10}
    sildesPerView={7.2}
    navigation={true}
  >
    {#each datas as now, index (now)}
      <SwiperSlide>
        <a href={routeHref(`/now/${now.id}`)}>
          <figure>
            <div class="img_wrap">
              <img src={tmdbImage(now.poster_path, 'w500')} alt={now.title}>
            </div>
            <figcaption>{now.title}</figcaption>
          </figure>
        </a>
      </SwiperSlide>
    {/each}
  </Swiper>
</section>
