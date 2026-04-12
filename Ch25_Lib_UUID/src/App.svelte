<script>
	import { v4 as uuidv4 } from 'uuid'

  let test = uuidv4();
  const tests = [
    {
      id: uuidv4(),
      name: '김범수'
    },
    {
      id: uuidv4(),
      name: '박효신'
    },
    {
      id: uuidv4(),
      name: '나얼'
    },
  ];
</script>

<h1>{ uuidv4() }</h1>
<h1>{ test }</h1>

<ul>
  {#each tests as test}
    <li>{test.id}<br>{test.name}</li>
  {/each}
</ul>