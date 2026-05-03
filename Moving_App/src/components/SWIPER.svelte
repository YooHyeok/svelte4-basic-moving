<script>
	const urls = [
		'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fk0adz%2Fbtsydna0uHj%2FAAAAAAAAAAAAAAAAAAAAAOWukE3A4Q_JH8SouR7GFkgpy-IuXUIVMoUTkqJ-1MX9%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3DXhiNPriHvjGQqqCXJtZ2YkuEPN8%253D',
		'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fbmakiu%2FbtsyenIDeD8%2FAAAAAAAAAAAAAAAAAAAAAK3FkNnN-WrZrr7HLxnz1FF3Y4IEOtrP8QnXRixNTzW3%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3DmZSzRmWql5ebleBQSxnb0qe9h7g%253D',
		'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fl6QZI%2FbtsynB6Vt9I%2FAAAAAAAAAAAAAAAAAAAAAFYj8_st59xrSI6JVqssepE19-9o98snrC01JPhQA1HY%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3DZlNeFRk32iIGab70Vr2eKgRyEa0%253D',
		'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbaN3Yb%2FbtsypwK3WoE%2FAAAAAAAAAAAAAAAAAAAAAP7YIBJUOfJfundDX4ZoyTgRB2k3QWhAEmhb6fo83wrK%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3Di%252FY47saXiwMm3t2r41r8QHnkYOQ%253D',
		'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcfnV8L%2FbtsyaUglYOD%2FAAAAAAAAAAAAAAAAAAAAAE53IFR-ZBQ04gF7rns37zvrgxyLfHfhFBcoBd-myVCo%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3DxwBHeaypwE6Od1qYQWNMn2%252BgVp8%253D'
	];

  // import Swiper core and required modules
  import { Navigation, Pagination } from 'swiper'; // 버튼 모듈 처리
  
  // Import Swiper Svelte components
  import { Swiper, SwiperSlide } from 'swiper/svelte';

  // Import Swiper styles
  import 'swiper/css';
  import 'swiper/css/navigation';
  import 'swiper/css/pagination';
  export let promise;
</script>

<div class="photo">
  {#await promise}
	 <p>loading...</p>
  {:then value}
    <Swiper
    modules={[Navigation, Pagination]}
    spaceBetween={50}
    slidesPerView={5}
    loop={true}
    navigation
    pagination={{ clickable: true }}
  >
    {#each value.data.results as movie, i}
       <SwiperSlide>
          <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt="여행이미지" width="300">
       </SwiperSlide>
    {/each}
  </Swiper>
  {:catch error}
    <p>{error.message} : 에러가 발생되었습니다.</p>
  {/await}
</div>

<style>
	.photo{ width: 1700px; margin: 0 auto; }
</style>

