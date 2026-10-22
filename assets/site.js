/* ============================================================
   UTALABS.TECH — interactions
   lang switch (EN/ES) · scroll reveal · count-up · simulators
   ============================================================ */
(function(){
"use strict";
var doc=document;

/* ---------- EN / ES ---------- */
window.setLang=function(l){
  doc.documentElement.setAttribute('data-lang',l);
  doc.querySelectorAll('[data-en]').forEach(function(el){
    var v=el.getAttribute('data-'+l);
    if(v!==null) el.innerHTML=v;
  });
  try{localStorage.setItem('utalabs-lang',l)}catch(e){}
  doc.querySelectorAll('.langsw button').forEach(function(b){
    b.classList.toggle('on',b.getAttribute('data-setlang')===l);
  });
};
(function(){
  var l='en';
  try{
    var q=new URLSearchParams(location.search).get('lang');
    l=q||localStorage.getItem('utalabs-lang')||((navigator.language||'').indexOf('es')===0?'es':'en');
  }catch(e){}
  if(l&&l!=='en') setLang(l);
  else doc.querySelectorAll('.langsw button').forEach(function(b){
    b.classList.toggle('on',b.getAttribute('data-setlang')==='en');
  });
})();
doc.querySelectorAll('[data-setlang]').forEach(function(b){
  b.addEventListener('click',function(){setLang(b.getAttribute('data-setlang'))});
});

/* ---------- scroll reveal ---------- */
try{
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced&&'IntersectionObserver' in window){
    var els=doc.querySelectorAll('.rv');
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(!en.isIntersecting)return;
        var t=en.target;
        t.classList.add('in');
        io.unobserve(t);
      });
    },{threshold:.1,rootMargin:'0px 0px -5% 0px'});
    els.forEach(function(e){io.observe(e)});
  }else{
    doc.querySelectorAll('.rv').forEach(function(e){e.classList.add('in')});
  }
}catch(e){}

/* ---------- count-up numbers ---------- */
function countUp(el){
  var target=parseFloat(el.getAttribute('data-count'));
  var dec=parseInt(el.getAttribute('data-dec')||'0',10);
  var dur=1100, t0=null;
  function step(ts){
    if(!t0)t0=ts;
    var p=Math.min((ts-t0)/dur,1);
    var eased=1-Math.pow(1-p,3);
    el.textContent=(target*eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g,',');
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
try{
  var nums=doc.querySelectorAll('[data-count]');
  var io2=new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(en.isIntersecting){countUp(en.target);io2.unobserve(en.target)}
    });
  },{threshold:.4});
  nums.forEach(function(n){io2.observe(n)});
}catch(e){}

/* ============================================================
   HOME — trust pipeline simulator
   ============================================================ */
window.pipePlay=function(scenario){
  var box=doc.getElementById('pipe');
  if(!box)return;
  var note=doc.getElementById('pipe-note');
  var svg=box.querySelector('svg');
  var packet=svg.querySelector('.pkt');
  var steps=svg.querySelectorAll('.pstep');
  var verdicts={
    normal:{
      en:['<b>agent → uta:</b> tool call arrives with an Agent Trust Card attached. Format translated through UTS, no human in the loop.','<b>uta → sentinel:</b> tool fingerprints match the audited hashes. 10 layers report clean.','<b>sentinel → interceptor:</b> score above threshold, capability graph allows filesystem.read on this path.','<b>interceptor → mcp server:</b> policy engine returns <span class="v-allow">ALLOW</span> with a signed receipt. The call runs. Everything is logged.'],
      es:['<b>agente → uta:</b> la llamada llega con Agent Trust Card. Formato traducido vía UTS, sin humanos en el bucle.','<b>uta → sentinel:</b> los fingerprints coinciden con los hashes auditados. Las 10 capas reportan limpio.','<b>sentinel → interceptor:</b> puntaje sobre el umbral, el capability graph permite filesystem.read en esa ruta.','<b>interceptor → servidor mcp:</b> el motor de políticas devuelve <span class="v-allow">ALLOW</span> con recibo firmado. La llamada corre. Todo queda registrado.']
    },
    hostile:{
      en:['<b>agent → uta:</b> tool call arrives. Card is VALID — the agent itself is trusted. So far so good.','<b>uta → sentinel:</b> Sentinel re-checks the argument list. It references <span class="v-block">.env</span> — never part of the audited capability surface.','<b>sentinel → interceptor:</b> risk flag attached to the request: credential-access attempt, confidence high.','<b>interceptor:</b> policy rule P-03 matches. Verdict: <span class="v-block">BLOCK</span>. Signed refusal returned, event written to the audit trail. The database never sees it.'],
      es:['<b>agente → uta:</b> la llamada llega. La tarjeta está VALID — el agente en sí es confiable. Todo bien por ahora.','<b>uta → sentinel:</b> Sentinel re-examina los argumentos. Referencian <span class="v-block">.env</span> — nunca parte de la superficie auditada.','<b>sentinel → interceptor:</b> bandera de riesgo adjunta: intento de acceso a credenciales, confianza alta.','<b>interceptor:</b> la regla P-03 coincide. Veredicto: <span class="v-block">BLOCK</span>. Rechazo firmado, evento en la pista de auditoría. La base de datos nunca lo ve.']
    },
    revoked:{
      en:['<b>agent → uta:</b> tool call arrives with a card attached. Card check starts.','<b>uta → revocation registry:</b> the card id appears on the signed revocation list (MNR-CRL-1.0). Verdict: <span class="v-block">DENY</span> — the chain never reaches your server.','<b>receipt:</b> a signed, machine-readable reason is returned: <span class="v-block">card REVOKED, authority mn-ca-003</span>. Refusals get receipts too.'],
      es:['<b>agente → uta:</b> la llamada llega con una tarjeta adjunta. Empieza la verificación.','<b>uta → registro de revocación:</b> el id aparece en la lista firmada (MNR-CRL-1.0). Veredicto: <span class="v-block">DENY</span> — la cadena nunca llega a tu servidor.','<b>recibo:</b> se devuelve una razón firmada y legible por máquina: <span class="v-block">tarjeta REVOKED, autoridad mn-ca-003</span>. Los rechazos también reciben recibo.']
    }
  };
  var msgs=verdicts[scenario][doc.documentElement.getAttribute('data-lang')||'en'];
  var colors={normal:'#0e7a49',hostile:'#d43c19',revoked:'#d43c19'};
  var i=0;
  steps.forEach(function(s){s.classList.remove('hot','bad')});
  if(packet)packet.style.opacity='0';
  function next(){
    if(i>0){
      var prev=steps[i-1];
      prev.classList.remove('hot');
      if(scenario!=='normal'&&i>=3)prev.classList.add('bad');
    }
    if(i>=msgs.length){return}
    steps[i].classList.add(scenario!=='normal'&&i>=2?'bad':'hot');
    // move packet
    if(packet){
      var t=steps[i].querySelector('.stop');
      if(t){
        packet.style.opacity='1';
        packet.setAttribute('cx',t.getAttribute('x1'));
        packet.setAttribute('cy',t.getAttribute('y1'));
      }
    }
    note.innerHTML=msgs[i];
    i++;
    setTimeout(next,1500);
  }
  next();
  doc.querySelectorAll('[data-pipe]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-pipe')===scenario)});
};

/* ============================================================
   UTA — credential translator
   ============================================================ */
var UTA_FORMATS={
  'ATC v3':{card:'card_version: "3.0"\nissuer: "did:web:marketnow.site"\nsubject: "agent:invoice-bot-7"\nalgo: "Ed25519 (RFC 8032)"\ncanonicalization: "RFC 8785 JCS"\ncapabilities: [fs.read, net.api]\nproof.type: "Ed25519Signature2020"'},
  'JWT':{card:'{"typ":"JWT","alg":"EdDSA"}\n.\n{"iss":"did:web:marketnow.site",\n "sub":"agent:invoice-bot-7",\n "exp":1767225600,\n "scope":"fs.read net.api"}'},
  'W3C VC':{card:'"@context":["https://w3.org/vc"],\n"type":["VerifiableCredential"],\n"issuer":"did:web:marketnow.site",\n"credentialSubject":{"id":"agent:invoice-bot-7"},\n"proof":{"type":"Ed25519Signature2020"}'},
  'A2A':{card:'{"agentCard":{"name":"invoice-bot-7",\n "authentication":["ed25519"],\n "capabilities":{"fs.read":true,\n "net.api":["api.vendor.com"]}}}'},
  'EAT-AI':{card:'{"eat_profile":"tag:github.com,2026:EAT-AI",\n "ueid":"b3a1f9...",\n "submods":{"attested":{"meas":{"sw":[{"id":"agent:invoice-bot-7"}]}}}}'},
  'ZTA':{card:'{"zta_trust":{"identity":"agent:invoice-bot-7",\n "trust_tier":2,\n "attestation":"ed25519",\n "policy_version":"zta/1.2"}}'},
  'MCP Card':{card:'{"mcp_server":"invoice-bot-7",\n "tools":["create_invoice"],\n "verified":true,\n "signature":"mn-ca-003"}'},
  'X.509':{card:'Certificate:\n  Subject: CN=invoice-bot-7\n  Sig Alg: ed25519\n  Key Usage: digitalSignature\n  SAN: agent:invoice-bot-7'}
};
window.utaTranslate=function(fmt){
  var src=doc.getElementById('uta-src'),out=doc.getElementById('uta-out'),vd=doc.getElementById('uta-verdict');
  if(!src)return;
  doc.querySelectorAll('.fmt').forEach(function(b){b.classList.toggle('on',b.textContent.trim()===fmt)});
  var canonical=UTA_FORMATS['ATC v3'].card;
  src.textContent=UTA_FORMATS[fmt]?UTA_FORMATS[fmt].card:'';
  out.innerHTML='<span class="ln" style="color:#6b6b6b">… re-encoding via UTS …</span>';
  vd.style.display='none';
  setTimeout(function(){
    out.innerHTML='<span class="ln">canonical: Universal Trust Schema</span><span class="ln">→ emitting <b>'+fmt+'</b></span><span class="ln">'+canonical.replace(/\n/g,'<br>')+'</span>';
    vd.style.display='block';
    vd.className='tr-verdict';
    vd.innerHTML=(doc.documentElement.getAttribute('data-lang')||'en')==='es'
      ?'✓ SIN PÉRDIDA — 8/8 campos preservados · firma re-anclada, no re-emitida'
      :'✓ LOSSLESS — 8/8 fields preserved · signature re-anchored, not re-issued';
  },650);
};

/* ============================================================
   ATC — lifecycle machine
   ============================================================ */
window.atcSet=function(state){
  var card=doc.getElementById('atc-card'),log=doc.getElementById('atc-log');
  if(!card)return;
  card.setAttribute('data-state',state);
  var es=(doc.documentElement.getAttribute('data-lang')||'en')==='es';
  var texts={
    VALID: es?'<b class="good">VALID</b> — la firma Ed25519 verifica contra la CA pública (RFC 8032), la canonicalización RFC 8785 JCS es determinista y el id no aparece en el registro de revocación. El agente puede operar. Cualquier extraño puede re-derivar esto en 30 segundos, sin cuenta y sin confiar en nuestros endpoints.'
           :'<b class="good">VALID</b> — the Ed25519 signature verifies against the public CA (RFC 8032), RFC 8785 JCS canonicalization is deterministic, and the id is absent from the revocation registry. The agent may operate. Any stranger can re-derive this in 30 seconds — no account, no trust in our endpoints required.',
    SUSPENDED: es?'<span class="warn">SUSPENDED</span> — estado temporal: se detectó drift de comportamiento (v5.2) o una auditoría está en curso. La tarjeta no está muerta, pero sí congelada. Los rechazos por suspensión llevan recibo firmado con el motivo exacto.'
           :'<span class="warn">SUSPENDED</span> — temporary state: behavioral drift detected (v5.2) or an audit is in flight. The card is not dead, but frozen. Suspended refusals still carry a signed receipt with the exact reason.',
    REVOKED: es?'<span class="bad">REVOKED</span> — la clave fue publicada en la lista firmada MNR-CRL-1.0 y anclada a un log público append-only (transparencia tipo CT para agentes). Desde este instante, TODO verificador del mundo niega la tarjeta — no solo tu servicio. La revocación es pública, verificable y permanente.'
           :'<span class="bad">REVOKED</span> — the key is now on the signed MNR-CRL-1.0 list, anchored to a public append-only log (CT-for-agents). From this instant, EVERY verifier on earth denies the card — not just your service. Revocation is public, verifiable and permanent.'
  };
  log.innerHTML=texts[state]||'';
  doc.querySelectorAll('[data-atc]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-atc')===state)});
};

/* ============================================================
   SENTINEL — 10-layer scan
   ============================================================ */
window.sentinelScan=function(mode){
  var layers=doc.querySelectorAll('#sentinel-sim .layer');
  var rep=doc.getElementById('sentinel-report');
  if(!layers.length)return;
  var es=(doc.documentElement.getAttribute('data-lang')||'en')==='es';
  layers.forEach(function(l){l.className='layer'});
  rep.innerHTML='<div class="tt">'+(es?'esperando escaneo…':'awaiting scan…')+'</div>';
  var findings=[
    {ln:es?'L1.2 secretos incrustados — ninguno':'L1.2 embedded secrets — none'},
    {ln:es?'L1.4 capacidades peligrosas — shell: NO':'L1.4 dangerous capabilities — shell: NO'},
    {ln:es?'L1.9 inyección de prompts — 32 reglas, 0 coincidencias':'L1.9 prompt injection — 32 rules, 0 matches'}
  ];
  var hitIdx=es
    ?{ln:'L1.6 SOBRESCRITURA FUERA DE RAÍZ DETECTADA — rm -rf $HOME/.ssh en cleanup()',ln2:'L2 sandbox: syscall unlinkat() confirmó el acceso · severidad CRÍTICA · cuarentena'}
    :{ln:'L1.6 OUT-OF-ROOT OVERWRITE DETECTED — rm -rf $HOME/.ssh in cleanup()',ln2:'L2 sandbox: syscall unlinkat() confirmed the touch · severity CRITICAL · quarantined'};
  var seq=[
    {i:0,cls:'run',t:300},{i:0,cls:'ok',t:800},{i:1,cls:'run',t:1250},{i:1,cls:'ok',t:1750},
    {i:2,cls:'run',t:2200},{i:2,cls:'ok',t:2700},{i:3,cls:'run',t:3150},{i:3,cls:'ok',t:3650},
    {i:4,cls:'run',t:4100},{i:4,cls:'ok',t:4600},{i:5,cls:'run',t:5050},{i:5,cls:mode==='clean'?'ok':'alert',t:5550},
    {i:6,cls:'run',t:6000},{i:6,cls:'ok',t:6500},{i:7,cls:'run',t:6950},{i:7,cls:'ok',t:7450},
    {i:8,cls:'run',t:7900},{i:8,cls:'ok',t:8400},{i:9,cls:'run',t:8850},{i:9,cls:'ok',t:9350}
  ];
  seq.forEach(function(s){
    setTimeout(function(){
      layers[s.i].classList.remove('run');
      layers[s.i].classList.add(s.cls);
      layers[s.i].querySelector('.rst').textContent=
        s.cls==='run'?(es?'…':'…'):s.cls==='alert'?(es?'AMENAZA':'THREAT'):(es?'OK':'OK');
    },s.t);
  });
  var t0=500,lines=[];
  if(mode==='clean'){
    lines=[{txt:es?'$ sentinel audit invoice-bot-7 --full':'$ sentinel audit invoice-bot-7 --full',c:''}];
    findings.forEach(function(f){lines.push({txt:f.ln,c:'passln'})});
    lines.push({txt:es?'VEREDICTO: score 9.1/10 — sin hallazgos · ATC elegible':'VERDICT: score 9.1/10 — no findings · ATC eligible',c:'passln'});
  }else{
    lines=[
      {txt:es?'$ sentinel audit pdf-tools-2 --full':'$ sentinel audit pdf-tools-2 --full',c:''},
      findings[0].ln,findings[1].ln,
      {txt:hitIdx.ln,c:'hit'},
      {txt:hitIdx.ln2,c:'hit'}
    ];
  }
  lines.forEach(function(l,idx){
    setTimeout(function(){
      var d=rep.querySelector('.tt');
      var s=doc.createElement('div');
      s.className='ln '+l.c;
      s.textContent=l.txt;
      rep.appendChild(s);
      if(d)d.style.display='none';
    },t0+idx*900);
  });
  doc.querySelectorAll('[data-scan]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-scan')===mode)});
};

/* ============================================================
   INTERCEPTOR — policy terminal
   ============================================================ */
window.intercept=function(cmd){
  var body=doc.getElementById('int-term');
  if(!body)return;
  var es=(doc.documentElement.getAttribute('data-lang')||'en')==='es';
  var decisions={
    'GET /health':{v:'ALLOW',why:es?'ruta pública · sin capacidades · P-0 default':'public route · no capabilities · P-0 default',bad:false},
    'tools/list':{v:'ALLOW',why:es?'fingerprint SHA-256 coincide con el hash auditado':'fingerprint SHA-256 matches audited hash',bad:false},
    'fs.read("/var/log/app.log")':{v:'ALLOW',why:es?'capacidad declarada fs.read · ruta dentro del allowlist':'declared capability fs.read · path inside allowlist',bad:false},
    'fs.read("/home/u/.env")':{v:'BLOCK',why:es?'P-03: acceso a credenciales · .env fuera de la superficie auditada':'P-03: credential access · .env outside audited surface',bad:true},
    'shell("rm -rf /")':{v:'BLOCK',why:es?'P-01: shell.execute no declarado en la Trust Card':'P-01: shell.execute not declared on the Trust Card',bad:true},
    'net.post("https://pastebin.com")':{v:'BLOCK',why:es?'P-04: destino fuera del capability graph · patrón de exfiltración':'P-04: destination outside capability graph · exfiltration pattern',bad:true}
  };
  var d=decisions[cmd]||{v:'ALLOW',why:'—',bad:false};
  var cls=d.bad?'op-block':'op-allow';
  var row1=doc.createElement('div');row1.className='ln';
  row1.innerHTML='<span class="pr">interceptor›</span> '+cmd.replace(/</g,'&lt;');
  body.appendChild(row1);
  var row2=doc.createElement('div');row2.className='ln';
  row2.innerHTML='&nbsp;&nbsp;<span class="'+cls+'">● '+d.v+'</span> <span class="dim">'+(es?'— regla':'— rule')+' · '+d.why+'</span>';
  body.appendChild(row2);
  body.scrollTop=body.scrollHeight;
  doc.querySelectorAll('.tcap').forEach(function(b){b.classList.remove('on')});
};

})();
