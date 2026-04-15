<script>
  import { Link, link, links, Router } from "svelte-routing";
</script>
<header>
  <h1>헤더입니다.</h1>
  <ul>
    <li><Router><Link to="/">Home</Link></Router></li>
  </ul>
  <ul>
    <li><a use:link href="/company">회사소개</a></li>
  </ul>
  <ul use:links>
    <li><a href="/map/1?new=true">오시는길</a></li>
    <li><a href="/product">제품소개</a></li>
  </ul>
</header>