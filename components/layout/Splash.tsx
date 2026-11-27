// First-visit loading screen. Plain HTML + CSS (globals.css) so it shows even before JS arrives on slow
// networks; a tiny inline script decides whether to show it and fades it out. It only flips a data
// attribute on <html> (suppressHydrationWarning there), so React never sees the DOM change.

const script = `(function(){try{
var d=document.documentElement;
if(sessionStorage.getItem('mikko:splash')||location.pathname.indexOf('/admin')===0){d.dataset.splash='off';return}
sessionStorage.setItem('mikko:splash','1');
var t0=Date.now(),gone=false;
function done(){if(gone)return;gone=true;var w=Math.max(0,1300-(Date.now()-t0));setTimeout(function(){d.dataset.splash='out'},w);setTimeout(function(){d.dataset.splash='off'},w+600)}
if(document.readyState==='complete')done();else addEventListener('load',done);
setTimeout(done,3500);
}catch(e){document.documentElement.dataset.splash='off'}})();`;

export function Splash() {
  return (
    <>
      <div id="mikko-splash" aria-hidden="true">
        <div>
          <div className="splash-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/mikko-bear.png" alt="" width={152} height={110} className="splash-bear" fetchPriority="high" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/mikko-text.png" alt="" width={388} height={110} className="splash-word" fetchPriority="high" />
          </div>
          <div className="splash-bar">
            <span />
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
