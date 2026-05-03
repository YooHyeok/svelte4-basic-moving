<script>
    import SWIPER from "./SWIPER.svelte";	
    import TMDB from "./TMDB.svelte";

    import axios from 'axios';

    const options = {
      method: 'GET',
      url: 'https://api.themoviedb.org/3/movie/now_playing',
      params: {language: 'ko', page: '1'},
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNDdjYzYzMzBhZGRlNDk4OWEzMTRjYTk4NjZjNWM0YSIsIm5iZiI6MTcwOTA0ODU3OC4xMTM5OTk4LCJzdWIiOiI2NWRlMDMwMmE4OTRkNjAxODcwZDgzYjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Uq_kyfrmNB3wyRJIQKmw7L9MI0E4sdx3al8c_N1t8QU'
      }
    };

    let movies = [];

    const getMovies = async () => {
      try {
        const res = await axios.request(options)
        movies = await res.data.results
        console.log(movies)
        return res
      } catch (error) {
        throw new Error(error)
      }
    }

    let promise = getMovies();
	</script>
	<SWIPER {promise}/>
	<TMDB {promise}/>