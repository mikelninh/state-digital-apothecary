(() => {
  const files = ['data.js','core.js','practice.js','beta-tools.js'];
  const load = src => new Promise((resolve,reject) => {
    const script=document.createElement('script');
    script.src=src;
    script.onload=resolve;
    script.onerror=()=>reject(new Error('Unable to load '+src));
    document.body.appendChild(script);
  });
  files.reduce((promise,file)=>promise.then(()=>load(file)),Promise.resolve()).catch(error=>{
    console.error(error);
    const toast=document.getElementById('toast');
    if(toast){toast.textContent='STATE could not load this beta build. Please refresh or report the problem.';toast.classList.add('show');}
  });
})();
