<script>
	import Icon from '@iconify/svelte'
</script>
<Icon icon='bi:airplane-engines-fill'/>
<Icon icon='bi:arrow-through-heart-fill'/>
<div class="box01">
  <Icon icon='bi:airplane-engines-fill'/>
</div>
<div class="box02">
  <Icon icon='bi:arrow-through-heart-fill'/>
</div>
<style>
.box01 svg, .box02 svg{ width: 100px; height: 100px;}
.box01 path { fill: red; }
.box02 path { fill: blue; }
</style>