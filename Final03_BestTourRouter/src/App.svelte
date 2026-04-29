<script>
	import { Router, Route } from "svelte-routing"
	import Title from "./components/Title.svelte"
	import BestListPage from "./components/BestListPage.svelte"
	import BestDetail from "./components/BestDetailPage.svelte"
	
	export let url = ''
</script>
<div class="bestbox">
	<Title name="BEST TOUR"/>
	<Router {url}>
		<Route path="/" component={BestListPage}/>
		<Route path="/:id" component={BestDetail}/>
	</Router>
</div>