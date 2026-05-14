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
	<Route path={`${CONFIG.BASE_URL}/`} component={MainPage}/>
	<Route path={`${CONFIG.BASE_URL}/now`} component={NowPage}/>
	<Route path={`${CONFIG.BASE_URL}/popular`} component={PopularPage}/>
	<Route path={`${CONFIG.BASE_URL}/upcoming`} component={UpcomingPage}/>
	<Route path={`${CONFIG.BASE_URL}/top`} component={TopPage}/>

	<Route path={`${CONFIG.BASE_URL}/now/:id`} component={NowSubPage}/>
	<Route path={`${CONFIG.BASE_URL}/popular/:id`} component={PopularSubPage}/>
	<Route path={`${CONFIG.BASE_URL}/upcoming/:id`} component={UpcomingSubPage}/>
	<Route path={`${CONFIG.BASE_URL}/top/:id`} component={TopSubPage}/>
</Router>
<Footer />