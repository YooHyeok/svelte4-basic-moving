<script>
  export let promise;
</script>
{#await promise}
	 <p>loading...</p>
{:then value}
	{#each value.data.results as movie}
  <article>
    <h3>영화명 : {movie.title}</h3>
		<p>설명: {movie.overview}</p>
		<img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}/>
		<br/>
  </article>
  {/each}
{:catch error}
	<p>{error.message} : 에러가 발생되었습니다.</p>
{/await}
<style>
	article {
		width: 500px; border: 3px solid black;
		padding: 20px; margin-bottom: 20px;
	}
</style>