(function(){
"use strict";
var menu=document.querySelector(".mobile-toggle"),nav=document.querySelector("#mobile-nav");
if(menu&&nav){menu.addEventListener("click",function(){
 var open=menu.getAttribute("aria-expanded")==="true";
 menu.setAttribute("aria-expanded",String(!open));nav.hidden=open;
});}
var quote=document.querySelector(".quote-layout");if(!quote)return;
var en=quote.dataset.lang==="en",prices={},travel={};
try{prices=JSON.parse(quote.dataset.prices||"{}");travel=JSON.parse(quote.dataset.travel||"{}");}
catch(err){var res=document.querySelector(".quote-result");if(res)res.textContent=en?"The estimate is temporarily unavailable.":"La estimación no está disponible.";return;}
var get=function(id){return document.getElementById(id);};
var format=function(v){return new Intl.NumberFormat(en?"en-IE":"es-ES",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(v);};
var captions={
 instalacion:en?"Standard split installation (labour only)":"Instalación split estándar (solo mano de obra)",
 reparacion:en?"Diagnostic visit before repair":"Visita de diagnóstico antes de reparar",
 mantenimiento:en?"Basic maintenance per unit":"Mantenimiento básico por unidad",
 diagnostico:en?"Diagnostic visit":"Visita de diagnóstico",
 limpieza:en?"Deep cleaning per unit":"Limpieza profunda por unidad",
 comercial:en?"Commercial assessment visit":"Visita de evaluación de negocio"
};
var rates={instalacion:Number(prices.instalacion)||320,reparacion:Number(prices.diagnostico)||55,mantenimiento:Number(prices.mantenimiento)||95,diagnostico:Number(prices.diagnostico)||55,limpieza:Number(prices.limpieza)||125,comercial:Number(prices.diagnostico)||55};
var last="";
function update(){
 var svc=get("q-service").value;
 var raw=parseInt(get("q-units").value,10),units=Number.isFinite(raw)?Math.max(1,Math.min(10,raw)):1;
 var area=get("q-zone").value,name=get("q-zone").selectedOptions[0].textContent;
 var conditions=get("q-complexity").value;
 var client=get("q-client").value;
 var qty=(svc==="diagnostico"||svc==="reparacion"||svc==="comercial")?1:units;
 var rate=rates[svc]||rates.diagnostico;
 var subtotal=rate*qty,fee=Number(travel[area])||0,total=subtotal+fee,iva=total-total/1.21;
 var rows=[
 {label:captions[svc]||captions.diagnostico,qty:qty,total:subtotal},
 {label:en?"Example travel fee":"Desplazamiento orientativo",qty:1,total:fee}
 ];
 get("q-lines").innerHTML=rows.map(function(r){return '<div class="line-row"><span>'+r.label+' × '+r.qty+'</span><strong>'+format(r.total)+'</strong></div>';}).join("");
 get("q-total").textContent=format(total);
 var extra=(svc==="reparacion"||svc==="comercial"||conditions==="complex")?
  (en?"Extra work is not included; a written assessment is needed.":"Los trabajos extra no están incluidos. Necesitan valoración y precio por escrito."):
  (en?"Equipment, additional electrical work and special access are excluded.":"No incluye el aparato, electricidad adicional ni accesos especiales.");
 get("q-extras").textContent=extra;
 last=(en?"AIR CARE — EXAMPLE ESTIMATE":"AIR CARE — ESTIMACIÓN ORIENTATIVA")+"\n"+
  (en?"Service: ":"Servicio: ")+(captions[svc]||svc)+"\n"+
  (en?"Indoor units: ":"Unidades interiores: ")+units+"\n"+
  (en?"Area: ":"Zona: ")+name+"\n"+
  (en?"Customer: ":"Cliente: ")+client+"\n"+
  (en?"Access: ":"Acceso: ")+conditions+"\n"+
  rows.map(function(r){return r.label+" × "+r.qty+": "+format(r.total);}).join("\n")+"\n"+
  (en?"Total incl. VAT: ":"Total con IVA incluido: ")+format(total)+"\n"+
  (en?"Included VAT (21%): ":"IVA incluido (21 %): ")+format(iva)+"\n"+extra+"\n"+
  (en?"Non-contractual reference; nothing submitted.":"Ejemplo no vinculante; no se ha enviado ningún dato.");
}
["q-service","q-units","q-zone","q-complexity","q-client"].forEach(function(id){
 var el=get(id);if(el){el.addEventListener("change",update);el.addEventListener("input",update);}
});
var copy=get("q-copy");if(copy)copy.addEventListener("click",function(){
 var status=get("q-status");
 if(navigator.clipboard&&window.isSecureContext){
  navigator.clipboard.writeText(last).then(function(){status.textContent=en?"Estimate copied.":"Estimación copiada.";},function(){status.textContent=en?"Your browser blocked copying.":"El navegador ha bloqueado la copia.";});
 } else {
  var t=document.createElement("textarea");t.value=last;t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();
  var success=false;try{success=document.execCommand("copy");}catch(e){}
  t.remove();status.textContent=success?(en?"Estimate copied.":"Estimación copiada."):(en?"Copy unavailable.":"No se ha podido copiar.");
 }
});
update();
})();