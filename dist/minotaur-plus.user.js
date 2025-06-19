// ==UserScript==
// @name         Minotaur enhance patch
// @description  Améliore l'interface utilisateur de Minot@ur
// @icon         https://www.interieur.gouv.fr/themes/custom/dsfr/src/images/logo/favicon.png
// @version      2025-06-16
// @grant        GM.xmlHttpRequest
// @require      https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js
// @match        https://minotaur.sso.gendarmerie.interieur.gouv.fr/*
// ==/UserScript==

(()=>{var $="https://minotaur.sso.gendarmerie.interieur.gouv.fr/v2/data";function R(n){let e=document.createElement("style");return e.textContent=n,document.head.appendChild(e),e}function h(n,e,t=null,a={}){return new Promise((r,s)=>{GM.xmlHttpRequest({method:n,url:$+e,data:t,headers:a,onload:l=>{r(l)},onerror:l=>{s(l)}})})}function b(n,e={}){let t=new FullCalendar.Calendar(n,{locale:"fr",height:"auto",firstDay:1,headerToolbar:{left:"prev,next",center:"title",right:"today"},eventDidMount:function(a){a.el.setAttribute("title",a.event.title)},...e});return t.render(),t}function L(n){let e=n.getFullYear(),t=`${n.getMonth()+1}`.padStart(2,"0"),a=`${n.getDate()}`.padStart(2,"0");return`${e}-${t}-${a}`}function E(n){return n>=200&&n<300}function p(){let n=new Date,e=new Date(n);return e.setFullYear(n.getFullYear()+1),e.setMonth(e.getMonth()-1),new Date(e.getFullYear(),e.getMonth()+1,0)}function C(n){let e=0;for(let t=0;t<n.length;t++)e=n.charCodeAt(t)+((e<<5)-e),e=e&e;return Math.abs(e)}function V(n){let e=C(n),t=190+e%61,a=50+e%31,r=25+e%16;return`hsl(${t}, ${a}%, ${r}%)`}function P(n){let e=C(n),t=10+e%50,a=20+e%36,r=25+e%16;return`hsl(${t}, ${a}%, ${r}%)`}function M(n){let e=C(n),t=130+e%31,a=50+e%26,r=25+e%16;return`hsl(${t}, ${a}%, ${r}%)`}var B="X-CSRF-TOKEN",N=[];async function F(n){if(n in N)return N[n];let e=await h("GET",`/csrf-token/${n}`),t=JSON.parse(e.responseText).csrfToken;return N[n]=t,t}function D(n,e){return new Promise(async(t,a)=>{let r;try{let s=await h("GET",`/availabilities?minDate=${n}&maxDate=${e}&limit=9999999&page=1`);r=JSON.parse(s.responseText),E(s.status)?t(r):a(`Error unexpected response code ${s.status}`)}catch(s){a(s)}})}function _(n){return new Promise(async(e,t)=>{try{let a=await h("POST",`/availabilities/${n}`,null,{[B]:await F("availabilitiesdelete")});E(a.status)?e():t(`Error unexpected response code ${a.status}`)}catch(a){t(a)}})}function y(n,e,t=null){return new Promise(async(a,r)=>{try{let s=await h("POST","/availabilities",JSON.stringify({id:t??"",start:L(n),end:L(e)}),{[B]:await F("availabilities")});E(s.status)?a():r(`Error unexpected response code ${s.status}`)}catch(s){r(s)}})}var f=Object.freeze({AVAILABILITIES:"availabilities",SUMMONS:"summons",VOLUNTEERING_DECLARATIONS:"volunteeringDeclarations",VOLUNTEER_CALLS:"volunteerCalls"});function S(n){return{events:n,id:f.AVAILABILITIES,display:"background",color:"#6ca3e3"}}function x(n){return n.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{id:e.id,start:e.start,end:t,allDay:!0}})}function w(n){return{events:n,id:f.SUMMONS}}function T(n){return n.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{start:e.start,end:t,allDay:!0,title:e.missionObjet,color:M(e.missionObjet+e.start+e.end)}})}function k(n){return{events:n,id:f.VOLUNTEERING_DECLARATIONS}}function I(n){return n.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{start:e.start,end:t,allDay:!0,title:e.objet,color:P(e.objet+e.missionStart+e.missionEnd)}})}function G(n){return{events:n,id:f.VOLUNTEER_CALLS}}function H(n){return n.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{start:e.start,end:t,allDay:!0,title:e.objet,color:V(e.objet+e.missionStart+e.missionEnd)}})}var J=`<div id="calendar"></div>

<div class="calendar-help">
	<div class="calendar-help-square-container">
		<div class="calendar-help-square-item">
			<input id="availabilities-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--blue">
			<label for="availabilities-checkbox">DISPONIBILIT\xC9S</label>
		</div>
		<div class="calendar-help-square-item">
			<input id="volunteering-declarations-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--brown" checked>
			<label for="volunteering-declarations-checkbox">VOLONTARIATS</label>
		</div>
		<div class="calendar-help-square-item">
			<input id="summons-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--green" checked>
			<label for="summons-checkbox">CONVOCATIONS</label>
		</div>
		<div class="calendar-help-square-item">
			<input id="volunteer-calls-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--dark-blue">
			<label for="volunteer-calls-checkbox">APPELS A VOLONTAIRE</label>
		</div>
	</div>
</div>
`;var O=class{templateEl;calendar;showAvailabilities=!1;showSummons=!0;showVolunteeringDeclarations=!0;showVolunteerCalls=!1;constructor(){let e=document.querySelector("main");this.templateEl=document.createElement("div"),this.templateEl.innerHTML=J,e.prepend(this.templateEl);let t=document.getElementById("calendar"),a={start:new Date,end:p()};this.calendar=b(t,{validRange:a,eventSources:[S(async(d,o,u)=>{if(!this.showAvailabilities){o([]);return}let i=new Date,m=p();try{let c=await D(i.toISOString(),m.toISOString());o(x(c))}catch(c){u(c)}}),w(async(d,o,u)=>{if(!this.showSummons){o([]);return}let i=new Date,m=p();try{let c=await h("GET",`/convocations?minDate=${i.toISOString()}&maxDate=${m.toISOString()}`),g=JSON.parse(c.responseText);o(T(g))}catch(c){u(c)}}),k(async(d,o,u)=>{if(!this.showVolunteeringDeclarations){o([]);return}let i=new Date,m=p();try{let c=await h("GET",`/volunteering-declarations?minDate=${i.toISOString()}&maxDate=${m.toISOString()}`),g=JSON.parse(c.responseText);o(I(g))}catch(c){u(c)}}),G(async(d,o,u)=>{if(!this.showVolunteerCalls){o([]);return}let i=new Date,m=p();try{let c=await h("GET",`/missions?status=missions&minDate=${i.toISOString()}&maxDate=${m.toISOString()}&limit=9999999`),g=JSON.parse(c.responseText);o(H(g))}catch(c){u(c)}})]});let r=document.getElementById("availabilities-checkbox");r.addEventListener("click",d=>{this.showAvailabilities=r.checked,this.calendar.refetchEvents(),this.calendar.unselect()});let s=document.getElementById("summons-checkbox");s.addEventListener("click",d=>{this.showSummons=s.checked,this.calendar.refetchEvents(),this.calendar.unselect()});let l=document.getElementById("volunteering-declarations-checkbox");l.addEventListener("click",d=>{this.showVolunteeringDeclarations=l.checked,this.calendar.refetchEvents(),this.calendar.unselect()});let v=document.getElementById("volunteer-calls-checkbox");v.addEventListener("click",d=>{this.showVolunteerCalls=v.checked,this.calendar.refetchEvents(),this.calendar.unselect()})}destroy(){this.calendar.destroy(),this.templateEl.remove()}};var U=`<div id="calendar"></div>

<div class="calendar-help">
	<div>
		Clickez sur une date pour ajouter/supprimer une disponibilit\xE9.<br>
		Attention, cela ne mettra pas \xE0 jour les informations plus bas. Il sera n\xE9cessaire de recharger la page pour actualiser les donn\xE9es.
	</div>
	<div class="calendar-help-square-container">
		<div class="calendar-help-square-item">
			<div class="calendar-help-square calendar-help-square--blue"></div>
			DISPONIBILIT\xC9S
		</div>
		<div class="calendar-help-square-item">
			<input id="summons-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--green" checked>
			<label for="summons-checkbox">CONVOCATIONS</label>
		</div>
		<div class="calendar-help-square-item">
			<input id="volunteering-declarations-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--brown">
			<label for="volunteering-declarations-checkbox">VOLONTARIATS</label>
		</div>
	</div>
</div>
`;var A=class{templateEl;calendar;locked=!1;showSummons=!0;showVolunteeringDeclarations=!1;constructor(){let e=document.querySelector("main");this.templateEl=document.createElement("div"),this.templateEl.innerHTML=U,e.prepend(this.templateEl);let t=document.getElementById("calendar"),a={start:new Date,end:p()};this.calendar=b(t,{eventSources:[S(async(l,v,d)=>{let o=new Date,u=p();try{let i=await D(o.toISOString(),u.toISOString());v(x(i))}catch(i){d(i)}}),w(async(l,v,d)=>{if(!this.showSummons){v([]);return}let o=new Date,u=p();try{let i=await h("GET",`/convocations?minDate=${o.toISOString()}&maxDate=${u.toISOString()}`),m=JSON.parse(i.responseText);v(T(m))}catch(i){d(i)}}),k(async(l,v,d)=>{if(!this.showVolunteeringDeclarations){v([]);return}let o=new Date,u=p();try{let i=await h("GET",`/volunteering-declarations?minDate=${o.toISOString()}&maxDate=${u.toISOString()}`),m=JSON.parse(i.responseText);v(I(m))}catch(i){d(i)}})],selectable:!0,validRange:a,dateClick:l=>this.onDateClick(l)});let r=document.getElementById("summons-checkbox");r.addEventListener("click",l=>{this.showSummons=r.checked,this.calendar.refetchEvents(),this.calendar.unselect()});let s=document.getElementById("volunteering-declarations-checkbox");s.addEventListener("click",l=>{this.showVolunteeringDeclarations=s.checked,this.calendar.refetchEvents(),this.calendar.unselect()})}destroy(){this.calendar.destroy(),this.templateEl.remove()}onDateClick(e){let t=e.date,a=t.getTime(),r=this.calendar.getEvents().filter(s=>{if(s.source.id===f.AVAILABILITIES)return a>=s.start.getTime()&&a<s.end.getTime()});r.length>0?r.forEach(s=>{this.removeAvailability(s,t)}):this.addAvailability(t)}async removeAvailability(e,t){if(!this.locked){this.locked=!0;try{await _(e.id);let a=new Date(e.end);if(a.setDate(a.getDate()-1),e.start.getTime()<t.getTime()){let r=new Date(t);r.setDate(r.getDate()-1),await y(e.start,r)}if(a.getTime()>t.getTime()){let r=new Date(t);r.setDate(r.getDate()+1),await y(r,a)}}finally{this.calendar.refetchEvents(),this.calendar.unselect(),this.locked=!1}}}async addAvailability(e){if(!this.locked){this.locked=!0;try{await y(e,e)}finally{this.calendar.refetchEvents(),this.calendar.unselect(),this.locked=!1}}}};var q=class{currentPage=null;constructor(){this.initNewPage();let e=history.pushState;history.pushState=(...t)=>{e.apply(history,t),this.destroyCurrentPage(),this.initNewPage()},window.addEventListener("popstate",()=>{this.destroyCurrentPage(),this.initNewPage()})}destroyCurrentPage(){this.currentPage!==null&&(this.currentPage.destroy(),this.currentPage=null)}initNewPage(){location.href.endsWith("missions")?this.currentPage=new A:location.href.endsWith("aav")&&(this.currentPage=new O)}};var j=`.fc {
  margin: 0 auto;
  margin-top: 3rem;
  padding: 0 1rem;
  max-width: 50rem;
}

.fc-h-event .fc-event-title {
  text-overflow: ellipsis;
  font-size: .75em;
}

.fc .fc-toolbar-title {
  font-size: 1.5em;
  text-transform: capitalize;
}

.fc-day:not(.fc-day-disabled) {
  cursor: default;
}

.fc-daygrid-day-number {
  cursor: default !important;
}

.fc-event:not(.fc-bg-event):not(.fc-col-header-cell) {
  cursor: default !important;
}

.fc-daygrid-event {
  border-radius: 1000px;
}

.fc-daygrid-block-event .fc-event-title {
  padding-left: .5rem;
  padding-right: .5rem;
}

.fc-daygrid-event.fc-event-start:not(.fc-event-end) {
  margin-left: 1.5rem;
}

.fc-daygrid-event.fc-event-end:not(.fc-event-start) {
  margin-right: 1.5rem;
}

.calendar-help {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  margin: 0 auto;
  margin-top: 1.5rem;
  margin-bottom: 3rem;
  padding: 0 1rem;
  max-width: 50rem;
}

.calendar-help-square-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2rem;
}

.calendar-help-square-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: .5rem;
}

.calendar-help-square {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 3px;
}

.calendar-help-square--green {
  accent-color: #18753c;
  background-color: #18753c;
}

.calendar-help-square--brown {
  accent-color: #725c49;
  background-color: #725c49;
}

.calendar-help-square--blue {
  accent-color: #d3e3f7;
  background-color: #d3e3f7;
}

.calendar-help-square--dark-blue {
  accent-color: #0063cb;
  background-color: #0063cb;
}
`;document.addEventListener("DOMContentLoaded",()=>{R(j),new q});})();
