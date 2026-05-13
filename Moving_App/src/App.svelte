<script>
	import Example from "./components/example/Example.svelte";

	import { Router, Route } from "svelte-routing"

	import Header from "./components/common/Header.svelte";	
	import Footer from "./components/common/Footer.svelte";	
	import MainPage from "./pages/MainPage.svelte";
	import NowPage from "./pages/NowPage.svelte";
	import PopularPage from "./pages/PopularPage.svelte";
	import UpcomingPage from "./pages/UpcomingPage.svelte";
	import TopPage from "./pages/TopPage.svelte";

	import NowSubPage from "./pages/NowSubPage.svelte";
	import PopularSubPage from "./pages/PopularSubPage.svelte";
	import UpcomingSubPage from "./pages/UpcomingSubPage.svelte";
	import TopSubPage from "./pages/TopSubPage.svelte";

	export let url;
</script>
<!-- <Example/> -->

<svelte:head>
	<title>MOVING</title>
</svelte:head>

<Header />
<Router {url}>
	<Route path="/svelte4-basic-moving" component={MainPage}/>
	<Route path="/svelte4-basic-moving/now" component={NowPage}/>
	<Route path="/svelte4-basic-moving/popular" component={PopularPage}/>
	<Route path="/svelte4-basic-moving/upcoming" component={UpcomingPage}/>
	<Route path="/svelte4-basic-moving/top" component={TopPage}/>

	<Route path="/svelte4-basic-moving/now/:id" component={NowSubPage}/>
	<Route path="/svelte4-basic-moving/popular/:id" component={PopularSubPage}/>
	<Route path="/svelte4-basic-moving/upcoming/:id" component={UpcomingSubPage}/>
	<Route path="/svelte4-basic-moving/top/:id" component={TopSubPage}/>
</Router>
<Footer />