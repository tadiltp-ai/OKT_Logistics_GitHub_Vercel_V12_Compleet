export function normalizePageRoute(route){
 if(route==='/index.html'||route==='/index/'||route==='/index')return '/';
 if(route.endsWith('.html'))return route.slice(0,-5)+'/';
 if(/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]+$/.test(route))return route+'/';
 return route;
}
export function prepareRedirects(input){
 const result={};
 for(const [from,to] of Object.entries(input)){
  const localRoute=/^\/(?:[a-z0-9-]+\/)*(?:[a-z0-9-]+(?:\/|\.html)?)?$/;
  if(!localRoute.test(from)||typeof to!=='string'||!localRoute.test(to))throw Error('Redirects moeten lokale pagina-adressen zijn.');
  const key=normalizePageRoute(from),target=normalizePageRoute(to);
  if(Object.hasOwn(result,key)&&result[key]!==target)throw Error('Dubbele redirect: '+key);
  result[key]=target;
 }
 for(const start of Object.keys(result)){
  const visited=new Set([start]);let target=result[start];
  while(Object.hasOwn(result,target)){if(visited.has(target))throw Error('Redirectlus: '+start);visited.add(target);target=result[target];}
  result[start]=target;
 }
 return result;
}
