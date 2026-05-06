<script>
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import { Navigation } from "swiper";

  import 'swiper/css'
  import 'swiper/css/navigagtion'

  let loadingArray = [];
  for (let i = 0; i < 20; i++) loadingArray.push("")
</script>
<section class="list_box">
  <h2 class="ex">예시 타이틀</h2>
  <Swiper
    modules={[Navigation]}
    spaceBetween={10}
    sildesPerView={7.2}
    navigation={true}
  >
    {#each loadingArray as loading, index}
      <SwiperSlide>
        <figure class="ex">
          <div class="img_wrap"></div>
          <figcaption></figcaption>
        </figure>
      </SwiperSlide>
    {/each}
  </Swiper>
</section>