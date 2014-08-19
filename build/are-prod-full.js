;(function(){function n(n,t,e){e=(e||0)-1;for(var r=n?n.length:0;++e<r;)if(n[e]===t)return e;return-1}function t(t,e){var r=typeof e;if(t=t.l,"boolean"==r||null==e)return t[e]?0:-1;"number"!=r&&"string"!=r&&(r="object");var u="number"==r?e:m+e;return t=(t=t[r])&&t[u],"object"==r?t&&-1<n(t,e)?0:-1:t?0:-1}function e(n){var t=this.l,e=typeof n;if("boolean"==e||null==n)t[n]=true;else{"number"!=e&&"string"!=e&&(e="object");var r="number"==e?n:m+n,t=t[e]||(t[e]={});"object"==e?(t[r]||(t[r]=[])).push(n):t[r]=true
}}function r(n){return n.charCodeAt(0)}function u(n,t){for(var e=n.m,r=t.m,u=-1,o=e.length;++u<o;){var i=e[u],a=r[u];if(i!==a){if(i>a||typeof i=="undefined")return 1;if(i<a||typeof a=="undefined")return-1}}return n.n-t.n}function o(n){var t=-1,r=n.length,u=n[0],o=n[r/2|0],i=n[r-1];if(u&&typeof u=="object"&&o&&typeof o=="object"&&i&&typeof i=="object")return false;for(u=f(),u["false"]=u["null"]=u["true"]=u.undefined=false,o=f(),o.k=n,o.l=u,o.push=e;++t<r;)o.push(n[t]);return o}function i(n){return"\\"+U[n]
}function a(){return h.pop()||[]}function f(){return g.pop()||{k:null,l:null,m:null,"false":false,n:0,"null":false,number:null,object:null,push:null,string:null,"true":false,undefined:false,o:null}}function l(n){n.length=0,h.length<_&&h.push(n)}function c(n){var t=n.l;t&&c(t),n.k=n.l=n.m=n.object=n.number=n.string=n.o=null,g.length<_&&g.push(n)}function p(n,t,e){t||(t=0),typeof e=="undefined"&&(e=n?n.length:0);var r=-1;e=e-t||0;for(var u=Array(0>e?0:e);++r<e;)u[r]=n[t+r];return u}function s(e){function h(n,t,e){if(!n||!V[typeof n])return n;
t=t&&typeof e=="undefined"?t:tt(t,e,3);for(var r=-1,u=V[typeof n]&&Fe(n),o=u?u.length:0;++r<o&&(e=u[r],false!==t(n[e],e,n)););return n}function g(n,t,e){var r;if(!n||!V[typeof n])return n;t=t&&typeof e=="undefined"?t:tt(t,e,3);for(r in n)if(false===t(n[r],r,n))break;return n}function _(n,t,e){var r,u=n,o=u;if(!u)return o;for(var i=arguments,a=0,f=typeof e=="number"?2:i.length;++a<f;)if((u=i[a])&&V[typeof u])for(var l=-1,c=V[typeof u]&&Fe(u),p=c?c.length:0;++l<p;)r=c[l],"undefined"==typeof o[r]&&(o[r]=u[r]);
return o}function U(n,t,e){var r,u=n,o=u;if(!u)return o;var i=arguments,a=0,f=typeof e=="number"?2:i.length;if(3<f&&"function"==typeof i[f-2])var l=tt(i[--f-1],i[f--],2);else 2<f&&"function"==typeof i[f-1]&&(l=i[--f]);for(;++a<f;)if((u=i[a])&&V[typeof u])for(var c=-1,p=V[typeof u]&&Fe(u),s=p?p.length:0;++c<s;)r=p[c],o[r]=l?l(o[r],u[r]):u[r];return o}function H(n){var t,e=[];if(!n||!V[typeof n])return e;for(t in n)me.call(n,t)&&e.push(t);return e}function J(n){return n&&typeof n=="object"&&!Te(n)&&me.call(n,"__wrapped__")?n:new Q(n)
}function Q(n,t){this.__chain__=!!t,this.__wrapped__=n}function X(n){function t(){if(r){var n=p(r);be.apply(n,arguments)}if(this instanceof t){var o=nt(e.prototype),n=e.apply(o,n||arguments);return wt(n)?n:o}return e.apply(u,n||arguments)}var e=n[0],r=n[2],u=n[4];return $e(t,n),t}function Z(n,t,e,r,u){if(e){var o=e(n);if(typeof o!="undefined")return o}if(!wt(n))return n;var i=ce.call(n);if(!K[i])return n;var f=Ae[i];switch(i){case T:case F:return new f(+n);case W:case P:return new f(n);case z:return o=f(n.source,C.exec(n)),o.lastIndex=n.lastIndex,o
}if(i=Te(n),t){var c=!r;r||(r=a()),u||(u=a());for(var s=r.length;s--;)if(r[s]==n)return u[s];o=i?f(n.length):{}}else o=i?p(n):U({},n);return i&&(me.call(n,"index")&&(o.index=n.index),me.call(n,"input")&&(o.input=n.input)),t?(r.push(n),u.push(o),(i?St:h)(n,function(n,i){o[i]=Z(n,t,e,r,u)}),c&&(l(r),l(u)),o):o}function nt(n){return wt(n)?ke(n):{}}function tt(n,t,e){if(typeof n!="function")return Ut;if(typeof t=="undefined"||!("prototype"in n))return n;var r=n.__bindData__;if(typeof r=="undefined"&&(De.funcNames&&(r=!n.name),r=r||!De.funcDecomp,!r)){var u=ge.call(n);
De.funcNames||(r=!O.test(u)),r||(r=E.test(u),$e(n,r))}if(false===r||true!==r&&1&r[1])return n;switch(e){case 1:return function(e){return n.call(t,e)};case 2:return function(e,r){return n.call(t,e,r)};case 3:return function(e,r,u){return n.call(t,e,r,u)};case 4:return function(e,r,u,o){return n.call(t,e,r,u,o)}}return Mt(n,t)}function et(n){function t(){var n=f?i:this;if(u){var h=p(u);be.apply(h,arguments)}return(o||c)&&(h||(h=p(arguments)),o&&be.apply(h,o),c&&h.length<a)?(r|=16,et([e,s?r:-4&r,h,null,i,a])):(h||(h=arguments),l&&(e=n[v]),this instanceof t?(n=nt(e.prototype),h=e.apply(n,h),wt(h)?h:n):e.apply(n,h))
}var e=n[0],r=n[1],u=n[2],o=n[3],i=n[4],a=n[5],f=1&r,l=2&r,c=4&r,s=8&r,v=e;return $e(t,n),t}function rt(e,r){var u=-1,i=st(),a=e?e.length:0,f=a>=b&&i===n,l=[];if(f){var p=o(r);p?(i=t,r=p):f=false}for(;++u<a;)p=e[u],0>i(r,p)&&l.push(p);return f&&c(r),l}function ut(n,t,e,r){r=(r||0)-1;for(var u=n?n.length:0,o=[];++r<u;){var i=n[r];if(i&&typeof i=="object"&&typeof i.length=="number"&&(Te(i)||yt(i))){t||(i=ut(i,t,e));var a=-1,f=i.length,l=o.length;for(o.length+=f;++a<f;)o[l++]=i[a]}else e||o.push(i)}return o
}function ot(n,t,e,r,u,o){if(e){var i=e(n,t);if(typeof i!="undefined")return!!i}if(n===t)return 0!==n||1/n==1/t;if(n===n&&!(n&&V[typeof n]||t&&V[typeof t]))return false;if(null==n||null==t)return n===t;var f=ce.call(n),c=ce.call(t);if(f==D&&(f=q),c==D&&(c=q),f!=c)return false;switch(f){case T:case F:return+n==+t;case W:return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case z:case P:return n==oe(t)}if(c=f==$,!c){var p=me.call(n,"__wrapped__"),s=me.call(t,"__wrapped__");if(p||s)return ot(p?n.__wrapped__:n,s?t.__wrapped__:t,e,r,u,o);
if(f!=q)return false;if(f=n.constructor,p=t.constructor,f!=p&&!(dt(f)&&f instanceof f&&dt(p)&&p instanceof p)&&"constructor"in n&&"constructor"in t)return false}for(f=!u,u||(u=a()),o||(o=a()),p=u.length;p--;)if(u[p]==n)return o[p]==t;var v=0,i=true;if(u.push(n),o.push(t),c){if(p=n.length,v=t.length,(i=v==p)||r)for(;v--;)if(c=p,s=t[v],r)for(;c--&&!(i=ot(n[c],s,e,r,u,o)););else if(!(i=ot(n[v],s,e,r,u,o)))break}else g(t,function(t,a,f){return me.call(f,a)?(v++,i=me.call(n,a)&&ot(n[a],t,e,r,u,o)):void 0}),i&&!r&&g(n,function(n,t,e){return me.call(e,t)?i=-1<--v:void 0
});return u.pop(),o.pop(),f&&(l(u),l(o)),i}function it(n,t,e,r,u){(Te(t)?St:h)(t,function(t,o){var i,a,f=t,l=n[o];if(t&&((a=Te(t))||Pe(t))){for(f=r.length;f--;)if(i=r[f]==t){l=u[f];break}if(!i){var c;e&&(f=e(l,t),c=typeof f!="undefined")&&(l=f),c||(l=a?Te(l)?l:[]:Pe(l)?l:{}),r.push(t),u.push(l),c||it(l,t,e,r,u)}}else e&&(f=e(l,t),typeof f=="undefined"&&(f=t)),typeof f!="undefined"&&(l=f);n[o]=l})}function at(n,t){return n+he(Re()*(t-n+1))}function ft(e,r,u){var i=-1,f=st(),p=e?e.length:0,s=[],v=!r&&p>=b&&f===n,h=u||v?a():s;
for(v&&(h=o(h),f=t);++i<p;){var g=e[i],y=u?u(g,i,e):g;(r?!i||h[h.length-1]!==y:0>f(h,y))&&((u||v)&&h.push(y),s.push(g))}return v?(l(h.k),c(h)):u&&l(h),s}function lt(n){return function(t,e,r){var u={};e=J.createCallback(e,r,3),r=-1;var o=t?t.length:0;if(typeof o=="number")for(;++r<o;){var i=t[r];n(u,i,e(i,r,t),t)}else h(t,function(t,r,o){n(u,t,e(t,r,o),o)});return u}}function ct(n,t,e,r,u,o){var i=1&t,a=4&t,f=16&t,l=32&t;if(!(2&t||dt(n)))throw new ie;f&&!e.length&&(t&=-17,f=e=false),l&&!r.length&&(t&=-33,l=r=false);
var c=n&&n.__bindData__;return c&&true!==c?(c=p(c),c[2]&&(c[2]=p(c[2])),c[3]&&(c[3]=p(c[3])),!i||1&c[1]||(c[4]=u),!i&&1&c[1]&&(t|=8),!a||4&c[1]||(c[5]=o),f&&be.apply(c[2]||(c[2]=[]),e),l&&we.apply(c[3]||(c[3]=[]),r),c[1]|=t,ct.apply(null,c)):(1==t||17===t?X:et)([n,t,e,r,u,o])}function pt(n){return Be[n]}function st(){var t=(t=J.indexOf)===Wt?n:t;return t}function vt(n){return typeof n=="function"&&pe.test(n)}function ht(n){var t,e;return n&&ce.call(n)==q&&(t=n.constructor,!dt(t)||t instanceof t)?(g(n,function(n,t){e=t
}),typeof e=="undefined"||me.call(n,e)):false}function gt(n){return We[n]}function yt(n){return n&&typeof n=="object"&&typeof n.length=="number"&&ce.call(n)==D||false}function mt(n,t,e){var r=Fe(n),u=r.length;for(t=tt(t,e,3);u--&&(e=r[u],false!==t(n[e],e,n)););return n}function bt(n){var t=[];return g(n,function(n,e){dt(n)&&t.push(e)}),t.sort()}function _t(n){for(var t=-1,e=Fe(n),r=e.length,u={};++t<r;){var o=e[t];u[n[o]]=o}return u}function dt(n){return typeof n=="function"}function wt(n){return!(!n||!V[typeof n])
}function jt(n){return typeof n=="number"||n&&typeof n=="object"&&ce.call(n)==W||false}function kt(n){return typeof n=="string"||n&&typeof n=="object"&&ce.call(n)==P||false}function xt(n){for(var t=-1,e=Fe(n),r=e.length,u=Xt(r);++t<r;)u[t]=n[e[t]];return u}function Ct(n,t,e){var r=-1,u=st(),o=n?n.length:0,i=false;return e=(0>e?Ie(0,o+e):e)||0,Te(n)?i=-1<u(n,t,e):typeof o=="number"?i=-1<(kt(n)?n.indexOf(t,e):u(n,t,e)):h(n,function(n){return++r<e?void 0:!(i=n===t)}),i}function Ot(n,t,e){var r=true;t=J.createCallback(t,e,3),e=-1;
var u=n?n.length:0;if(typeof u=="number")for(;++e<u&&(r=!!t(n[e],e,n)););else h(n,function(n,e,u){return r=!!t(n,e,u)});return r}function Nt(n,t,e){var r=[];t=J.createCallback(t,e,3),e=-1;var u=n?n.length:0;if(typeof u=="number")for(;++e<u;){var o=n[e];t(o,e,n)&&r.push(o)}else h(n,function(n,e,u){t(n,e,u)&&r.push(n)});return r}function It(n,t,e){t=J.createCallback(t,e,3),e=-1;var r=n?n.length:0;if(typeof r!="number"){var u;return h(n,function(n,e,r){return t(n,e,r)?(u=n,false):void 0}),u}for(;++e<r;){var o=n[e];
if(t(o,e,n))return o}}function St(n,t,e){var r=-1,u=n?n.length:0;if(t=t&&typeof e=="undefined"?t:tt(t,e,3),typeof u=="number")for(;++r<u&&false!==t(n[r],r,n););else h(n,t);return n}function Et(n,t,e){var r=n?n.length:0;if(t=t&&typeof e=="undefined"?t:tt(t,e,3),typeof r=="number")for(;r--&&false!==t(n[r],r,n););else{var u=Fe(n),r=u.length;h(n,function(n,e,o){return e=u?u[--r]:--r,t(o[e],e,o)})}return n}function Rt(n,t,e){var r=-1,u=n?n.length:0;if(t=J.createCallback(t,e,3),typeof u=="number")for(var o=Xt(u);++r<u;)o[r]=t(n[r],r,n);
else o=[],h(n,function(n,e,u){o[++r]=t(n,e,u)});return o}function At(n,t,e){var u=-1/0,o=u;if(typeof t!="function"&&e&&e[t]===n&&(t=null),null==t&&Te(n)){e=-1;for(var i=n.length;++e<i;){var a=n[e];a>o&&(o=a)}}else t=null==t&&kt(n)?r:J.createCallback(t,e,3),St(n,function(n,e,r){e=t(n,e,r),e>u&&(u=e,o=n)});return o}function Dt(n,t,e,r){if(!n)return e;var u=3>arguments.length;t=J.createCallback(t,r,4);var o=-1,i=n.length;if(typeof i=="number")for(u&&(e=n[++o]);++o<i;)e=t(e,n[o],o,n);else h(n,function(n,r,o){e=u?(u=false,n):t(e,n,r,o)
});return e}function $t(n,t,e,r){var u=3>arguments.length;return t=J.createCallback(t,r,4),Et(n,function(n,r,o){e=u?(u=false,n):t(e,n,r,o)}),e}function Tt(n){var t=-1,e=n?n.length:0,r=Xt(typeof e=="number"?e:0);return St(n,function(n){var e=at(0,++t);r[t]=r[e],r[e]=n}),r}function Ft(n,t,e){var r;t=J.createCallback(t,e,3),e=-1;var u=n?n.length:0;if(typeof u=="number")for(;++e<u&&!(r=t(n[e],e,n)););else h(n,function(n,e,u){return!(r=t(n,e,u))});return!!r}function Bt(n,t,e){var r=0,u=n?n.length:0;if(typeof t!="number"&&null!=t){var o=-1;
for(t=J.createCallback(t,e,3);++o<u&&t(n[o],o,n);)r++}else if(r=t,null==r||e)return n?n[0]:v;return p(n,0,Se(Ie(0,r),u))}function Wt(t,e,r){if(typeof r=="number"){var u=t?t.length:0;r=0>r?Ie(0,u+r):r||0}else if(r)return r=zt(t,e),t[r]===e?r:-1;return n(t,e,r)}function qt(n,t,e){if(typeof t!="number"&&null!=t){var r=0,u=-1,o=n?n.length:0;for(t=J.createCallback(t,e,3);++u<o&&t(n[u],u,n);)r++}else r=null==t||e?1:Ie(0,t);return p(n,r)}function zt(n,t,e,r){var u=0,o=n?n.length:u;for(e=e?J.createCallback(e,r,1):Ut,t=e(t);u<o;)r=u+o>>>1,e(n[r])<t?u=r+1:o=r;
return u}function Pt(n,t,e,r){return typeof t!="boolean"&&null!=t&&(r=e,e=typeof t!="function"&&r&&r[t]===n?null:t,t=false),null!=e&&(e=J.createCallback(e,r,3)),ft(n,t,e)}function Kt(){for(var n=1<arguments.length?arguments:arguments[0],t=-1,e=n?At(Ve(n,"length")):0,r=Xt(0>e?0:e);++t<e;)r[t]=Ve(n,t);return r}function Lt(n,t){var e=-1,r=n?n.length:0,u={};for(t||!r||Te(n[0])||(t=[]);++e<r;){var o=n[e];t?u[o]=t[e]:o&&(u[o[0]]=o[1])}return u}function Mt(n,t){return 2<arguments.length?ct(n,17,p(arguments,2),null,t):ct(n,1,null,null,t)
}function Vt(n,t,e){function r(){c&&ve(c),i=c=p=v,(g||h!==t)&&(s=Ue(),a=n.apply(l,o),c||i||(o=l=null))}function u(){var e=t-(Ue()-f);0<e?c=_e(u,e):(i&&ve(i),e=p,i=c=p=v,e&&(s=Ue(),a=n.apply(l,o),c||i||(o=l=null)))}var o,i,a,f,l,c,p,s=0,h=false,g=true;if(!dt(n))throw new ie;if(t=Ie(0,t)||0,true===e)var y=true,g=false;else wt(e)&&(y=e.leading,h="maxWait"in e&&(Ie(t,e.maxWait)||0),g="trailing"in e?e.trailing:g);return function(){if(o=arguments,f=Ue(),l=this,p=g&&(c||!y),false===h)var e=y&&!c;else{i||y||(s=f);var v=h-(f-s),m=0>=v;
m?(i&&(i=ve(i)),s=f,a=n.apply(l,o)):i||(i=_e(r,v))}return m&&c?c=ve(c):c||t===h||(c=_e(u,t)),e&&(m=true,a=n.apply(l,o)),!m||c||i||(o=l=null),a}}function Ut(n){return n}function Gt(n,t,e){var r=true,u=t&&bt(t);t&&(e||u.length)||(null==e&&(e=t),o=Q,t=n,n=J,u=bt(t)),false===e?r=false:wt(e)&&"chain"in e&&(r=e.chain);var o=n,i=dt(o);St(u,function(e){var u=n[e]=t[e];i&&(o.prototype[e]=function(){var t=this.__chain__,e=this.__wrapped__,i=[e];if(be.apply(i,arguments),i=u.apply(n,i),r||t){if(e===i&&wt(i))return this;
i=new o(i),i.__chain__=t}return i})})}function Ht(){}function Jt(n){return function(t){return t[n]}}function Qt(){return this.__wrapped__}e=e?Y.defaults(G.Object(),e,Y.pick(G,A)):G;var Xt=e.Array,Yt=e.Boolean,Zt=e.Date,ne=e.Function,te=e.Math,ee=e.Number,re=e.Object,ue=e.RegExp,oe=e.String,ie=e.TypeError,ae=[],fe=re.prototype,le=e._,ce=fe.toString,pe=ue("^"+oe(ce).replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/toString| for [^\]]+/g,".*?")+"$"),se=te.ceil,ve=e.clearTimeout,he=te.floor,ge=ne.prototype.toString,ye=vt(ye=re.getPrototypeOf)&&ye,me=fe.hasOwnProperty,be=ae.push,_e=e.setTimeout,de=ae.splice,we=ae.unshift,je=function(){try{var n={},t=vt(t=re.defineProperty)&&t,e=t(n,n,n)&&t
}catch(r){}return e}(),ke=vt(ke=re.create)&&ke,xe=vt(xe=Xt.isArray)&&xe,Ce=e.isFinite,Oe=e.isNaN,Ne=vt(Ne=re.keys)&&Ne,Ie=te.max,Se=te.min,Ee=e.parseInt,Re=te.random,Ae={};Ae[$]=Xt,Ae[T]=Yt,Ae[F]=Zt,Ae[B]=ne,Ae[q]=re,Ae[W]=ee,Ae[z]=ue,Ae[P]=oe,Q.prototype=J.prototype;var De=J.support={};De.funcDecomp=!vt(e.a)&&E.test(s),De.funcNames=typeof ne.name=="string",J.templateSettings={escape:/<%-([\s\S]+?)%>/g,evaluate:/<%([\s\S]+?)%>/g,interpolate:N,variable:"",imports:{_:J}},ke||(nt=function(){function n(){}return function(t){if(wt(t)){n.prototype=t;
var r=new n;n.prototype=null}return r||e.Object()}}());var $e=je?function(n,t){M.value=t,je(n,"__bindData__",M)}:Ht,Te=xe||function(n){return n&&typeof n=="object"&&typeof n.length=="number"&&ce.call(n)==$||false},Fe=Ne?function(n){return wt(n)?Ne(n):[]}:H,Be={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},We=_t(Be),qe=ue("("+Fe(We).join("|")+")","g"),ze=ue("["+Fe(Be).join("")+"]","g"),Pe=ye?function(n){if(!n||ce.call(n)!=q)return false;var t=n.valueOf,e=vt(t)&&(e=ye(t))&&ye(e);return e?n==e||ye(n)==e:ht(n)
}:ht,Ke=lt(function(n,t,e){me.call(n,e)?n[e]++:n[e]=1}),Le=lt(function(n,t,e){(me.call(n,e)?n[e]:n[e]=[]).push(t)}),Me=lt(function(n,t,e){n[e]=t}),Ve=Rt,Ue=vt(Ue=Zt.now)&&Ue||function(){return(new Zt).getTime()},Ge=8==Ee(d+"08")?Ee:function(n,t){return Ee(kt(n)?n.replace(I,""):n,t||0)};return J.after=function(n,t){if(!dt(t))throw new ie;return function(){return 1>--n?t.apply(this,arguments):void 0}},J.assign=U,J.at=function(n){for(var t=arguments,e=-1,r=ut(t,true,false,1),t=t[2]&&t[2][t[1]]===n?1:r.length,u=Xt(t);++e<t;)u[e]=n[r[e]];
return u},J.bind=Mt,J.bindAll=function(n){for(var t=1<arguments.length?ut(arguments,true,false,1):bt(n),e=-1,r=t.length;++e<r;){var u=t[e];n[u]=ct(n[u],1,null,null,n)}return n},J.bindKey=function(n,t){return 2<arguments.length?ct(t,19,p(arguments,2),null,n):ct(t,3,null,null,n)},J.chain=function(n){return n=new Q(n),n.__chain__=true,n},J.compact=function(n){for(var t=-1,e=n?n.length:0,r=[];++t<e;){var u=n[t];u&&r.push(u)}return r},J.compose=function(){for(var n=arguments,t=n.length;t--;)if(!dt(n[t]))throw new ie;
return function(){for(var t=arguments,e=n.length;e--;)t=[n[e].apply(this,t)];return t[0]}},J.constant=function(n){return function(){return n}},J.countBy=Ke,J.create=function(n,t){var e=nt(n);return t?U(e,t):e},J.createCallback=function(n,t,e){var r=typeof n;if(null==n||"function"==r)return tt(n,t,e);if("object"!=r)return Jt(n);var u=Fe(n),o=u[0],i=n[o];return 1!=u.length||i!==i||wt(i)?function(t){for(var e=u.length,r=false;e--&&(r=ot(t[u[e]],n[u[e]],null,true)););return r}:function(n){return n=n[o],i===n&&(0!==i||1/i==1/n)
}},J.curry=function(n,t){return t=typeof t=="number"?t:+t||n.length,ct(n,4,null,null,null,t)},J.debounce=Vt,J.defaults=_,J.defer=function(n){if(!dt(n))throw new ie;var t=p(arguments,1);return _e(function(){n.apply(v,t)},1)},J.delay=function(n,t){if(!dt(n))throw new ie;var e=p(arguments,2);return _e(function(){n.apply(v,e)},t)},J.difference=function(n){return rt(n,ut(arguments,true,true,1))},J.filter=Nt,J.flatten=function(n,t,e,r){return typeof t!="boolean"&&null!=t&&(r=e,e=typeof t!="function"&&r&&r[t]===n?null:t,t=false),null!=e&&(n=Rt(n,e,r)),ut(n,t)
},J.forEach=St,J.forEachRight=Et,J.forIn=g,J.forInRight=function(n,t,e){var r=[];g(n,function(n,t){r.push(t,n)});var u=r.length;for(t=tt(t,e,3);u--&&false!==t(r[u--],r[u],n););return n},J.forOwn=h,J.forOwnRight=mt,J.functions=bt,J.groupBy=Le,J.indexBy=Me,J.initial=function(n,t,e){var r=0,u=n?n.length:0;if(typeof t!="number"&&null!=t){var o=u;for(t=J.createCallback(t,e,3);o--&&t(n[o],o,n);)r++}else r=null==t||e?1:t||r;return p(n,0,Se(Ie(0,u-r),u))},J.intersection=function(){for(var e=[],r=-1,u=arguments.length,i=a(),f=st(),p=f===n,s=a();++r<u;){var v=arguments[r];
(Te(v)||yt(v))&&(e.push(v),i.push(p&&v.length>=b&&o(r?e[r]:s)))}var p=e[0],h=-1,g=p?p.length:0,y=[];n:for(;++h<g;){var m=i[0],v=p[h];if(0>(m?t(m,v):f(s,v))){for(r=u,(m||s).push(v);--r;)if(m=i[r],0>(m?t(m,v):f(e[r],v)))continue n;y.push(v)}}for(;u--;)(m=i[u])&&c(m);return l(i),l(s),y},J.invert=_t,J.invoke=function(n,t){var e=p(arguments,2),r=-1,u=typeof t=="function",o=n?n.length:0,i=Xt(typeof o=="number"?o:0);return St(n,function(n){i[++r]=(u?t:n[t]).apply(n,e)}),i},J.keys=Fe,J.map=Rt,J.mapValues=function(n,t,e){var r={};
return t=J.createCallback(t,e,3),h(n,function(n,e,u){r[e]=t(n,e,u)}),r},J.max=At,J.memoize=function(n,t){function e(){var r=e.cache,u=t?t.apply(this,arguments):m+arguments[0];return me.call(r,u)?r[u]:r[u]=n.apply(this,arguments)}if(!dt(n))throw new ie;return e.cache={},e},J.merge=function(n){var t=arguments,e=2;if(!wt(n))return n;if("number"!=typeof t[2]&&(e=t.length),3<e&&"function"==typeof t[e-2])var r=tt(t[--e-1],t[e--],2);else 2<e&&"function"==typeof t[e-1]&&(r=t[--e]);for(var t=p(arguments,1,e),u=-1,o=a(),i=a();++u<e;)it(n,t[u],r,o,i);
return l(o),l(i),n},J.min=function(n,t,e){var u=1/0,o=u;if(typeof t!="function"&&e&&e[t]===n&&(t=null),null==t&&Te(n)){e=-1;for(var i=n.length;++e<i;){var a=n[e];a<o&&(o=a)}}else t=null==t&&kt(n)?r:J.createCallback(t,e,3),St(n,function(n,e,r){e=t(n,e,r),e<u&&(u=e,o=n)});return o},J.omit=function(n,t,e){var r={};if(typeof t!="function"){var u=[];g(n,function(n,t){u.push(t)});for(var u=rt(u,ut(arguments,true,false,1)),o=-1,i=u.length;++o<i;){var a=u[o];r[a]=n[a]}}else t=J.createCallback(t,e,3),g(n,function(n,e,u){t(n,e,u)||(r[e]=n)
});return r},J.once=function(n){var t,e;if(!dt(n))throw new ie;return function(){return t?e:(t=true,e=n.apply(this,arguments),n=null,e)}},J.pairs=function(n){for(var t=-1,e=Fe(n),r=e.length,u=Xt(r);++t<r;){var o=e[t];u[t]=[o,n[o]]}return u},J.partial=function(n){return ct(n,16,p(arguments,1))},J.partialRight=function(n){return ct(n,32,null,p(arguments,1))},J.pick=function(n,t,e){var r={};if(typeof t!="function")for(var u=-1,o=ut(arguments,true,false,1),i=wt(n)?o.length:0;++u<i;){var a=o[u];a in n&&(r[a]=n[a])
}else t=J.createCallback(t,e,3),g(n,function(n,e,u){t(n,e,u)&&(r[e]=n)});return r},J.pluck=Ve,J.property=Jt,J.pull=function(n){for(var t=arguments,e=0,r=t.length,u=n?n.length:0;++e<r;)for(var o=-1,i=t[e];++o<u;)n[o]===i&&(de.call(n,o--,1),u--);return n},J.range=function(n,t,e){n=+n||0,e=typeof e=="number"?e:+e||1,null==t&&(t=n,n=0);var r=-1;t=Ie(0,se((t-n)/(e||1)));for(var u=Xt(t);++r<t;)u[r]=n,n+=e;return u},J.reject=function(n,t,e){return t=J.createCallback(t,e,3),Nt(n,function(n,e,r){return!t(n,e,r)
})},J.remove=function(n,t,e){var r=-1,u=n?n.length:0,o=[];for(t=J.createCallback(t,e,3);++r<u;)e=n[r],t(e,r,n)&&(o.push(e),de.call(n,r--,1),u--);return o},J.rest=qt,J.shuffle=Tt,J.sortBy=function(n,t,e){var r=-1,o=Te(t),i=n?n.length:0,p=Xt(typeof i=="number"?i:0);for(o||(t=J.createCallback(t,e,3)),St(n,function(n,e,u){var i=p[++r]=f();o?i.m=Rt(t,function(t){return n[t]}):(i.m=a())[0]=t(n,e,u),i.n=r,i.o=n}),i=p.length,p.sort(u);i--;)n=p[i],p[i]=n.o,o||l(n.m),c(n);return p},J.tap=function(n,t){return t(n),n
},J.throttle=function(n,t,e){var r=true,u=true;if(!dt(n))throw new ie;return false===e?r=false:wt(e)&&(r="leading"in e?e.leading:r,u="trailing"in e?e.trailing:u),L.leading=r,L.maxWait=t,L.trailing=u,Vt(n,t,L)},J.times=function(n,t,e){n=-1<(n=+n)?n:0;var r=-1,u=Xt(n);for(t=tt(t,e,1);++r<n;)u[r]=t(r);return u},J.toArray=function(n){return n&&typeof n.length=="number"?p(n):xt(n)},J.transform=function(n,t,e,r){var u=Te(n);if(null==e)if(u)e=[];else{var o=n&&n.constructor;e=nt(o&&o.prototype)}return t&&(t=J.createCallback(t,r,4),(u?St:h)(n,function(n,r,u){return t(e,n,r,u)
})),e},J.union=function(){return ft(ut(arguments,true,true))},J.uniq=Pt,J.values=xt,J.where=Nt,J.without=function(n){return rt(n,p(arguments,1))},J.wrap=function(n,t){return ct(t,16,[n])},J.xor=function(){for(var n=-1,t=arguments.length;++n<t;){var e=arguments[n];if(Te(e)||yt(e))var r=r?ft(rt(r,e).concat(rt(e,r))):e}return r||[]},J.zip=Kt,J.zipObject=Lt,J.collect=Rt,J.drop=qt,J.each=St,J.eachRight=Et,J.extend=U,J.methods=bt,J.object=Lt,J.select=Nt,J.tail=qt,J.unique=Pt,J.unzip=Kt,Gt(J),J.clone=function(n,t,e,r){return typeof t!="boolean"&&null!=t&&(r=e,e=t,t=false),Z(n,t,typeof e=="function"&&tt(e,r,1))
},J.cloneDeep=function(n,t,e){return Z(n,true,typeof t=="function"&&tt(t,e,1))},J.contains=Ct,J.escape=function(n){return null==n?"":oe(n).replace(ze,pt)},J.every=Ot,J.find=It,J.findIndex=function(n,t,e){var r=-1,u=n?n.length:0;for(t=J.createCallback(t,e,3);++r<u;)if(t(n[r],r,n))return r;return-1},J.findKey=function(n,t,e){var r;return t=J.createCallback(t,e,3),h(n,function(n,e,u){return t(n,e,u)?(r=e,false):void 0}),r},J.findLast=function(n,t,e){var r;return t=J.createCallback(t,e,3),Et(n,function(n,e,u){return t(n,e,u)?(r=n,false):void 0
}),r},J.findLastIndex=function(n,t,e){var r=n?n.length:0;for(t=J.createCallback(t,e,3);r--;)if(t(n[r],r,n))return r;return-1},J.findLastKey=function(n,t,e){var r;return t=J.createCallback(t,e,3),mt(n,function(n,e,u){return t(n,e,u)?(r=e,false):void 0}),r},J.has=function(n,t){return n?me.call(n,t):false},J.identity=Ut,J.indexOf=Wt,J.isArguments=yt,J.isArray=Te,J.isBoolean=function(n){return true===n||false===n||n&&typeof n=="object"&&ce.call(n)==T||false},J.isDate=function(n){return n&&typeof n=="object"&&ce.call(n)==F||false
},J.isElement=function(n){return n&&1===n.nodeType||false},J.isEmpty=function(n){var t=true;if(!n)return t;var e=ce.call(n),r=n.length;return e==$||e==P||e==D||e==q&&typeof r=="number"&&dt(n.splice)?!r:(h(n,function(){return t=false}),t)},J.isEqual=function(n,t,e,r){return ot(n,t,typeof e=="function"&&tt(e,r,2))},J.isFinite=function(n){return Ce(n)&&!Oe(parseFloat(n))},J.isFunction=dt,J.isNaN=function(n){return jt(n)&&n!=+n},J.isNull=function(n){return null===n},J.isNumber=jt,J.isObject=wt,J.isPlainObject=Pe,J.isRegExp=function(n){return n&&typeof n=="object"&&ce.call(n)==z||false
},J.isString=kt,J.isUndefined=function(n){return typeof n=="undefined"},J.lastIndexOf=function(n,t,e){var r=n?n.length:0;for(typeof e=="number"&&(r=(0>e?Ie(0,r+e):Se(e,r-1))+1);r--;)if(n[r]===t)return r;return-1},J.mixin=Gt,J.noConflict=function(){return e._=le,this},J.noop=Ht,J.now=Ue,J.parseInt=Ge,J.random=function(n,t,e){var r=null==n,u=null==t;return null==e&&(typeof n=="boolean"&&u?(e=n,n=1):u||typeof t!="boolean"||(e=t,u=true)),r&&u&&(t=1),n=+n||0,u?(t=n,n=0):t=+t||0,e||n%1||t%1?(e=Re(),Se(n+e*(t-n+parseFloat("1e-"+((e+"").length-1))),t)):at(n,t)
},J.reduce=Dt,J.reduceRight=$t,J.result=function(n,t){if(n){var e=n[t];return dt(e)?n[t]():e}},J.runInContext=s,J.size=function(n){var t=n?n.length:0;return typeof t=="number"?t:Fe(n).length},J.some=Ft,J.sortedIndex=zt,J.template=function(n,t,e){var r=J.templateSettings;n=oe(n||""),e=_({},e,r);var u,o=_({},e.imports,r.imports),r=Fe(o),o=xt(o),a=0,f=e.interpolate||S,l="__p+='",f=ue((e.escape||S).source+"|"+f.source+"|"+(f===N?x:S).source+"|"+(e.evaluate||S).source+"|$","g");n.replace(f,function(t,e,r,o,f,c){return r||(r=o),l+=n.slice(a,c).replace(R,i),e&&(l+="'+__e("+e+")+'"),f&&(u=true,l+="';"+f+";\n__p+='"),r&&(l+="'+((__t=("+r+"))==null?'':__t)+'"),a=c+t.length,t
}),l+="';",f=e=e.variable,f||(e="obj",l="with("+e+"){"+l+"}"),l=(u?l.replace(w,""):l).replace(j,"$1").replace(k,"$1;"),l="function("+e+"){"+(f?"":e+"||("+e+"={});")+"var __t,__p='',__e=_.escape"+(u?",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}":";")+l+"return __p}";try{var c=ne(r,"return "+l).apply(v,o)}catch(p){throw p.source=l,p}return t?c(t):(c.source=l,c)},J.unescape=function(n){return null==n?"":oe(n).replace(qe,gt)},J.uniqueId=function(n){var t=++y;return oe(null==n?"":n)+t
},J.all=Ot,J.any=Ft,J.detect=It,J.findWhere=It,J.foldl=Dt,J.foldr=$t,J.include=Ct,J.inject=Dt,Gt(function(){var n={};return h(J,function(t,e){J.prototype[e]||(n[e]=t)}),n}(),false),J.first=Bt,J.last=function(n,t,e){var r=0,u=n?n.length:0;if(typeof t!="number"&&null!=t){var o=u;for(t=J.createCallback(t,e,3);o--&&t(n[o],o,n);)r++}else if(r=t,null==r||e)return n?n[u-1]:v;return p(n,Ie(0,u-r))},J.sample=function(n,t,e){return n&&typeof n.length!="number"&&(n=xt(n)),null==t||e?n?n[at(0,n.length-1)]:v:(n=Tt(n),n.length=Se(Ie(0,t),n.length),n)
},J.take=Bt,J.head=Bt,h(J,function(n,t){var e="sample"!==t;J.prototype[t]||(J.prototype[t]=function(t,r){var u=this.__chain__,o=n(this.__wrapped__,t,r);return u||null!=t&&(!r||e&&typeof t=="function")?new Q(o,u):o})}),J.VERSION="2.4.1",J.prototype.chain=function(){return this.__chain__=true,this},J.prototype.toString=function(){return oe(this.__wrapped__)},J.prototype.value=Qt,J.prototype.valueOf=Qt,St(["join","pop","shift"],function(n){var t=ae[n];J.prototype[n]=function(){var n=this.__chain__,e=t.apply(this.__wrapped__,arguments);
return n?new Q(e,n):e}}),St(["push","reverse","sort","unshift"],function(n){var t=ae[n];J.prototype[n]=function(){return t.apply(this.__wrapped__,arguments),this}}),St(["concat","slice","splice"],function(n){var t=ae[n];J.prototype[n]=function(){return new Q(t.apply(this.__wrapped__,arguments),this.__chain__)}}),J}var v,h=[],g=[],y=0,m=+new Date+"",b=75,_=40,d=" \t\x0B\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000",w=/\b__p\+='';/g,j=/\b(__p\+=)''\+/g,k=/(__e\(.*?\)|\b__t\))\+'';/g,x=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,C=/\w*$/,O=/^\s*function[ \n\r\t]+\w/,N=/<%=([\s\S]+?)%>/g,I=RegExp("^["+d+"]*0+(?=.$)"),S=/($^)/,E=/\bthis\b/,R=/['\n\r\t\u2028\u2029\\]/g,A="Array Boolean Date Function Math Number Object RegExp String _ attachEvent clearTimeout isFinite isNaN parseInt setTimeout".split(" "),D="[object Arguments]",$="[object Array]",T="[object Boolean]",F="[object Date]",B="[object Function]",W="[object Number]",q="[object Object]",z="[object RegExp]",P="[object String]",K={};
K[B]=false,K[D]=K[$]=K[T]=K[F]=K[W]=K[q]=K[z]=K[P]=true;var L={leading:false,maxWait:0,trailing:false},M={configurable:false,enumerable:false,value:null,writable:false},V={"boolean":false,"function":true,object:true,number:false,string:false,undefined:false},U={"\\":"\\","'":"'","\n":"n","\r":"r","\t":"t","\u2028":"u2028","\u2029":"u2029"},G=V[typeof window]&&window||this,H=V[typeof exports]&&exports&&!exports.nodeType&&exports,J=V[typeof module]&&module&&!module.nodeType&&module,Q=J&&J.exports===H&&H,X=V[typeof global]&&global;!X||X.global!==X&&X.window!==X||(G=X);
var Y=s();typeof define=="function"&&typeof define.amd=="object"&&define.amd?(G._=Y, define(function(){return Y})):H&&J?Q?(J.exports=Y)._=Y:H._=Y:G._=Y}).call(this);
(function(){Object.create=Object.create||function(t){function i(){}return i.prototype=t,new i};var t;"undefined"==typeof exports?(t={},"object"==typeof window&&(window.cp=t)):t=exports;var i,e,s=function(t,i){if(!t)throw Error("Assertion failed: "+i)},n=function(t,i){!t&&console&&console.warn&&(console.warn("ASSERTION FAILED: "+i),console.trace&&console.trace())},r=function(t,i){return i>t?t:i},o=function(t,i){return t>i?t:i};"object"==typeof window&&window.navigator.userAgent.indexOf("Firefox")>-1?(i=Math.min,e=Math.max):(i=r,e=o);var a=function(t,i){return i>t?t+" "+i:i+" "+t},h=function(t,i){for(var e=0;t.length>e;e++)if(t[e]===i)return t[e]=t[t.length-1],t.length--,void 0},c=function(t,i,e){var s=A(i,e),n=f(x(s,A(t,e))/N(s));return S(e,B(s,n))},p=function(t,i,e,s,n,r){var o=e-n,a=s-r,h=f(m(o,a,t-n,i-r)/F(o,a));return new d(n+o*h,r+a*h)};t.momentForCircle=function(t,i,e,s){return t*(.5*(i*i+e*e)+N(s))},t.areaForCircle=function(t,i){return Math.PI*Math.abs(t*t-i*i)},t.momentForSegment=function(t,i,e){var s=B(S(i,e),.5);return t*(q(e,i)/12+N(s))},t.areaForSegment=function(t,i,e){return e*(Math.PI*e+2*O(t,i))},t.momentForPoly=function(t,i,e){for(var s=0,n=0,r=i.length,o=0;r>o;o+=2){var a=i[o]+e.x,h=i[o+1]+e.y,c=i[(o+2)%r]+e.x,p=i[(o+3)%r]+e.y,u=k(c,p,a,h),l=m(a,h,a,h)+m(a,h,c,p)+m(c,p,c,p);s+=u*l,n+=u}return t*s/(6*n)},t.areaForPoly=function(t){for(var i=0,e=0,s=t.length;s>e;e+=2)i+=C(new d(t[e],t[e+1]),new d(t[(e+2)%s],t[(e+3)%s]));return-i/2},t.centroidForPoly=function(t){for(var i=0,e=new d(0,0),s=0,n=t.length;n>s;s+=2){var r=new d(t[s],t[s+1]),o=new d(t[(s+2)%n],t[(s+3)%n]),a=C(r,o);i+=a,e=S(e,B(S(r,o),a))}return B(e,1/(3*i))},t.recenterPoly=function(i){for(var e=t.centroidForPoly(i),s=0;i.length>s;s+=2)i[s]-=e.x,i[s+1]-=e.y},t.momentForBox=function(t,i,e){return t*(i*i+e*e)/12},t.momentForBox2=function(i,e){var s=e.r-e.l,n=e.t-e.b,r=B([e.l+e.r,e.b+e.t],.5);return t.momentForBox(i,s,n)+i*N(r)};var u=t.loopIndexes=function(t){var i,e,s,n,r=0,o=0;i=s=t[0],e=n=t[1];for(var a=t.length>>1,h=1;a>h;h++){var c=t[2*h],p=t[2*h+1];i>c||c==i&&e>p?(i=c,e=p,r=h):(c>s||c==s&&p>n)&&(s=c,n=p,o=h)}return[r,o]},l=function(t,i,e){var s=t[2*i];t[2*i]=t[2*e],t[2*e]=s,s=t[2*i+1],t[2*i+1]=t[2*e+1],t[2*e+1]=s},b=function(t,i,e,s,n,r){if(0===e)return 0;for(var o=0,a=i,h=A(n,s),c=r*g(h),p=i,u=i+e-1;u>=p;){var b=new d(t[2*p],t[2*p+1]),y=C(h,A(b,s));y>c?(y>o&&(o=y,a=p),p++):(l(t,p,u),u--)}return a!=i&&l(t,i,a),p-i},y=function(t,i,e,s,n,r,o,a){if(0>s)return 0;if(0==s)return i[2*a]=r.x,i[2*a+1]=r.y,1;var h=b(i,e,s,n,r,t),c=new d(i[2*e],i[2*e+1]),p=y(t,i,e+1,h-1,n,c,r,a),u=a+p++;i[2*u]=r.x,i[2*u+1]=r.y;var l=b(i,e+h,s-h,r,o,t),v=new d(i[2*(e+h)],i[2*(e+h)+1]);return p+y(t,i,e+h+1,l-1,r,v,o,a+p)};t.convexHull=function(t,i,e){if(i)for(var s=0;t.length>s;s++)i[s]=t[s];else i=t;var r=u(t),o=r[0],a=r[1];if(o==a)return i.length=2,i;l(i,0,o),l(i,1,0==a?o:a);var h=new d(i[0],i[1]),c=new d(i[2],i[3]),p=t.length>>1,b=y(e,i,2,p-2,h,c,h,1)+1;return i.length=2*b,n(ti(i),"Internal error: cpConvexHull() and cpPolyValidate() did not agree.Please report this error with as much info as you can."),i};var v=function(t,s,n){return i(e(t,s),n)},f=function(t){return e(0,i(t,1))},d=t.Vect=function(t,i){this.x=t,this.y=i};t.v=function(t,i){return new d(t,i)};var _=t.vzero=new d(0,0),x=t.v.dot=function(t,i){return t.x*i.x+t.y*i.y},m=function(t,i,e,s){return t*e+i*s},g=t.v.len=function(t){return Math.sqrt(x(t,t))},w=t.v.len2=function(t,i){return Math.sqrt(t*t+i*i)};t.v.eql=function(t,i){return t.x===i.x&&t.y===i.y};var S=t.v.add=function(t,i){return new d(t.x+i.x,t.y+i.y)};d.prototype.add=function(t){return this.x+=t.x,this.y+=t.y,this};var A=t.v.sub=function(t,i){return new d(t.x-i.x,t.y-i.y)};d.prototype.sub=function(t){return this.x-=t.x,this.y-=t.y,this};var j=t.v.neg=function(t){return new d(-t.x,-t.y)};d.prototype.neg=function(){return this.x=-this.x,this.y=-this.y,this};var B=t.v.mult=function(t,i){return new d(t.x*i,t.y*i)};d.prototype.mult=function(t){return this.x*=t,this.y*=t,this};var C=t.v.cross=function(t,i){return t.x*i.y-t.y*i.x},k=function(t,i,e,s){return t*s-i*e},M=t.v.perp=function(t){return new d(-t.y,t.x)};t.v.pvrperp=function(t){return new d(t.y,-t.x)};var I=t.v.project=function(t,i){return B(i,x(t,i)/N(i))};d.prototype.project=function(t){return this.mult(x(this,t)/N(t)),this};var P=t.v.rotate=function(t,i){return new d(t.x*i.x-t.y*i.y,t.x*i.y+t.y*i.x)};d.prototype.rotate=function(t){return this.x=this.x*t.x-this.y*t.y,this.y=this.x*t.y+this.y*t.x,this};var L=t.v.unrotate=function(t,i){return new d(t.x*i.x+t.y*i.y,t.y*i.x-t.x*i.y)},N=t.v.lengthsq=function(t){return x(t,t)},F=t.v.lengthsq2=function(t,i){return t*t+i*i},Q=t.v.lerp=function(t,i,e){return S(B(t,1-e),B(i,e))},T=t.v.normalize=function(t){return B(t,1/g(t))},R=t.v.normalize_safe=function(t){return 0===t.x&&0===t.y?_:T(t)},V=t.v.clamp=function(t,i){return x(t,t)>i*i?B(T(t),i):t};t.v.lerpconst=function(t,i,e){return S(t,V(A(i,t),e))};var O=t.v.dist=function(t,i){return g(A(t,i))},q=t.v.distsq=function(t,i){return N(A(t,i))};t.v.near=function(t,i,e){return e*e>q(t,i)};var E=t.v.slerp=function(t,i,e){var s=Math.acos(x(t,i));if(s){var n=1/Math.sin(s);return S(B(t,Math.sin((1-e)*s)*n),B(i,Math.sin(e*s)*n))}return t};t.v.slerpconst=function(t,e,s){var n=Math.acos(x(t,e));return E(t,e,i(s,n)/n)},t.v.forangle=function(t){return new d(Math.cos(t),Math.sin(t))},t.v.toangle=function(t){return Math.atan2(t.y,t.x)},t.v.str=function(t){return"("+t.x.toFixed(3)+", "+t.y.toFixed(3)+")"};var H=0,D=t.BB=function(t,i,e,s){this.l=t,this.b=i,this.r=e,this.t=s,H++};t.bb=function(t,i,e,s){return new D(t,i,e,s)};var G=function(t,i){return new D(t.x-i,t.y-i,t.x+i,t.y+i)},W=function(t,i,e,s,n){return s>=t.l&&t.r>=i&&n>=t.b&&t.t>=e},z=0;t.NO_GROUP=0;var J=t.ALL_LAYERS=-1;t.resetShapeIdCounter=function(){z=0};var U=t.Shape=function(t){this.body=t,this.bb_l=this.bb_b=this.bb_r=this.bb_t=0,this.hashid=z++,this.sensor=!1,this.e=0,this.u=0,this.surface_v=_,this.collision_type=0,this.group=0,this.layers=J,this.space=null,this.collisionCode=this.collisionCode};U.prototype.setElasticity=function(t){this.e=t},U.prototype.setFriction=function(t){this.body.activate(),this.u=t},U.prototype.setLayers=function(t){this.body.activate(),this.layers=t},U.prototype.setSensor=function(t){this.body.activate(),this.sensor=t},U.prototype.setCollisionType=function(t){this.body.activate(),this.collision_type=t},U.prototype.getBody=function(){return this.body},U.prototype.active=function(){return this.body&&-1!==this.body.shapeList.indexOf(this)},U.prototype.setBody=function(t){s(!this.active(),"You cannot change the body on an active shape. You must remove the shape from the space before changing the body."),this.body=t},U.prototype.cacheBB=function(){return this.update(this.body.p,this.body.rot)},U.prototype.update=function(t,i){s(!isNaN(i.x),"Rotation is NaN"),s(!isNaN(t.x),"Position is NaN"),this.cacheData(t,i)},U.prototype.pointQuery=function(t){var i=this.nearestPointQuery(t);return 0>i.d?i:void 0},U.prototype.getBB=function(){return new D(this.bb_l,this.bb_b,this.bb_r,this.bb_t)};var Y=function(t,i,e){this.shape=t,this.p=i,this.d=e},K=function(t,i,e){this.shape=t,this.t=i,this.n=e};K.prototype.hitPoint=function(t,i){return Q(t,i,this.t)},K.prototype.hitDist=function(t,i){return O(t,i)*this.t};var X=t.CircleShape=function(t,i,e){this.c=this.tc=e,this.r=i,this.type="circle",U.call(this,t)};X.prototype=Object.create(U.prototype),X.prototype.cacheData=function(t,i){var e=this.tc=P(this.c,i).add(t),s=this.r;this.bb_l=e.x-s,this.bb_b=e.y-s,this.bb_r=e.x+s,this.bb_t=e.y+s},X.prototype.nearestPointQuery=function(t){var i=t.x-this.tc.x,e=t.y-this.tc.y,s=w(i,e),n=this.r,r=new d(this.tc.x+i*n/s,this.tc.y+e*n/s);return new Y(this,r,s-n)};var Z=function(t,i,e,s,n){s=A(s,i),n=A(n,i);var r=x(s,s)-2*x(s,n)+x(n,n),o=-2*x(s,s)+2*x(s,n),a=x(s,s)-e*e,h=o*o-4*r*a;if(h>=0){var c=(-o-Math.sqrt(h))/(2*r);if(c>=0&&1>=c)return new K(t,c,T(Q(s,n,c)))}};X.prototype.segmentQuery=function(t,i){return Z(this,this.tc,this.r,t,i)};var $=t.SegmentShape=function(t,i,e,s){this.a=i,this.b=e,this.n=M(T(A(e,i))),this.ta=this.tb=this.tn=null,this.r=s,this.a_tangent=_,this.b_tangent=_,this.type="segment",U.call(this,t)};$.prototype=Object.create(U.prototype),$.prototype.cacheData=function(t,i){this.ta=S(t,P(this.a,i)),this.tb=S(t,P(this.b,i)),this.tn=P(this.n,i);var e,s,n,r;this.ta.x<this.tb.x?(e=this.ta.x,s=this.tb.x):(e=this.tb.x,s=this.ta.x),this.ta.y<this.tb.y?(n=this.ta.y,r=this.tb.y):(n=this.tb.y,r=this.ta.y);var o=this.r;this.bb_l=e-o,this.bb_b=n-o,this.bb_r=s+o,this.bb_t=r+o},$.prototype.nearestPointQuery=function(t){var i=c(t,this.ta,this.tb),e=t.x-i.x,s=t.y-i.y,n=w(e,s),r=this.r,o=n?S(i,B(new d(e,s),r/n)):i;return new Y(this,o,n-r)},$.prototype.segmentQuery=function(t,i){var e=this.tn,s=x(A(this.ta,t),e),n=this.r,r=s>0?j(e):e,o=A(B(r,n),t),a=S(this.ta,o),h=S(this.tb,o),c=A(i,t);if(0>=C(c,a)*C(c,h)){var p=s+(s>0?-n:n),u=-p,l=x(c,e)-p;if(0>u*l)return new K(this,u/(u-l),r)}else if(0!==n){var b=Z(this,this.ta,this.r,t,i),y=Z(this,this.tb,this.r,t,i);return b?y&&y.t<b.t?y:b:y}},$.prototype.setNeighbors=function(t,i){this.a_tangent=A(t,this.a),this.b_tangent=A(i,this.b)},$.prototype.setEndpoints=function(t,i){this.a=t,this.b=i,this.n=M(T(A(i,t)))};var ti=function(t){for(var i=t.length,e=0;i>e;e+=2){var s=t[e],n=t[e+1],r=t[(e+2)%i],o=t[(e+3)%i],a=t[(e+4)%i],h=t[(e+5)%i];if(k(r-s,o-n,a-r,h-o)>0)return!1}return!0},ii=t.PolyShape=function(t,i,e){this.setVerts(i,e),this.type="poly",U.call(this,t)};ii.prototype=Object.create(U.prototype);var ei=function(t,i){this.n=t,this.d=i};ei.prototype.compare=function(t){return x(this.n,t)-this.d},ii.prototype.setVerts=function(t,i){s(t.length>=4,"Polygons require some verts"),s("number"==typeof t[0],"Polygon verticies should be specified in a flattened list (eg [x1,y1,x2,y2,x3,y3,...])"),s(ti(t),"Polygon is concave or has a reversed winding. Consider using cpConvexHull()");var e=t.length,n=e>>1;this.verts=Array(e),this.tVerts=Array(e),this.planes=Array(n),this.tPlanes=Array(n);for(var r=0;e>r;r+=2){var o=t[r]+i.x,a=t[r+1]+i.y,h=t[(r+2)%e]+i.x,c=t[(r+3)%e]+i.y,p=T(M(new d(h-o,c-a)));this.verts[r]=o,this.verts[r+1]=a,this.planes[r>>1]=new ei(p,m(p.x,p.y,o,a)),this.tPlanes[r>>1]=new ei(new d(0,0),0)}},t.BoxShape=function(t,i,e){var s=i/2,n=e/2;return si(t,new D(-s,-n,s,n))};var si=t.BoxShape2=function(t,i){var e=[i.l,i.b,i.l,i.t,i.r,i.t,i.r,i.b];return new ii(t,e,_)};ii.prototype.transformVerts=function(t,s){for(var n=this.verts,r=this.tVerts,o=1/0,a=-1/0,h=1/0,c=-1/0,p=0;n.length>p;p+=2){var u=n[p],l=n[p+1],b=t.x+u*s.x-l*s.y,y=t.y+u*s.y+l*s.x;r[p]=b,r[p+1]=y,o=i(o,b),a=e(a,b),h=i(h,y),c=e(c,y)}this.bb_l=o,this.bb_b=h,this.bb_r=a,this.bb_t=c},ii.prototype.transformAxes=function(t,i){for(var e=this.planes,s=this.tPlanes,n=0;e.length>n;n++){var r=P(e[n].n,i);s[n].n=r,s[n].d=x(t,r)+e[n].d}},ii.prototype.cacheData=function(t,i){this.transformAxes(t,i),this.transformVerts(t,i)},ii.prototype.nearestPointQuery=function(t){for(var i=this.tPlanes,e=this.tVerts,s=e[e.length-2],n=e[e.length-1],r=1/0,o=_,a=!1,h=0;i.length>h;h++){i[h].compare(t)>0&&(a=!0);var c=e[2*h],u=e[2*h+1],l=p(t.x,t.y,s,n,c,u),b=O(t,l);r>b&&(r=b,o=l),s=c,n=u}return new Y(this,o,a?r:-r)},ii.prototype.segmentQuery=function(t,i){for(var e=this.tPlanes,s=this.tVerts,n=e.length,r=2*n,o=0;n>o;o++){var a=e[o].n,h=x(t,a);if(!(e[o].d>h)){var c=x(i,a),p=(e[o].d-h)/(c-h);if(!(0>p||p>1)){var u=Q(t,i,p),l=-C(a,u),b=-k(a.x,a.y,s[2*o],s[2*o+1]),y=-k(a.x,a.y,s[(2*o+2)%r],s[(2*o+3)%r]);if(l>=b&&y>=l)return new K(this,p,a)}}}},ii.prototype.valueOnAxis=function(t,e){for(var s=this.tVerts,n=m(t.x,t.y,s[0],s[1]),r=2;s.length>r;r+=2)n=i(n,m(t.x,t.y,s[r],s[r+1]));return n-e},ii.prototype.containsVert=function(t,i){for(var e=this.tPlanes,s=0;e.length>s;s++){var n=e[s].n,r=m(n.x,n.y,t,i)-e[s].d;if(r>0)return!1}return!0},ii.prototype.containsVertPartial=function(t,i,e){for(var s=this.tPlanes,n=0;s.length>n;n++){var r=s[n].n;if(!(0>x(r,e))){var o=m(r.x,r.y,t,i)-s[n].d;if(o>0)return!1}}return!0},ii.prototype.getNumVerts=function(){return this.verts.length/2},ii.prototype.getVert=function(t){return new d(this.verts[2*t],this.verts[2*t+1])};var ni=t.Body=function(t,i){this.p=new d(0,0),this.vx=this.vy=0,this.f=new d(0,0),this.w=0,this.t=0,this.v_limit=1/0,this.w_limit=1/0,this.v_biasx=this.v_biasy=0,this.w_bias=0,this.space=null,this.shapeList=[],this.arbiterList=null,this.constraintList=null,this.nodeRoot=null,this.nodeNext=null,this.nodeIdleTime=0,this.setMass(t),this.setMoment(i),this.rot=new d(0,0),this.setAngle(0)};if("undefined"!=typeof DEBUG&&DEBUG){var ri=function(t,i){s(t.x==t.x&&t.y==t.y,i)},oi=function(t,i){s(1/0!==Math.abs(t.x)&&1/0!==Math.abs(t.y),i)},ai=function(t,i){ri(t,i),oi(t,i)};ni.prototype.sanityCheck=function(){s(this.m===this.m&&this.m_inv===this.m_inv,"Body's mass is invalid."),s(this.i===this.i&&this.i_inv===this.i_inv,"Body's moment is invalid."),ai(this.p,"Body's position is invalid."),ai(this.f,"Body's force is invalid."),s(this.vx===this.vx&&1/0!==Math.abs(this.vx),"Body's velocity is invalid."),s(this.vy===this.vy&&1/0!==Math.abs(this.vy),"Body's velocity is invalid."),s(this.a===this.a&&1/0!==Math.abs(this.a),"Body's angle is invalid."),s(this.w===this.w&&1/0!==Math.abs(this.w),"Body's angular velocity is invalid."),s(this.t===this.t&&1/0!==Math.abs(this.t),"Body's torque is invalid."),ai(this.rot,"Body's rotation vector is invalid."),s(this.v_limit===this.v_limit,"Body's velocity limit is invalid."),s(this.w_limit===this.w_limit,"Body's angular velocity limit is invalid.")}}else ni.prototype.sanityCheck=function(){};ni.prototype.getPos=function(){return this.p},ni.prototype.getVel=function(){return new d(this.vx,this.vy)},ni.prototype.getAngVel=function(){return this.w},ni.prototype.isSleeping=function(){return null!==this.nodeRoot},ni.prototype.isStatic=function(){return 1/0===this.nodeIdleTime},ni.prototype.isRogue=function(){return null===this.space},ni.prototype.setMass=function(t){s(t>0,"Mass must be positive and non-zero."),this.activate(),this.m=t,this.m_inv=1/t},ni.prototype.setMoment=function(t){s(t>0,"Moment of Inertia must be positive and non-zero."),this.activate(),this.i=t,this.i_inv=1/t},ni.prototype.addShape=function(t){this.shapeList.push(t)},ni.prototype.removeShape=function(t){h(this.shapeList,t)};var hi=function(t,i,e){return t===e?t.next(i):(t.a===i?t.next_a=hi(t.next_a,i,e):t.next_b=hi(t.next_b,i,e),t)};ni.prototype.removeConstraint=function(t){this.constraintList=hi(this.constraintList,this,t)},ni.prototype.setPos=function(i){this.activate(),this.sanityCheck(),i===_&&(i=t.v(0,0)),this.p=i},ni.prototype.setVel=function(t){this.activate(),this.vx=t.x,this.vy=t.y},ni.prototype.setAngVel=function(t){this.activate(),this.w=t},ni.prototype.setAngleInternal=function(t){s(!isNaN(t),"Internal Error: Attempting to set body's angle to NaN"),this.a=t,this.rot.x=Math.cos(t),this.rot.y=Math.sin(t)},ni.prototype.setAngle=function(t){this.activate(),this.sanityCheck(),this.setAngleInternal(t)},ni.prototype.velocity_func=function(t,i,e){var s=this.vx*i+(t.x+this.f.x*this.m_inv)*e,n=this.vy*i+(t.y+this.f.y*this.m_inv)*e,r=this.v_limit,o=s*s+n*n,a=o>r*r?r/Math.sqrt(o):1;this.vx=s*a,this.vy=n*a;var h=this.w_limit;this.w=v(this.w*i+this.t*this.i_inv*e,-h,h),this.sanityCheck()},ni.prototype.position_func=function(t){this.p.x+=(this.vx+this.v_biasx)*t,this.p.y+=(this.vy+this.v_biasy)*t,this.setAngleInternal(this.a+(this.w+this.w_bias)*t),this.v_biasx=this.v_biasy=0,this.w_bias=0,this.sanityCheck()},ni.prototype.resetForces=function(){this.activate(),this.f=new d(0,0),this.t=0},ni.prototype.applyForce=function(t,i){this.activate(),this.f=S(this.f,t),this.t+=C(i,t)},ni.prototype.applyImpulse=function(t,i){this.activate(),pe(this,t.x,t.y,i)},ni.prototype.getVelAtPoint=function(t){return S(new d(this.vx,this.vy),B(M(t),this.w))},ni.prototype.getVelAtWorldPoint=function(t){return this.getVelAtPoint(A(t,this.p))},ni.prototype.getVelAtLocalPoint=function(t){return this.getVelAtPoint(P(t,this.rot))},ni.prototype.eachShape=function(t){for(var i=0,e=this.shapeList.length;e>i;i++)t(this.shapeList[i])},ni.prototype.eachConstraint=function(t){for(var i=this.constraintList;i;){var e=i.next(this);t(i),i=e}},ni.prototype.eachArbiter=function(t){for(var i=this.arbiterList;i;){var e=i.next(this);i.swappedColl=this===i.body_b,t(i),i=e}},ni.prototype.local2World=function(t){return S(this.p,P(t,this.rot))},ni.prototype.world2Local=function(t){return L(A(t,this.p),this.rot)},ni.prototype.kineticEnergy=function(){var t=this.vx*this.vx+this.vy*this.vy,i=this.w*this.w;return(t?t*this.m:0)+(i?i*this.i:0)};var ci=t.SpatialIndex=function(t){if(this.staticIndex=t,t){if(t.dynamicIndex)throw Error("This static index is already associated with a dynamic index.");t.dynamicIndex=this}};ci.prototype.collideStatic=function(t,i){if(t.count>0){var e=t.query;this.each(function(t){e(t,new D(t.bb_l,t.bb_b,t.bb_r,t.bb_t),i)})}};var pi=t.BBTree=function(t){ci.call(this,t),this.velocityFunc=null,this.leaves={},this.count=0,this.root=null,this.pooledNodes=null,this.pooledPairs=null,this.stamp=0};pi.prototype=Object.create(ci.prototype);var ui=0,li=function(t,s,n){this.obj=null,this.bb_l=i(s.bb_l,n.bb_l),this.bb_b=i(s.bb_b,n.bb_b),this.bb_r=e(s.bb_r,n.bb_r),this.bb_t=e(s.bb_t,n.bb_t),this.parent=null,this.setA(s),this.setB(n)};pi.prototype.makeNode=function(t,i){var e=this.pooledNodes;return e?(this.pooledNodes=e.parent,e.constructor(this,t,i),e):(ui++,new li(this,t,i))};var bi=0,yi=function(t,i){this.obj=i,t.getBB(i,this),this.parent=null,this.stamp=1,this.pairs=null,bi++};pi.prototype.getBB=function(t,s){var n=this.velocityFunc;if(n){var r=.1,o=(t.bb_r-t.bb_l)*r,a=(t.bb_t-t.bb_b)*r,h=B(n(t),.1);s.bb_l=t.bb_l+i(-o,h.x),s.bb_b=t.bb_b+i(-a,h.y),s.bb_r=t.bb_r+e(o,h.x),s.bb_t=t.bb_t+e(a,h.y)}else s.bb_l=t.bb_l,s.bb_b=t.bb_b,s.bb_r=t.bb_r,s.bb_t=t.bb_t},pi.prototype.getStamp=function(){var t=this.dynamicIndex;return t&&t.stamp?t.stamp:this.stamp},pi.prototype.incrementStamp=function(){this.dynamicIndex&&this.dynamicIndex.stamp?this.dynamicIndex.stamp++:this.stamp++};var vi=0,fi=function(t,i,e,s){this.prevA=null,this.leafA=t,this.nextA=i,this.prevB=null,this.leafB=e,this.nextB=s};pi.prototype.makePair=function(t,i,e,s){var n=this.pooledPairs;return n?(this.pooledPairs=n.prevA,n.prevA=null,n.leafA=t,n.nextA=i,n.prevB=null,n.leafB=e,n.nextB=s,n):(vi++,new fi(t,i,e,s))},fi.prototype.recycle=function(t){this.prevA=t.pooledPairs,t.pooledPairs=this};var di=function(t,i,e){e&&(e.leafA===i?e.prevA=t:e.prevB=t),t?t.leafA===i?t.nextA=e:t.nextB=e:i.pairs=e};yi.prototype.clearPairs=function(t){var i,e=this.pairs;for(this.pairs=null;e;)e.leafA===this?(i=e.nextA,di(e.prevB,e.leafB,e.nextB)):(i=e.nextB,di(e.prevA,e.leafA,e.nextA)),e.recycle(t),e=i};var _i=function(t,i,e){var s=t.pairs,n=i.pairs,r=e.makePair(t,s,i,n);t.pairs=i.pairs=r,s&&(s.leafA===t?s.prevA=r:s.prevB=r),n&&(n.leafA===i?n.prevA=r:n.prevB=r)};li.prototype.recycle=function(t){this.parent=t.pooledNodes,t.pooledNodes=this},yi.prototype.recycle=function(){},li.prototype.setA=function(t){this.A=t,t.parent=this},li.prototype.setB=function(t){this.B=t,t.parent=this},yi.prototype.isLeaf=!0,li.prototype.isLeaf=!1,li.prototype.otherChild=function(t){return this.A==t?this.B:this.A},li.prototype.replaceChild=function(t,s,r){n(t==this.A||t==this.B,"Node is not a child of parent."),this.A==t?(this.A.recycle(r),this.setA(s)):(this.B.recycle(r),this.setB(s));for(var o=this;o;o=o.parent){var a=o.A,h=o.B;o.bb_l=i(a.bb_l,h.bb_l),o.bb_b=i(a.bb_b,h.bb_b),o.bb_r=e(a.bb_r,h.bb_r),o.bb_t=e(a.bb_t,h.bb_t)}},li.prototype.bbArea=yi.prototype.bbArea=function(){return(this.bb_r-this.bb_l)*(this.bb_t-this.bb_b)};var xi=function(t,s){return(e(t.bb_r,s.bb_r)-i(t.bb_l,s.bb_l))*(e(t.bb_t,s.bb_t)-i(t.bb_b,s.bb_b))},mi=function(t,i){return Math.abs(t.bb_l+t.bb_r-i.bb_l-i.bb_r)+Math.abs(t.bb_b+t.bb_t-i.bb_b-i.bb_t)},gi=function(t,s,n){if(null==t)return s;if(t.isLeaf)return n.makeNode(s,t);var r=t.B.bbArea()+xi(t.A,s),o=t.A.bbArea()+xi(t.B,s);return r===o&&(r=mi(t.A,s),o=mi(t.B,s)),r>o?t.setB(gi(t.B,s,n)):t.setA(gi(t.A,s,n)),t.bb_l=i(t.bb_l,s.bb_l),t.bb_b=i(t.bb_b,s.bb_b),t.bb_r=e(t.bb_r,s.bb_r),t.bb_t=e(t.bb_t,s.bb_t),t};li.prototype.intersectsBB=yi.prototype.intersectsBB=function(t){return this.bb_l<=t.r&&t.l<=this.bb_r&&this.bb_b<=t.t&&t.b<=this.bb_t};var wi=function(t,i,e){t.intersectsBB(i)&&(t.isLeaf?e(t.obj):(wi(t.A,i,e),wi(t.B,i,e)))},Si=function(t,s,n){var r=1/(n.x-s.x),o=t.bb_l==s.x?-1/0:(t.bb_l-s.x)*r,a=t.bb_r==s.x?1/0:(t.bb_r-s.x)*r,h=i(o,a),c=e(o,a),p=1/(n.y-s.y),u=t.bb_b==s.y?-1/0:(t.bb_b-s.y)*p,l=t.bb_t==s.y?1/0:(t.bb_t-s.y)*p,b=i(u,l),y=e(u,l);if(c>=b&&y>=h){var v=e(h,b),f=i(c,y);if(f>=0&&1>=v)return e(v,0)}return 1/0},Ai=function(t,e,s,n,r){if(t.isLeaf)return r(t.obj);var o=Si(t.A,e,s),a=Si(t.B,e,s);return a>o?(n>o&&(n=i(n,Ai(t.A,e,s,n,r))),n>a&&(n=i(n,Ai(t.B,e,s,n,r)))):(n>a&&(n=i(n,Ai(t.B,e,s,n,r))),n>o&&(n=i(n,Ai(t.A,e,s,n,r)))),n};pi.prototype.subtreeRecycle=function(t){t.isLeaf&&(this.subtreeRecycle(t.A),this.subtreeRecycle(t.B),t.recycle(this))};var ji=function(t,i,e){if(i==t)return null;var s=i.parent;if(s==t){var n=t.otherChild(i);return n.parent=t.parent,t.recycle(e),n}return s.parent.replaceChild(s,s.otherChild(i),e),t},Bi=function(t,i){return t.bb_l<=i.bb_r&&i.bb_l<=t.bb_r&&t.bb_b<=i.bb_t&&i.bb_b<=t.bb_t};yi.prototype.markLeafQuery=function(t,i,e,s){Bi(t,this)&&(i?_i(t,this,e):(this.stamp<t.stamp&&_i(this,t,e),s&&s(t.obj,this.obj)))},li.prototype.markLeafQuery=function(t,i,e,s){Bi(t,this)&&(this.A.markLeafQuery(t,i,e,s),this.B.markLeafQuery(t,i,e,s))},yi.prototype.markSubtree=function(t,i,e){if(this.stamp==t.getStamp()){i&&i.markLeafQuery(this,!1,t,e);for(var s=this;s.parent;s=s.parent)s==s.parent.A?s.parent.B.markLeafQuery(this,!0,t,e):s.parent.A.markLeafQuery(this,!1,t,e)}else for(var n=this.pairs;n;)this===n.leafB?(e&&e(n.leafA.obj,this.obj),n=n.nextB):n=n.nextA},li.prototype.markSubtree=function(t,i,e){this.A.markSubtree(t,i,e),this.B.markSubtree(t,i,e)},yi.prototype.containsObj=function(t){return this.bb_l<=t.bb_l&&this.bb_r>=t.bb_r&&this.bb_b<=t.bb_b&&this.bb_t>=t.bb_t},yi.prototype.update=function(t){var i=t.root,e=this.obj;return this.containsObj(e)?!1:(t.getBB(this.obj,this),i=ji(i,this,t),t.root=gi(i,this,t),this.clearPairs(t),this.stamp=t.getStamp(),!0)},yi.prototype.addPairs=function(t){var i=t.dynamicIndex;if(i){var e=i.root;e&&e.markLeafQuery(this,!0,i,null)}else{var s=t.staticIndex.root;this.markSubtree(t,s,null)}},pi.prototype.insert=function(t,i){var e=new yi(this,t);this.leaves[i]=e,this.root=gi(this.root,e,this),this.count++,e.stamp=this.getStamp(),e.addPairs(this),this.incrementStamp()},pi.prototype.remove=function(t,i){var e=this.leaves[i];delete this.leaves[i],this.root=ji(this.root,e,this),this.count--,e.clearPairs(this),e.recycle(this)},pi.prototype.contains=function(t,i){return null!=this.leaves[i]};var Ci=function(){};pi.prototype.reindexQuery=function(t){if(this.root){var i,e=this.leaves;for(i in e)e[i].update(this);var s=this.staticIndex,n=s&&s.root;this.root.markSubtree(this,n,t),s&&!n&&this.collideStatic(this,s,t),this.incrementStamp()}},pi.prototype.reindex=function(){this.reindexQuery(Ci)},pi.prototype.reindexObject=function(t,i){var e=this.leaves[i];e&&(e.update(this)&&e.addPairs(this),this.incrementStamp())},pi.prototype.pointQuery=function(t,i){this.query(new D(t.x,t.y,t.x,t.y),i)},pi.prototype.segmentQuery=function(t,i,e,s){this.root&&Ai(this.root,t,i,e,s)},pi.prototype.query=function(t,i){this.root&&wi(this.root,t,i)},pi.prototype.count=function(){return this.count},pi.prototype.each=function(t){var i;for(i in this.leaves)t(this.leaves[i].obj)};var ki=function(t,s,n,r,o){return(e(t.bb_r,r)-i(t.bb_l,s))*(e(t.bb_t,o)-i(t.bb_b,n))},Mi=function(t,s,n,r){if(1==r)return s[n];if(2==r)return t.makeNode(s[n],s[n+1]);for(var o=s[n],a=o.bb_l,h=o.bb_b,c=o.bb_r,p=o.bb_t,u=n+r,l=n+1;u>l;l++)o=s[l],a=i(a,o.bb_l),h=i(h,o.bb_b),c=e(c,o.bb_r),p=e(p,o.bb_t);var b=c-a>p-h,y=Array(2*r);if(b)for(var l=n;u>l;l++)y[2*l+0]=s[l].bb_l,y[2*l+1]=s[l].bb_r;else for(var l=n;u>l;l++)y[2*l+0]=s[l].bb_b,y[2*l+1]=s[l].bb_t;y.sort(function(t,i){return t-i});var v=.5*(y[r-1]+y[r]),f=a,d=h,_=c,x=p,m=a,g=h,w=c,S=p;b?_=m=v:x=g=v;for(var A=u,j=n;A>j;){var o=s[j];ki(o,m,g,w,S)<ki(o,f,d,_,x)?(A--,s[j]=s[A],s[A]=o):j++}if(A==r){for(var o=null,l=n;u>l;l++)o=gi(o,s[l],t);return o}return NodeNew(t,Mi(t,s,n,A-n),Mi(t,s,A,u-A))};pi.prototype.optimize=function(){var t=Array(this.count),i=0;for(var e in this.leaves)t[i++]=this.nodes[e];tree.subtreeRecycle(root),this.root=Mi(tree,t,t.length)};var Ii=function(t,i){!t.isLeaf&&10>=i&&(Ii(t.A,i+1),Ii(t.B,i+1));for(var e="",s=0;i>s;s++)e+=" ";console.log(e+t.bb_b+" "+t.bb_t)};pi.prototype.log=function(){this.root&&Ii(this.root,0)};var Pi=t.CollisionHandler=function(){this.a=this.b=0};Pi.prototype.begin=function(){return!0},Pi.prototype.preSolve=function(){return!0},Pi.prototype.postSolve=function(){},Pi.prototype.separate=function(){};var Li=function(t,i){this.e=0,this.u=0,this.surface_vr=_,this.a=t,this.body_a=t.body,this.b=i,this.body_b=i.body,this.thread_a_next=this.thread_a_prev=null,this.thread_b_next=this.thread_b_prev=null,this.contacts=null,this.stamp=0,this.handler=null,this.swappedColl=!1,this.state="first coll"};Li.prototype.getShapes=function(){return this.swappedColl?[this.b,this.a]:[this.a,this.b]},Li.prototype.totalImpulse=function(){for(var t=this.contacts,i=new d(0,0),e=0,s=t.length;s>e;e++){var n=t[e];i.add(B(n.n,n.jnAcc))}return this.swappedColl?i:i.neg()},Li.prototype.totalImpulseWithFriction=function(){for(var t=this.contacts,i=new d(0,0),e=0,s=t.length;s>e;e++){var n=t[e];i.add(new d(n.jnAcc,n.jtAcc).rotate(n.n))}return this.swappedColl?i:i.neg()},Li.prototype.totalKE=function(){for(var t=(1-this.e)/(1+this.e),i=0,e=this.contacts,s=0,n=e.length;n>s;s++){var r=e[s],o=r.jnAcc,a=r.jtAcc;i+=t*o*o/r.nMass+a*a/r.tMass}return i},Li.prototype.ignore=function(){this.state="ignore"},Li.prototype.getA=function(){return this.swappedColl?this.b:this.a},Li.prototype.getB=function(){return this.swappedColl?this.a:this.b},Li.prototype.isFirstContact=function(){return"first coll"===this.state};var Ni=function(t,i,e){this.point=t,this.normal=i,this.dist=e};Li.prototype.getContactPointSet=function(){var t,i=Array(this.contacts.length);for(t=0;i.length>t;t++)i[t]=new Ni(this.contacts[t].p,this.contacts[t].n,this.contacts[t].dist);return i},Li.prototype.getNormal=function(t){var i=this.contacts[t].n;return this.swappedColl?j(i):i},Li.prototype.getPoint=function(t){return this.contacts[t].p},Li.prototype.getDepth=function(t){return this.contacts[t].dist};var Fi=function(t,i,e,s){e?e.body_a===i?e.thread_a_next=s:e.thread_b_next=s:i.arbiterList=s,s&&(s.body_a===i?s.thread_a_prev=e:s.thread_b_prev=e)};Li.prototype.unthread=function(){Fi(this,this.body_a,this.thread_a_prev,this.thread_a_next),Fi(this,this.body_b,this.thread_b_prev,this.thread_b_next),this.thread_a_prev=this.thread_a_next=null,this.thread_b_prev=this.thread_b_next=null},Li.prototype.update=function(t,i,e,s){if(this.contacts)for(var n=0;this.contacts.length>n;n++)for(var r=this.contacts[n],o=0;t.length>o;o++){var a=t[o];a.hash===r.hash&&(a.jnAcc=r.jnAcc,a.jtAcc=r.jtAcc)}this.contacts=t,this.handler=i,this.swappedColl=e.collision_type!==i.a,this.e=e.e*s.e,this.u=e.u*s.u,this.surface_vr=A(e.surface_v,s.surface_v),this.a=e,this.body_a=e.body,this.b=s,this.body_b=s.body,"cached"==this.state&&(this.state="first coll")},Li.prototype.preStep=function(t,e,s){for(var n=this.body_a,r=this.body_b,o=0;this.contacts.length>o;o++){var a=this.contacts[o];a.r1=A(a.p,n.p),a.r2=A(a.p,r.p),a.nMass=1/ye(n,r,a.r1,a.r2,a.n),a.tMass=1/ye(n,r,a.r1,a.r2,M(a.n)),a.bias=-s*i(0,a.dist+e)/t,a.jBias=0,a.bounce=ce(n,r,a.r1,a.r2,a.n)*this.e}},Li.prototype.applyCachedImpulse=function(t){if(!this.isFirstContact())for(var i=this.body_a,e=this.body_b,s=0;this.contacts.length>s;s++){var n=this.contacts[s],r=n.n.x,o=n.n.y,a=r*n.jnAcc-o*n.jtAcc,h=r*n.jtAcc+o*n.jnAcc;ue(i,e,n.r1,n.r2,a*t,h*t)}};var Qi=0,Ti=0;Li.prototype.applyImpulse=function(){Qi++;for(var t=this.body_a,i=this.body_b,s=this.surface_vr,n=this.u,r=0;this.contacts.length>r;r++){Ti++;var o=this.contacts[r],a=o.nMass,h=o.n,c=o.r1,p=o.r2,u=i.vx-p.y*i.w-(t.vx-c.y*t.w),l=i.vy+p.x*i.w-(t.vy+c.x*t.w),b=h.x*(i.v_biasx-p.y*i.w_bias-t.v_biasx+c.y*t.w_bias)+h.y*(p.x*i.w_bias+i.v_biasy-c.x*t.w_bias-t.v_biasy),y=m(u,l,h.x,h.y),f=m(u+s.x,l+s.y,-h.y,h.x),d=(o.bias-b)*a,_=o.jBias;o.jBias=e(_+d,0);var x=-(o.bounce+y)*a,g=o.jnAcc;o.jnAcc=e(g+x,0);var w=n*o.jnAcc,S=-f*o.tMass,A=o.jtAcc;o.jtAcc=v(A+S,-w,w);var j=h.x*(o.jBias-_),B=h.y*(o.jBias-_);le(t,-j,-B,c),le(i,j,B,p);var C=o.jnAcc-g,k=o.jtAcc-A;ue(t,i,c,p,h.x*C-h.y*k,h.x*k+h.y*C)}},Li.prototype.callSeparate=function(t){var i=t.lookupHandler(this.a.collision_type,this.b.collision_type);i.separate(this,t)},Li.prototype.next=function(t){return this.body_a==t?this.thread_a_next:this.thread_b_next};var Ri=0,Vi=function(t,i,e,s){this.p=t,this.n=i,this.dist=e,this.r1=this.r2=_,this.nMass=this.tMass=this.bounce=this.bias=0,this.jnAcc=this.jtAcc=this.jBias=0,this.hash=s,Ri++},Oi=[],qi=function(t,i,e,s){var n=e+s,r=A(i,t),o=N(r);if(!(o>=n*n)){var a=Math.sqrt(o);return new Vi(S(t,B(r,.5+(e-.5*n)/(a?a:1/0))),a?B(r,1/a):new d(1,0),a-n,0)}},Ei=function(t,i){var e=qi(t.tc,i.tc,t.r,i.r);return e?[e]:Oi},Hi=function(t,i){var e=i.ta,s=i.tb,n=t.tc,r=A(s,e),o=f(x(r,A(n,e))/N(r)),a=S(e,B(r,o)),h=qi(n,a,t.r,i.r);if(h){var c=h.n;return 0===o&&0>x(c,i.a_tangent)||1===o&&0>x(c,i.b_tangent)?Oi:[h]}return Oi},Di=0,Gi=function(t,i){var e=0,s=t.valueOnAxis(i[0].n,i[0].d);if(s>0)return-1;for(var n=1;i.length>n;n++){var r=t.valueOnAxis(i[n].n,i[n].d);if(r>0)return-1;r>s&&(s=r,e=n)}return Di=s,e},Wi=function(t,i,e,s){for(var n=[],r=t.tVerts,o=0;r.length>o;o+=2){var h=r[o],c=r[o+1];i.containsVertPartial(h,c,j(e))&&n.push(new Vi(new d(h,c),e,s,a(t.hashid,o)))}for(var p=i.tVerts,o=0;p.length>o;o+=2){var h=p[o],c=p[o+1];t.containsVertPartial(h,c,e)&&n.push(new Vi(new d(h,c),e,s,a(i.hashid,o)))}return n},zi=function(t,i,e,s){for(var n=[],r=t.tVerts,o=0;r.length>o;o+=2){var h=r[o],c=r[o+1];i.containsVert(h,c)&&n.push(new Vi(new d(h,c),e,s,a(t.hashid,o>>1)))}for(var p=i.tVerts,o=0;p.length>o;o+=2){var h=p[o],c=p[o+1];t.containsVert(h,c)&&n.push(new Vi(new d(h,c),e,s,a(i.hashid,o>>1)))}return n.length?n:Wi(t,i,e,s)},Ji=function(t,i){var e=Gi(i,t.tPlanes);if(-1==e)return Oi;var s=Di,n=Gi(t,i.tPlanes);if(-1==n)return Oi;var r=Di;return s>r?zi(t,i,t.tPlanes[e].n,s):zi(t,i,j(i.tPlanes[n].n),r)},Ui=function(t,e,s){var n=x(e,t.ta)-t.r,r=x(e,t.tb)-t.r;return i(n,r)-s},Yi=function(t,i,e,s,n){for(var r=C(i.tn,i.ta),o=C(i.tn,i.tb),h=B(i.tn,n),c=e.tVerts,p=0;c.length>p;p+=2){var u=c[p],l=c[p+1];if(m(u,l,h.x,h.y)<x(i.tn,i.ta)*n+i.r){var b=k(i.tn.x,i.tn.y,u,l);r>=b&&b>=o&&t.push(new Vi(new d(u,l),h,s,a(e.hashid,p)))}}},Ki=function(t,i){var e=[],s=i.tPlanes,n=s.length,r=x(t.tn,t.ta),o=i.valueOnAxis(t.tn,r)-t.r,h=i.valueOnAxis(j(t.tn),-r)-t.r;if(h>0||o>0)return Oi;var c=0,p=Ui(t,s[0].n,s[0].d);if(p>0)return Oi;for(var u=0;n>u;u++){var l=Ui(t,s[u].n,s[u].d);if(l>0)return Oi;l>p&&(p=l,c=u)}var b=j(s[c].n),y=S(t.ta,B(b,t.r)),v=S(t.tb,B(b,t.r));if(i.containsVert(y.x,y.y)&&e.push(new Vi(y,b,p,a(t.hashid,0))),i.containsVert(v.x,v.y)&&e.push(new Vi(v,b,p,a(t.hashid,1))),(o>=p||h>=p)&&(o>h?Yi(e,t,i,o,1):Yi(e,t,i,h,-1)),0===e.length){var f,_=2*c,m=i.tVerts,g=new d(m[_],m[_+1]);if(f=qi(t.ta,g,t.r,0,e))return[f];if(f=qi(t.tb,g,t.r,0,e))return[f];var w=2*n,A=new d(m[(_+2)%w],m[(_+3)%w]);if(f=qi(t.ta,A,t.r,0,e))return[f];if(f=qi(t.tb,A,t.r,0,e))return[f]}return e},Xi=function(t,i){for(var e=i.tPlanes,s=0,n=x(e[0].n,t.tc)-e[0].d-t.r,r=0;e.length>r;r++){var o=x(e[r].n,t.tc)-e[r].d-t.r;if(o>0)return Oi;o>n&&(n=o,s=r)}var a=e[s].n,h=i.tVerts,c=h.length,p=s<<1,u=h[p],l=h[p+1],b=h[(p+2)%c],y=h[(p+3)%c],v=k(a.x,a.y,u,l),f=k(a.x,a.y,b,y),_=C(a,t.tc);if(f>_){var m=qi(t.tc,new d(b,y),t.r,0,m);return m?[m]:Oi}if(v>_)return[new Vi(A(t.tc,B(a,t.r+n/2)),j(a),n,0)];var m=qi(t.tc,new d(u,l),t.r,0,m);
return m?[m]:Oi};X.prototype.collisionCode=0,$.prototype.collisionCode=1,ii.prototype.collisionCode=2,X.prototype.collisionTable=[Ei,Hi,Xi],$.prototype.collisionTable=[null,function(){return Oi},Ki],ii.prototype.collisionTable=[null,null,Ji];var Zi=t.collideShapes=function(t,i){return s(t.collisionCode<=i.collisionCode,"Collided shapes must be sorted by type"),t.collisionTable[i.collisionCode](t,i)},$i=new Pi,te=t.Space=function(){this.stamp=0,this.curr_dt=0,this.bodies=[],this.rousedBodies=[],this.sleepingComponents=[],this.staticShapes=new pi(null),this.activeShapes=new pi(this.staticShapes),this.arbiters=[],this.contactBuffersHead=null,this.cachedArbiters={},this.constraints=[],this.locked=0,this.collisionHandlers={},this.defaultHandler=$i,this.postStepCallbacks=[],this.iterations=10,this.gravity=_,this.damping=1,this.idleSpeedThreshold=0,this.sleepTimeThreshold=1/0,this.collisionSlop=.1,this.collisionBias=Math.pow(.9,60),this.collisionPersistence=3,this.enableContactGraph=!1,this.staticBody=new ni(1/0,1/0),this.staticBody.nodeIdleTime=1/0,this.collideShapes=this.makeCollideShapes()};te.prototype.getCurrentTimeStep=function(){return this.curr_dt},te.prototype.setIterations=function(t){this.iterations=t},te.prototype.isLocked=function(){return this.locked};var ie=function(t){s(!t.locked,"This addition/removal cannot be done safely during a call to cpSpaceStep()  or during a query. Put these calls into a post-step callback.")};te.prototype.addCollisionHandler=function(t,i,e,s,n,r){ie(this),this.removeCollisionHandler(t,i);var o=new Pi;o.a=t,o.b=i,e&&(o.begin=e),s&&(o.preSolve=s),n&&(o.postSolve=n),r&&(o.separate=r),this.collisionHandlers[a(t,i)]=o},te.prototype.removeCollisionHandler=function(t,i){ie(this),delete this.collisionHandlers[a(t,i)]},te.prototype.setDefaultCollisionHandler=function(t,i,e,s){ie(this);var n=new Pi;t&&(n.begin=t),i&&(n.preSolve=i),e&&(n.postSolve=e),s&&(n.separate=s),this.defaultHandler=n},te.prototype.lookupHandler=function(t,i){return this.collisionHandlers[a(t,i)]||this.defaultHandler},te.prototype.addShape=function(t){var i=t.body;return i.isStatic()?this.addStaticShape(t):(s(!t.space,"This shape is already added to a space and cannot be added to another."),ie(this),i.activate(),i.addShape(t),t.update(i.p,i.rot),this.activeShapes.insert(t,t.hashid),t.space=this,t)},te.prototype.addStaticShape=function(t){s(!t.space,"This shape is already added to a space and cannot be added to another."),ie(this);var i=t.body;return i.addShape(t),t.update(i.p,i.rot),this.staticShapes.insert(t,t.hashid),t.space=this,t},te.prototype.addBody=function(t){return s(!t.isStatic(),"Static bodies cannot be added to a space as they are not meant to be simulated."),s(!t.space,"This body is already added to a space and cannot be added to another."),ie(this),this.bodies.push(t),t.space=this,t},te.prototype.addConstraint=function(t){s(!t.space,"This shape is already added to a space and cannot be added to another."),ie(this);var i=t.a,e=t.b;return i.activate(),e.activate(),this.constraints.push(t),t.next_a=i.constraintList,i.constraintList=t,t.next_b=e.constraintList,e.constraintList=t,t.space=this,t},te.prototype.filterArbiters=function(t,i){for(var e in this.cachedArbiters){var s=this.cachedArbiters[e];(t===s.body_a&&(i===s.a||null===i)||t===s.body_b&&(i===s.b||null===i))&&(i&&"cached"!==s.state&&s.callSeparate(this),s.unthread(),h(this.arbiters,s),delete this.cachedArbiters[e])}},te.prototype.removeShape=function(t){var i=t.body;i.isStatic()?this.removeStaticShape(t):(s(this.containsShape(t),"Cannot remove a shape that was not added to the space. (Removed twice maybe?)"),ie(this),i.activate(),i.removeShape(t),this.filterArbiters(i,t),this.activeShapes.remove(t,t.hashid),t.space=null)},te.prototype.removeStaticShape=function(t){s(this.containsShape(t),"Cannot remove a static or sleeping shape that was not added to the space. (Removed twice maybe?)"),ie(this);var i=t.body;i.isStatic()&&i.activateStatic(t),i.removeShape(t),this.filterArbiters(i,t),this.staticShapes.remove(t,t.hashid),t.space=null},te.prototype.removeBody=function(t){s(this.containsBody(t),"Cannot remove a body that was not added to the space. (Removed twice maybe?)"),ie(this),t.activate(),h(this.bodies,t),t.space=null},te.prototype.removeConstraint=function(t){s(this.containsConstraint(t),"Cannot remove a constraint that was not added to the space. (Removed twice maybe?)"),ie(this),t.a.activate(),t.b.activate(),h(this.constraints,t),t.a.removeConstraint(t),t.b.removeConstraint(t),t.space=null},te.prototype.containsShape=function(t){return t.space===this},te.prototype.containsBody=function(t){return t.space==this},te.prototype.containsConstraint=function(t){return t.space==this},te.prototype.uncacheArbiter=function(t){delete this.cachedArbiters[a(t.a.hashid,t.b.hashid)],h(this.arbiters,t)},te.prototype.eachBody=function(t){this.lock();for(var i=this.bodies,e=0;i.length>e;e++)t(i[e]);for(var s=this.sleepingComponents,e=0;s.length>e;e++)for(var n=s[e],r=n;r;){var o=r.nodeNext;t(r),r=o}this.unlock(!0)},te.prototype.eachShape=function(t){this.lock(),this.activeShapes.each(t),this.staticShapes.each(t),this.unlock(!0)},te.prototype.eachConstraint=function(t){this.lock();for(var i=this.constraints,e=0;i.length>e;e++)t(i[e]);this.unlock(!0)},te.prototype.reindexStatic=function(){s(!this.locked,"You cannot manually reindex objects while the space is locked. Wait until the current query or step is complete."),this.staticShapes.each(function(t){var i=t.body;t.update(i.p,i.rot)}),this.staticShapes.reindex()},te.prototype.reindexShape=function(t){s(!this.locked,"You cannot manually reindex objects while the space is locked. Wait until the current query or step is complete.");var i=t.body;t.update(i.p,i.rot),this.activeShapes.reindexObject(t,t.hashid),this.staticShapes.reindexObject(t,t.hashid)},te.prototype.reindexShapesForBody=function(t){for(var i=t.shapeList;i;i=i.next)this.reindexShape(i)},te.prototype.useSpatialHash=function(t,i){throw Error("Spatial Hash not implemented.")},te.prototype.activateBody=function(t){if(s(!t.isRogue(),"Internal error: Attempting to activate a rogue body."),this.locked)-1===this.rousedBodies.indexOf(t)&&this.rousedBodies.push(t);else{this.bodies.push(t);for(var i=0;t.shapeList.length>i;i++){var e=t.shapeList[i];this.staticShapes.remove(e,e.hashid),this.activeShapes.insert(e,e.hashid)}for(var n=t.arbiterList;n;n=n.next(t)){var r=n.body_a;if(t===r||r.isStatic()){var o=n.a,h=n.b;this.cachedArbiters[a(o.hashid,h.hashid)]=n,n.stamp=this.stamp,n.handler=this.lookupHandler(o.collision_type,h.collision_type),this.arbiters.push(n)}}for(var c=t.constraintList;c;c=c.nodeNext){var r=c.a;(t===r||r.isStatic())&&this.constraints.push(c)}}},te.prototype.deactivateBody=function(t){s(!t.isRogue(),"Internal error: Attempting to deactivate a rogue body."),h(this.bodies,t);for(var i=0;t.shapeList.length>i;i++){var e=t.shapeList[i];this.activeShapes.remove(e,e.hashid),this.staticShapes.insert(e,e.hashid)}for(var n=t.arbiterList;n;n=n.next(t)){var r=n.body_a;(t===r||r.isStatic())&&this.uncacheArbiter(n)}for(var o=t.constraintList;o;o=o.nodeNext){var r=o.a;(t===r||r.isStatic())&&h(this.constraints,o)}};var ee=function(t){return t?t.nodeRoot:null},se=function(t){if(t&&t.isSleeping(t)){s(!t.isRogue(),"Internal Error: componentActivate() called on a rogue body.");for(var i=t.space,e=t;e;){var n=e.nodeNext;e.nodeIdleTime=0,e.nodeRoot=null,e.nodeNext=null,i.activateBody(e),e=n}h(i.sleepingComponents,t)}};ni.prototype.activate=function(){this.isRogue()||(this.nodeIdleTime=0,se(ee(this)))},ni.prototype.activateStatic=function(t){s(this.isStatic(),"Body.activateStatic() called on a non-static body.");for(var i=this.arbiterList;i;i=i.next(this))t&&t!=i.a&&t!=i.b||(i.body_a==this?i.body_b:i.body_a).activate()},ni.prototype.pushArbiter=function(t){n(null===(t.body_a===this?t.thread_a_next:t.thread_b_next),"Internal Error: Dangling contact graph pointers detected. (A)"),n(null===(t.body_a===this?t.thread_a_prev:t.thread_b_prev),"Internal Error: Dangling contact graph pointers detected. (B)");var i=this.arbiterList;n(null===i||null===(i.body_a===this?i.thread_a_prev:i.thread_b_prev),"Internal Error: Dangling contact graph pointers detected. (C)"),t.body_a===this?t.thread_a_next=i:t.thread_b_next=i,i&&(i.body_a===this?i.thread_a_prev=t:i.thread_b_prev=t),this.arbiterList=t};var ne=function(t,i){i.nodeRoot=t,i!==t&&(i.nodeNext=t.nodeNext,t.nodeNext=i)},re=function(t,i){if(!i.isRogue()){var e=ee(i);if(null==e){ne(t,i);for(var s=i.arbiterList;s;s=s.next(i))re(t,i==s.body_a?s.body_b:s.body_a);for(var r=i.constraintList;r;r=r.next(i))re(t,i==r.a?r.b:r.a)}else n(e===t,"Internal Error: Inconsistency detected in the contact graph.")}},oe=function(t,i){for(var e=t;e;e=e.nodeNext)if(i>e.nodeIdleTime)return!0;return!1};te.prototype.processComponents=function(t){for(var i=1/0!==this.sleepTimeThreshold,e=this.bodies,s=0;e.length>s;s++){var r=e[s];n(null===r.nodeNext,"Internal Error: Dangling next pointer detected in contact graph."),n(null===r.nodeRoot,"Internal Error: Dangling root pointer detected in contact graph.")}if(i)for(var o=this.idleSpeedThreshold,a=o?o*o:N(this.gravity)*t*t,s=0;e.length>s;s++){var r=e[s],h=a?r.m*a:0;r.nodeIdleTime=r.kineticEnergy()>h?0:r.nodeIdleTime+t}for(var c=this.arbiters,s=0,p=c.length;p>s;s++){var u=c[s],l=u.body_a,b=u.body_b;i&&((b.isRogue()&&!b.isStatic()||l.isSleeping())&&l.activate(),(l.isRogue()&&!l.isStatic()||b.isSleeping())&&b.activate()),l.pushArbiter(u),b.pushArbiter(u)}if(i){for(var y=this.constraints,s=0;y.length>s;s++){var v=y[s],l=v.a,b=v.b;b.isRogue()&&!b.isStatic()&&l.activate(),l.isRogue()&&!l.isStatic()&&b.activate()}for(var s=0;e.length>s;){var r=e[s];if(null!==ee(r)||(re(r,r),oe(r,this.sleepTimeThreshold)))s++,r.nodeRoot=null,r.nodeNext=null;else{this.sleepingComponents.push(r);for(var f=r;f;f=f.nodeNext)this.deactivateBody(f)}}}},ni.prototype.sleep=function(){this.sleepWithGroup(null)},ni.prototype.sleepWithGroup=function(t){s(!this.isStatic()&&!this.isRogue(),"Rogue and static bodies cannot be put to sleep.");var i=this.space;if(s(i,"Cannot put a rogue body to sleep."),s(!i.locked,"Bodies cannot be put to sleep during a query or a call to cpSpaceStep(). Put these calls into a post-step callback."),s(null===t||t.isSleeping(),"Cannot use a non-sleeping body as a group identifier."),this.isSleeping())return s(ee(this)===ee(t),"The body is already sleeping and it's group cannot be reassigned."),void 0;for(var e=0;this.shapeList.length>e;e++)this.shapeList[e].update(this.p,this.rot);if(i.deactivateBody(this),t){var n=ee(t);this.nodeRoot=n,this.nodeNext=n.nodeNext,this.nodeIdleTime=0,n.nodeNext=this}else this.nodeRoot=this,this.nodeNext=null,this.nodeIdleTime=0,i.sleepingComponents.push(this);h(i.bodies,this)},te.prototype.activateShapesTouchingShape=function(t){1/0!==this.sleepTimeThreshold&&this.shapeQuery(t,function(t){t.body.activate()})},te.prototype.pointQuery=function(t,i,e,s){var n=function(n){(!n.group||e!==n.group)&&i&n.layers&&n.pointQuery(t)&&s(n)},r=new D(t.x,t.y,t.x,t.y);this.lock(),this.activeShapes.query(r,n),this.staticShapes.query(r,n),this.unlock(!0)},te.prototype.pointQueryFirst=function(t,i,e){var s=null;return this.pointQuery(t,i,e,function(t){t.sensor||(s=t)}),s},te.prototype.nearestPointQuery=function(t,i,e,s,n){var r=function(r){if((!r.group||s!==r.group)&&e&r.layers){var o=r.nearestPointQuery(t);i>o.d&&n(r,o.d,o.p)}},o=G(t,i);this.lock(),this.activeShapes.query(o,r),this.staticShapes.query(o,r),this.unlock(!0)},te.prototype.nearestPointQueryNearest=function(t,i,e,s){var n,r=function(r){if((!r.group||s!==r.group)&&e&r.layers&&!r.sensor){var o=r.nearestPointQuery(t);i>o.d&&(!n||o.d<n.d)&&(n=o)}},o=G(t,i);return this.activeShapes.query(o,r),this.staticShapes.query(o,r),n},te.prototype.segmentQuery=function(t,i,e,s,n){var r=function(r){var o;return(!r.group||s!==r.group)&&e&r.layers&&(o=r.segmentQuery(t,i))&&n(r,o.t,o.n),1};this.lock(),this.staticShapes.segmentQuery(t,i,1,r),this.activeShapes.segmentQuery(t,i,1,r),this.unlock(!0)},te.prototype.segmentQueryFirst=function(t,i,e,s){var n=null,r=function(r){var o;return(!r.group||s!==r.group)&&e&r.layers&&!r.sensor&&(o=r.segmentQuery(t,i))&&(null===n||o.t<n.t)&&(n=o),n?n.t:1};return this.staticShapes.segmentQuery(t,i,1,r),this.activeShapes.segmentQuery(t,i,n?n.t:1,r),n},te.prototype.bbQuery=function(t,i,e,s){var n=function(n){(!n.group||e!==n.group)&&i&n.layers&&W(t,n.bb_l,n.bb_b,n.bb_r,n.bb_t)&&s(n)};this.lock(),this.activeShapes.query(t,n),this.staticShapes.query(t,n),this.unlock(!0)},te.prototype.shapeQuery=function(t,i){var e=t.body;e&&t.update(e.p,e.rot);var s=new D(t.bb_l,t.bb_b,t.bb_r,t.bb_t),n=!1,r=function(e){var s=t;if((!s.group||s.group!==e.group)&&s.layers&e.layers&&s!==e){var r;if(s.collisionCode<=e.collisionCode)r=Zi(s,e);else{r=Zi(e,s);for(var o=0;r.length>o;o++)r[o].n=j(r[o].n)}if(r.length&&(n=!(s.sensor||e.sensor),i)){for(var a=Array(r.length),o=0;r.length>o;o++)a[o]=new Ni(r[o].p,r[o].n,r[o].dist);i(e,a)}}};return this.lock(),this.activeShapes.query(s,r),this.staticShapes.query(s,r),this.unlock(!0),n},te.prototype.addPostStepCallback=function(t){n(this.locked,"Adding a post-step callback when the space is not locked is unnecessary. Post-step callbacks will not called until the end of the next call to cpSpaceStep() or the next query."),this.postStepCallbacks.push(t)},te.prototype.runPostStepCallbacks=function(){for(var t=0;this.postStepCallbacks.length>t;t++)this.postStepCallbacks[t]();this.postStepCallbacks=[]},te.prototype.lock=function(){this.locked++},te.prototype.unlock=function(t){if(this.locked--,s(this.locked>=0,"Internal Error: Space lock underflow."),0===this.locked&&t){for(var i=this.rousedBodies,e=0;i.length>e;e++)this.activateBody(i[e]);i.length=0,this.runPostStepCallbacks()}},te.prototype.makeCollideShapes=function(){var t=this;return function(i,e){var s=t;if(i.bb_l<=e.bb_r&&e.bb_l<=i.bb_r&&i.bb_b<=e.bb_t&&e.bb_b<=i.bb_t&&i.body!==e.body&&(!i.group||i.group!==e.group)&&i.layers&e.layers){var n=s.lookupHandler(i.collision_type,e.collision_type),r=i.sensor||e.sensor;if(!r||n!==$i){if(i.collisionCode>e.collisionCode){var o=i;i=e,e=o}var h=Zi(i,e);if(0!==h.length){var c=a(i.hashid,e.hashid),p=s.cachedArbiters[c];p||(p=s.cachedArbiters[c]=new Li(i,e)),p.update(h,n,i,e),"first coll"!=p.state||n.begin(p,s)||p.ignore(),"ignore"!==p.state&&n.preSolve(p,s)&&!r?s.arbiters.push(p):(p.contacts=null,"ignore"!==p.state&&(p.state="normal")),p.stamp=s.stamp}}}}},te.prototype.arbiterSetFilter=function(t){var i=this.stamp-t.stamp,e=t.body_a,s=t.body_b;return(e.isStatic()||e.isSleeping())&&(s.isStatic()||s.isSleeping())?!0:(i>=1&&"cached"!=t.state&&(t.callSeparate(this),t.state="cached"),i>=this.collisionPersistence?(t.contacts=null,!1):!0)};var ae=function(t){var i=t.body;t.update(i.p,i.rot)};te.prototype.step=function(t){if(0!==t){s(0===_.x&&0===_.y,"vzero is invalid"),this.stamp++;var i=this.curr_dt;this.curr_dt=t;var e,n,r,o=this.bodies,a=this.constraints,h=this.arbiters;for(e=0;h.length>e;e++){var c=h[e];c.state="normal",c.body_a.isSleeping()||c.body_b.isSleeping()||c.unthread()}for(h.length=0,this.lock(),e=0;o.length>e;e++)o[e].position_func(t);this.activeShapes.each(ae),this.activeShapes.reindexQuery(this.collideShapes),this.unlock(!1),this.processComponents(t),this.lock();for(r in this.cachedArbiters)this.arbiterSetFilter(this.cachedArbiters[r])||delete this.cachedArbiters[r];var p=this.collisionSlop,u=1-Math.pow(this.collisionBias,t);for(e=0;h.length>e;e++)h[e].preStep(t,p,u);for(e=0;a.length>e;e++){var l=a[e];l.preSolve(this),l.preStep(t)}var b=Math.pow(this.damping,t),y=this.gravity;for(e=0;o.length>e;e++)o[e].velocity_func(y,b,t);var v=0===i?0:t/i;for(e=0;h.length>e;e++)h[e].applyCachedImpulse(v);for(e=0;a.length>e;e++)a[e].applyCachedImpulse(v);for(e=0;this.iterations>e;e++){for(n=0;h.length>n;n++)h[n].applyImpulse();for(n=0;a.length>n;n++)a[n].applyImpulse()}for(e=0;a.length>e;e++)a[e].postSolve(this);for(e=0;h.length>e;e++)h[e].handler.postSolve(h[e],this);this.unlock(!0)}};var he=function(t,i,e,s){var n=t.vx+-e.y*t.w,r=t.vy+e.x*t.w,o=i.vx+-s.y*i.w,a=i.vy+s.x*i.w;return new d(o-n,a-r)},ce=function(t,i,e,s,n){var r=t.vx+-e.y*t.w,o=t.vy+e.x*t.w,a=i.vx+-s.y*i.w,h=i.vy+s.x*i.w;return m(a-r,h-o,n.x,n.y)},pe=function(t,i,e,s){t.vx+=i*t.m_inv,t.vy+=e*t.m_inv,t.w+=t.i_inv*(s.x*e-s.y*i)},ue=function(t,i,e,s,n,r){pe(t,-n,-r,e),pe(i,n,r,s)},le=function(t,i,e,s){t.v_biasx+=i*t.m_inv,t.v_biasy+=e*t.m_inv,t.w_bias+=t.i_inv*k(s.x,s.y,i,e)},be=function(t,i,e){var s=C(i,e);return t.m_inv+t.i_inv*s*s},ye=function(t,i,e,s,r){var o=be(t,e,r)+be(i,s,r);return n(0!==o,"Unsolvable collision or constraint."),o},ve=function(t,i,e,s,r,o){var a,h,c,p,u=t.m_inv+i.m_inv;a=u,h=0,c=0,p=u;var l=t.i_inv,b=e.x*e.x*l,y=e.y*e.y*l,v=-e.x*e.y*l;a+=y,h+=v,c+=v,p+=b;var f=i.i_inv,d=s.x*s.x*f,_=s.y*s.y*f,x=-s.x*s.y*f;a+=_,h+=x,c+=x,p+=d;var m=a*p-h*c;n(0!==m,"Unsolvable constraint.");var g=1/m;r.x=p*g,r.y=-h*g,o.x=-c*g,o.y=a*g},fe=function(t,i,e){return new d(x(t,i),x(t,e))},de=function(t,i){return 1-Math.pow(t,i)},_e=t.Constraint=function(t,i){this.a=t,this.b=i,this.space=null,this.next_a=null,this.next_b=null,this.maxForce=1/0,this.errorBias=Math.pow(.9,60),this.maxBias=1/0};_e.prototype.activateBodies=function(){this.a&&this.a.activate(),this.b&&this.b.activate()},_e.prototype.preStep=function(){},_e.prototype.applyCachedImpulse=function(){},_e.prototype.applyImpulse=function(){},_e.prototype.getImpulse=function(){return 0},_e.prototype.preSolve=function(){},_e.prototype.postSolve=function(){},_e.prototype.next=function(t){return this.a===t?this.next_a:this.next_b};var xe=t.PinJoint=function(t,i,e,s){_e.call(this,t,i),this.anchr1=e,this.anchr2=s;var r=t?S(t.p,P(e,t.rot)):e,o=i?S(i.p,P(s,i.rot)):s;this.dist=g(A(o,r)),n(this.dist>0,"You created a 0 length pin joint. A pivot joint will be much more stable."),this.r1=this.r2=null,this.n=null,this.nMass=0,this.jnAcc=this.jnMax=0,this.bias=0};xe.prototype=Object.create(_e.prototype),xe.prototype.preStep=function(t){var i=this.a,e=this.b;this.r1=P(this.anchr1,i.rot),this.r2=P(this.anchr2,e.rot);var s=A(S(e.p,this.r2),S(i.p,this.r1)),n=g(s);this.n=B(s,1/(n?n:1/0)),this.nMass=1/ye(i,e,this.r1,this.r2,this.n);var r=this.maxBias;this.bias=v(-de(this.errorBias,t)*(n-this.dist)/t,-r,r),this.jnMax=this.maxForce*t},xe.prototype.applyCachedImpulse=function(t){var i=B(this.n,this.jnAcc*t);ue(this.a,this.b,this.r1,this.r2,i.x,i.y)},xe.prototype.applyImpulse=function(){var t=this.a,i=this.b,e=this.n,s=ce(t,i,this.r1,this.r2,e),n=(this.bias-s)*this.nMass,r=this.jnAcc;this.jnAcc=v(r+n,-this.jnMax,this.jnMax),n=this.jnAcc-r,ue(t,i,this.r1,this.r2,e.x*n,e.y*n)},xe.prototype.getImpulse=function(){return Math.abs(this.jnAcc)};var me=t.SlideJoint=function(t,i,e,s,n,r){_e.call(this,t,i),this.anchr1=e,this.anchr2=s,this.min=n,this.max=r,this.r1=this.r2=this.n=null,this.nMass=0,this.jnAcc=this.jnMax=0,this.bias=0};me.prototype=Object.create(_e.prototype),me.prototype.preStep=function(t){var i=this.a,e=this.b;this.r1=P(this.anchr1,i.rot),this.r2=P(this.anchr2,e.rot);var s=A(S(e.p,this.r2),S(i.p,this.r1)),n=g(s),r=0;n>this.max?(r=n-this.max,this.n=R(s)):this.min>n?(r=this.min-n,this.n=j(R(s))):(this.n=_,this.jnAcc=0),this.nMass=1/ye(i,e,this.r1,this.r2,this.n);var o=this.maxBias;this.bias=v(-de(this.errorBias,t)*r/t,-o,o),this.jnMax=this.maxForce*t},me.prototype.applyCachedImpulse=function(t){var i=this.jnAcc*t;ue(this.a,this.b,this.r1,this.r2,this.n.x*i,this.n.y*i)},me.prototype.applyImpulse=function(){if(0!==this.n.x||0!==this.n.y){var t=this.a,i=this.b,e=this.n,s=this.r1,n=this.r2,r=he(t,i,s,n),o=x(r,e),a=(this.bias-o)*this.nMass,h=this.jnAcc;this.jnAcc=v(h+a,-this.jnMax,0),a=this.jnAcc-h,ue(t,i,this.r1,this.r2,e.x*a,e.y*a)}},me.prototype.getImpulse=function(){return Math.abs(this.jnAcc)};var ge=t.PivotJoint=function(t,i,e,s){if(_e.call(this,t,i),s===void 0){var n=e;e=t?t.world2Local(n):n,s=i?i.world2Local(n):n}this.anchr1=e,this.anchr2=s,this.r1=this.r2=_,this.k1=new d(0,0),this.k2=new d(0,0),this.jAcc=_,this.jMaxLen=0,this.bias=_};ge.prototype=Object.create(_e.prototype),ge.prototype.preStep=function(t){var i=this.a,e=this.b;this.r1=P(this.anchr1,i.rot),this.r2=P(this.anchr2,e.rot),ve(i,e,this.r1,this.r2,this.k1,this.k2),this.jMaxLen=this.maxForce*t;var s=A(S(e.p,this.r2),S(i.p,this.r1));this.bias=V(B(s,-de(this.errorBias,t)/t),this.maxBias)},ge.prototype.applyCachedImpulse=function(t){ue(this.a,this.b,this.r1,this.r2,this.jAcc.x*t,this.jAcc.y*t)},ge.prototype.applyImpulse=function(){var t=this.a,i=this.b,e=this.r1,s=this.r2,n=he(t,i,e,s),r=fe(A(this.bias,n),this.k1,this.k2),o=this.jAcc;this.jAcc=V(S(this.jAcc,r),this.jMaxLen),ue(t,i,this.r1,this.r2,this.jAcc.x-o.x,this.jAcc.y-o.y)},ge.prototype.getImpulse=function(){return g(this.jAcc)};var we=t.GrooveJoint=function(t,i,e,s,n){_e.call(this,t,i),this.grv_a=e,this.grv_b=s,this.grv_n=M(T(A(s,e))),this.anchr2=n,this.grv_tn=null,this.clamp=0,this.r1=this.r2=null,this.k1=new d(0,0),this.k2=new d(0,0),this.jAcc=_,this.jMaxLen=0,this.bias=null};we.prototype=Object.create(_e.prototype),we.prototype.preStep=function(t){var i=this.a,e=this.b,s=i.local2World(this.grv_a),n=i.local2World(this.grv_b),r=P(this.grv_n,i.rot),o=x(s,r);this.grv_tn=r,this.r2=P(this.anchr2,e.rot);var a=C(S(e.p,this.r2),r);C(s,r)>=a?(this.clamp=1,this.r1=A(s,i.p)):a>=C(n,r)?(this.clamp=-1,this.r1=A(n,i.p)):(this.clamp=0,this.r1=A(S(B(M(r),-a),B(r,o)),i.p)),ve(i,e,this.r1,this.r2,this.k1,this.k2),this.jMaxLen=this.maxForce*t;var h=A(S(e.p,this.r2),S(i.p,this.r1));this.bias=V(B(h,-de(this.errorBias,t)/t),this.maxBias)},we.prototype.applyCachedImpulse=function(t){ue(this.a,this.b,this.r1,this.r2,this.jAcc.x*t,this.jAcc.y*t)},we.prototype.grooveConstrain=function(t){var i=this.grv_tn,e=this.clamp*C(t,i)>0?t:I(t,i);return V(e,this.jMaxLen)},we.prototype.applyImpulse=function(){var t=this.a,i=this.b,e=this.r1,s=this.r2,n=he(t,i,e,s),r=fe(A(this.bias,n),this.k1,this.k2),o=this.jAcc;this.jAcc=this.grooveConstrain(S(o,r)),ue(t,i,this.r1,this.r2,this.jAcc.x-o.x,this.jAcc.y-o.y)},we.prototype.getImpulse=function(){return g(this.jAcc)},we.prototype.setGrooveA=function(t){this.grv_a=t,this.grv_n=M(T(A(this.grv_b,t))),this.activateBodies()},we.prototype.setGrooveB=function(t){this.grv_b=t,this.grv_n=M(T(A(t,this.grv_a))),this.activateBodies()};var Se=function(t,i){return(t.restLength-i)*t.stiffness},Ae=t.DampedSpring=function(t,i,e,s,n,r,o){_e.call(this,t,i),this.anchr1=e,this.anchr2=s,this.restLength=n,this.stiffness=r,this.damping=o,this.springForceFunc=Se,this.target_vrn=this.v_coef=0,this.r1=this.r2=null,this.nMass=0,this.n=null};Ae.prototype=Object.create(_e.prototype),Ae.prototype.preStep=function(t){var i=this.a,e=this.b;this.r1=P(this.anchr1,i.rot),this.r2=P(this.anchr2,e.rot);var s=A(S(e.p,this.r2),S(i.p,this.r1)),r=g(s);this.n=B(s,1/(r?r:1/0));var o=ye(i,e,this.r1,this.r2,this.n);n(0!==o,"Unsolvable this."),this.nMass=1/o,this.target_vrn=0,this.v_coef=1-Math.exp(-this.damping*t*o);var a=this.springForceFunc(this,r);ue(i,e,this.r1,this.r2,this.n.x*a*t,this.n.y*a*t)},Ae.prototype.applyCachedImpulse=function(){},Ae.prototype.applyImpulse=function(){var t=this.a,i=this.b,e=this.n,s=this.r1,n=this.r2,r=ce(t,i,s,n,e),o=(this.target_vrn-r)*this.v_coef;this.target_vrn=r+o,o*=this.nMass,ue(t,i,this.r1,this.r2,this.n.x*o,this.n.y*o)},Ae.prototype.getImpulse=function(){return 0};var je=function(t,i){return(i-t.restAngle)*t.stiffness},Be=t.DampedRotarySpring=function(t,i,e,s,n){_e.call(this,t,i),this.restAngle=e,this.stiffness=s,this.damping=n,this.springTorqueFunc=je,this.target_wrn=0,this.w_coef=0,this.iSum=0};Be.prototype=Object.create(_e.prototype),Be.prototype.preStep=function(t){var i=this.a,e=this.b,s=i.i_inv+e.i_inv;n(0!==s,"Unsolvable spring."),this.iSum=1/s,this.w_coef=1-Math.exp(-this.damping*t*s),this.target_wrn=0;var r=this.springTorqueFunc(this,i.a-e.a)*t;i.w-=r*i.i_inv,e.w+=r*e.i_inv},Be.prototype.applyImpulse=function(){var t=this.a,i=this.b,e=t.w-i.w,s=(this.target_wrn-e)*this.w_coef;this.target_wrn=e+s;var n=s*this.iSum;t.w+=n*t.i_inv,i.w-=n*i.i_inv};var Ce=t.RotaryLimitJoint=function(t,i,e,s){_e.call(this,t,i),this.min=e,this.max=s,this.jAcc=0,this.iSum=this.bias=this.jMax=0};Ce.prototype=Object.create(_e.prototype),Ce.prototype.preStep=function(t){var i=this.a,e=this.b,s=e.a-i.a,n=0;s>this.max?n=this.max-s:this.min>s&&(n=this.min-s),this.iSum=1/(1/i.i+1/e.i);var r=this.maxBias;this.bias=v(-de(this.errorBias,t)*n/t,-r,r),this.jMax=this.maxForce*t,this.bias||(this.jAcc=0)},Ce.prototype.applyCachedImpulse=function(t){var i=this.a,e=this.b,s=this.jAcc*t;i.w-=s*i.i_inv,e.w+=s*e.i_inv},Ce.prototype.applyImpulse=function(){if(this.bias){var t=this.a,i=this.b,e=i.w-t.w,s=-(this.bias+e)*this.iSum,n=this.jAcc;this.jAcc=0>this.bias?v(n+s,0,this.jMax):v(n+s,-this.jMax,0),s=this.jAcc-n,t.w-=s*t.i_inv,i.w+=s*i.i_inv}},Ce.prototype.getImpulse=function(){return Math.abs(joint.jAcc)};var ke=t.RatchetJoint=function(t,i,e,s){_e.call(this,t,i),this.angle=0,this.phase=e,this.ratchet=s,this.angle=(i?i.a:0)-(t?t.a:0),this.iSum=this.bias=this.jAcc=this.jMax=0};ke.prototype=Object.create(_e.prototype),ke.prototype.preStep=function(t){var i=this.a,e=this.b,s=this.angle,n=this.phase,r=this.ratchet,o=e.a-i.a,a=s-o,h=0;a*r>0?h=a:this.angle=Math.floor((o-n)/r)*r+n,this.iSum=1/(i.i_inv+e.i_inv);var c=this.maxBias;this.bias=v(-de(this.errorBias,t)*h/t,-c,c),this.jMax=this.maxForce*t,this.bias||(this.jAcc=0)},ke.prototype.applyCachedImpulse=function(t){var i=this.a,e=this.b,s=this.jAcc*t;i.w-=s*i.i_inv,e.w+=s*e.i_inv},ke.prototype.applyImpulse=function(){if(this.bias){var t=this.a,i=this.b,e=i.w-t.w,s=this.ratchet,n=-(this.bias+e)*this.iSum,r=this.jAcc;this.jAcc=v((r+n)*s,0,this.jMax*Math.abs(s))/s,n=this.jAcc-r,t.w-=n*t.i_inv,i.w+=n*i.i_inv}},ke.prototype.getImpulse=function(t){return Math.abs(t.jAcc)};var Me=t.GearJoint=function(t,i,e,s){_e.call(this,t,i),this.phase=e,this.ratio=s,this.ratio_inv=1/s,this.jAcc=0,this.iSum=this.bias=this.jMax=0};Me.prototype=Object.create(_e.prototype),Me.prototype.preStep=function(t){var i=this.a,e=this.b;this.iSum=1/(i.i_inv*this.ratio_inv+this.ratio*e.i_inv);var s=this.maxBias;this.bias=v(-de(this.errorBias,t)*(e.a*this.ratio-i.a-this.phase)/t,-s,s),this.jMax=this.maxForce*t},Me.prototype.applyCachedImpulse=function(t){var i=this.a,e=this.b,s=this.jAcc*t;i.w-=s*i.i_inv*this.ratio_inv,e.w+=s*e.i_inv},Me.prototype.applyImpulse=function(){var t=this.a,i=this.b,e=i.w*this.ratio-t.w,s=(this.bias-e)*this.iSum,n=this.jAcc;this.jAcc=v(n+s,-this.jMax,this.jMax),s=this.jAcc-n,t.w-=s*t.i_inv*this.ratio_inv,i.w+=s*i.i_inv},Me.prototype.getImpulse=function(){return Math.abs(this.jAcc)},Me.prototype.setRatio=function(t){this.ratio=t,this.ratio_inv=1/t,this.activateBodies()};var Ie=t.SimpleMotor=function(t,i,e){_e.call(this,t,i),this.rate=e,this.jAcc=0,this.iSum=this.jMax=0};Ie.prototype=Object.create(_e.prototype),Ie.prototype.preStep=function(t){this.iSum=1/(this.a.i_inv+this.b.i_inv),this.jMax=this.maxForce*t},Ie.prototype.applyCachedImpulse=function(t){var i=this.a,e=this.b,s=this.jAcc*t;i.w-=s*i.i_inv,e.w+=s*e.i_inv},Ie.prototype.applyImpulse=function(){var t=this.a,i=this.b,e=i.w-t.w+this.rate,s=-e*this.iSum,n=this.jAcc;this.jAcc=v(n+s,-this.jMax,this.jMax),s=this.jAcc-n,t.w-=s*t.i_inv,i.w+=s*i.i_inv},Ie.prototype.getImpulse=function(){return Math.abs(this.jAcc)}})();
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(done) );
        });
        function done(err) {
          if (err) {
              callback(err);
              callback = function () {};
          }
          else {
              completed += 1;
              if (completed >= arr.length) {
                  callback();
              }
          }
        }
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        if (!callback) {
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err) {
                    callback(err);
                });
            });
        } else {
            var results = [];
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        var remainingTasks = keys.length
        if (!remainingTasks) {
            return callback();
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            remainingTasks--
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (!remainingTasks) {
                var theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = function () {};

                theCallback(null, results);
            }
        });

        _each(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;
        var wrappedTask = function(wrappedCallback, wrappedResults) {
            var retryAttempt = function(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            };
            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }
        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            started: false,
            paused: false,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            kill: function () {
              q.drain = null;
              q.tasks = [];
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                if (q.paused === true) { return; }
                q.paused = true;
                q.process();
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                q.process();
            }
        };
        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            drained: true,
            push: function (data, callback) {
                if (!_isArray(data)) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain && !cargo.drained) cargo.drain();
                    cargo.drained = true;
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0, tasks.length);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

var ARE, AREActorInterface, AREAnimationInterface, AREBezAnimation, ARECircleActor, AREColor3, AREEngineInterface, AREInterface, ARELog, AREPolygonActor, AREPsyxAnimation, ARERawActor, ARERectangleActor, ARERenderer, AREShader, ARETriangleActor, AREVector2, AREVertAnimation, PhysicsManager, nextHighestPowerOfTwo, precision, precision_declaration, varying_precision,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ARERawActor = (function() {
  ARERawActor.defaultFriction = 0.3;

  ARERawActor.defaultMass = 10;

  ARERawActor.defaultElasticity = 0.2;


  /*
   * Adds the actor to the renderer actor list, gets a unique id from the
   * renderer, and builds our vert buffer.
   *
   * If no texture verts are provided, a default array is provided for square
   * actors.
   *
   * @param [ARERenderer] renderer
   * @param [Array<Number>] vertices flat array of vertices (x1, y1, x2, ...)
   * @param [Array<Number>] texverts flat array of texture coords, optional
   */

  function ARERawActor(_renderer, verts, texverts) {
    this._renderer = _renderer;
    this._initializeValues();
    this._id = this._renderer.getNextId();
    this._renderer.addActor(this);
    if (this._renderer.getGL()) {
      this._indiceBuffer = this._renderer.getGL().createBuffer();
    }
    this._ownIndiceBuffer = this._indiceBuffer;
    this._hasOwnIndiceBuffer = true;
    this._hostActorId = null;
    this._vertexData = null;
    this._vertStride = 4 * Float32Array.BYTES_PER_ELEMENT;
    this._uvOffset = 2 * Float32Array.BYTES_PER_ELEMENT;
    this.updateVertices(verts, texverts);
    this.setColor(new AREColor3(255, 255, 255));
    this.clearTexture();
  }


  /*
   * Sets up default values and initializes our data structures.
   * @private
   */

  ARERawActor.prototype._initializeValues = function() {
    if (this._renderer.isWGLRendererActive() && !(this._gl = this._renderer.getGL())) {
      throw new Error("GL context is required for actor initialization!");
    }
    this._color = null;
    this._strokeColor = null;
    this._strokeWidth = 1;
    this._colArray = null;
    this._opacity = 1.0;
    this._needsDelete = false;
    this._visible = true;
    this.layer = 0;
    this._physicsLayer = ~0;
    this._id = -1;
    this._position = {
      x: 0,
      y: 0
    };
    this._rotation = 0;
    this._bounds = {
      w: 0,
      h: 0
    };
    this._initializeModelMatrix();
    this._updateModelMatrix();

    /*
     * Physics values
     */
    this._physics = false;
    this._friction = null;
    this._mass = null;
    this._elasticity = null;

    /*
     * Our actual vertex lists. Note that we will optionally use a different
     * set of vertices for the physical body!
     */
    this._vertices = [];
    this._psyxVertices = [];
    this._texVerts = [];

    /*
     * If we modify our UVs (scaling, translation), we always do so relative
     * to the original UVs in this array (updated on true UV update)
     */
    this._origTexVerts = [];

    /*
     * Vertice containers
     */
    this._vertBuffer = null;
    this._vertBufferFloats = null;

    /*
     * Shader handles, for now there are only three
     */
    this._sh_handles = {};

    /*
     * Render modes decide how the vertices are treated.
     * @see AREREnderer.GL_MODE_*
     */
    this._renderMode = ARERenderer.GL_MODE_TRIANGLE_FAN;

    /*
     * Render styles decide how the object is filled/stroked
     * @see AREREnderer.RENDER_STYLE_*
     */
    this._renderStyle = ARERenderer.RENDER_STYLE_FILL;
    this._texture = null;
    this._clipRect = [0.0, 0.0, 1.0, 1.0];
    this._attachedTexture = null;
    return this.attachedTextureAnchor = {
      clipRect: [0.0, 0.0, 1.0, 1.0],
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      angle: 0
    };
  };


  /*
   * Return the renderer that we belong to
   *
   * @return [ARERenderer] renderer
   */

  ARERawActor.prototype.getRenderer = function() {
    return this._renderer;
  };


  /*
   * Helper to signal to the renderer that we need to be deleted
   * This is done so actors can be deleted in one batch at the end of the render
   * loop
   */

  ARERawActor.prototype.flagForDelete = function() {
    return this._needsDelete = true;
  };


  /*
   * Check if we need to be deleted
   *
   * @return [Boolean] delete
   */

  ARERawActor.prototype.flaggedForDeletion = function() {
    return this._needsDelete;
  };


  /*
   * Removes the Actor
   */

  ARERawActor.prototype.destroy = function() {
    return this.flagForDelete();
  };


  /*
   * Delete the actor, should only be called by the renderer!
   */

  ARERawActor.prototype.rendererActorDelete = function() {
    var a, outsourcedActors, _i, _len;
    this.destroyPhysicsBody();
    outsourcedActors = _.filter(this._renderer._actors, function(a) {
      return !a.hasOwnIndiceBuffer();
    });
    for (_i = 0, _len = outsourcedActors.length; _i < _len; _i++) {
      a = outsourcedActors[_i];
      if (a.getHostId() === this._id) {
        a.clearHostIndiceBuffer();
      }
    }
    return this._renderer.getGL().deleteBuffer(this._ownIndiceBuffer);
  };


  /*
   * Get the WebGL pointer to our indice buffer
   *
   * @return [Number]
   */

  ARERawActor.prototype.getIndiceBuffer = function() {
    return this._ownIndiceBuffer;
  };


  /*
   * Get the WebGL pointer to our used indice buffer (likely to be borrowed)
   *
   * @return [Number]
   */

  ARERawActor.prototype.getUsedIndiceBuffer = function() {
    return this._ownIndiceBuffer;
  };


  /*
   * Useful method allowing us to re-use another actor's indice buffer. This
   * helps keep renderer VBO size down.
   *
   * @param [Number] buffer
   * @param [Number] actorId
   */

  ARERawActor.prototype.setHostIndiceBuffer = function(buffer, actorId) {
    this._indiceBuffer = buffer;
    this._hostActorId = actorId;
    this._hasOwnIndiceBuffer = false;
    return this._renderer.requestVBORefresh();
  };


  /*
   * Get the ID of our indice buffer host. Null if we have none
   *
   * @return [Number] id
   */

  ARERawActor.prototype.getHostId = function() {
    return this._hostActorId;
  };


  /*
   * Clears any indice buffer host we may have. NOTE: This requires a VBO
   * refresh!
   */

  ARERawActor.prototype.clearHostIndiceBuffer = function() {
    this._indiceBuffer = this._ownIndiceBuffer;
    this._hasOwnIndiceBuffer = true;
    this._hostActorId = null;
    return this._renderer.requestVBORefresh();
  };


  /*
   * Check if we have our own indice buffer
   *
   * @return [Boolean] hasOwn
   */

  ARERawActor.prototype.hasOwnIndiceBuffer = function() {
    return this._hasOwnIndiceBuffer;
  };


  /*
   * Get material name
   *
   * @return [String] material
   */

  ARERawActor.prototype.getMaterial = function() {
    return this._material;
  };


  /*
   * Get actor layer
   *
   * @return [Number] layer
   */

  ARERawActor.prototype.getLayer = function() {
    return this.layer;
  };


  /*
   * Set our render layer. Higher layers render on top of lower ones
   *
   * @param [Number] layer
   */

  ARERawActor.prototype.setLayer = function(layer) {
    this.layer = layer;
    this._renderer.removeActor(this, true);
    return this._renderer.addActor(this, layer);
  };


  /*
   * Check if we have a texture set
   *
   * @return [Boolean] hasTexture
   */

  ARERawActor.prototype.hasTexture = function() {
    return !!this._texture;
  };


  /*
   * We support a single texture per actor for the time being. UV coords are
   * generated automatically internally, for a flat map.
   *
   * @param [String] name name of texture to use from renderer
   * @return [this]
   */

  ARERawActor.prototype.setTexture = function(name) {
    if (!this._renderer.hasTexture(name)) {
      throw new Error("No such texture loaded: " + name);
    }
    this._texture = this._renderer.getTexture(name);
    this.setShader(this._renderer.getTextureShader());
    this._material = ARERenderer.MATERIAL_TEXTURE;
    return this;
  };


  /*
   * Clear our internal texture, leaving us to render with a flat color
   * @return [this]
   */

  ARERawActor.prototype.clearTexture = function() {
    this._texture = void 0;
    this._texRepeatX = 1;
    this._texRepeatY = 1;
    if (this._renderer.getDefaultShader()) {
      this.setShader(this._renderer.getDefaultShader());
    }
    this._material = ARERenderer.MATERIAL_FLAT;
    return this;
  };


  /*
   * Get our texture, if we have one
   *
   * @return [WebGLTexture] texture
   */

  ARERawActor.prototype.getTexture = function() {
    return this._texture;
  };


  /*
   * Get the actor's texture repeat
   *
   * @return [Object]
   *   @option [Number] x
   *   @option [Number] y
   */

  ARERawActor.prototype.getTextureRepeat = function() {
    return {
      x: this._texRepeatX,
      y: this._texRepeatY
    };
  };


  /*
   * Set shader used to draw actor. For the time being, the routine mearly
   * pulls out handles for the ModelView, Color, and Position structures
   *
   * @param [AREShader] shader
   * @return [this]
   */

  ARERawActor.prototype.setShader = function(shader) {
    if (!this._renderer.isWGLRendererActive()) {
      return;
    }
    if (!shader.getProgram()) {
      throw new Error("Shader has to be built before it can be used!");
    }
    if (!shader.getHandles()) {
      shader.generateHandles();
    }
    return this._sh_handles = shader.getHandles();
  };


  /*
   * @return [Boolean]
   */

  ARERawActor.prototype.hasPhysics = function() {
    return this._physics;
  };


  /*
   * Creates the internal physics body, if one does not already exist
   *
   * @param [Number] mass 0.0 - unbound
   * @param [Number] friction 0.0 - unbound
   * @param [Number] elasticity 0.0 - unbound
   * @param [Boolean] refresh optionally delete any existing body/shape
   */

  ARERawActor.prototype.createPhysicsBody = function(_mass, _friction, _elasticity, refresh) {
    var a, bodyDef, command, i, origVerts, shapeDef, vertIndex, verts, x, y, _i, _ref;
    this._mass = _mass;
    this._friction = _friction;
    this._elasticity = _elasticity;
    if (this._physics) {
      return;
    }
    if (isNaN(this._mass)) {
      return;
    }
    refresh = !!refresh;
    this._friction || (this._friction = ARERawActor.defaultFriction);
    this._elasticity || (this._elasticity = ARERawActor.defaultElasticity);
    if (this._mass < 0) {
      this._mass = 0;
    }
    if (this._friction) {
      this._friction = 0;
    }
    if (this._elasticity < 0) {
      this._elasticity = 0;
    }
    verts = [];
    vertIndex = 0;
    origVerts = null;
    if (this._psyxVertices.length > 6) {
      origVerts = this._psyxVertices;
    } else {
      origVerts = this._vertices;
    }
    for (i = _i = 0, _ref = origVerts.length - 1; _i < _ref; i = _i += 2) {
      verts.push(origVerts[i]);
      verts.push(origVerts[i + 1]);
      if (this._mass === 0) {
        x = verts[verts.length - 2];
        y = verts[verts.length - 1];
        a = this._rotation;
        verts[verts.length - 2] = x * Math.cos(a) - (y * Math.sin(a));
        verts[verts.length - 1] = x * Math.sin(a) + (y * Math.cos(a));
      }
    }
    bodyDef = null;
    shapeDef = {
      id: this._id,
      type: "Polygon",
      vertices: verts,
      "static": false,
      position: this._position,
      friction: this._friction,
      elasticity: this._elasticity,
      layer: this._physicsLayer
    };
    if (this._mass === 0) {
      shapeDef["static"] = true;
      shapeDef.position = this._position;
    } else {
      bodyDef = {
        id: this._id,
        position: this._position,
        angle: this._rotation,
        mass: this._mass,
        momentV: {
          x: 0,
          y: 0
        },
        vertices: verts
      };
      shapeDef.position = {
        x: 0,
        y: 0
      };
    }
    this._physics = true;
    window.AREPhysicsManager.sendMessage({}, "physics.enable");
    if (bodyDef) {
      if (refresh) {
        command = "physics.body.refresh";
      } else {
        command = "physics.body.create";
      }
      window.AREPhysicsManager.sendMessage({
        def: bodyDef,
        id: this._id
      }, command);
    }
    if (shapeDef) {
      if (refresh) {
        command = "physics.shape.refresh";
      } else {
        command = "physics.shape.create";
      }
      window.AREPhysicsManager.sendMessage({
        def: shapeDef,
        id: this._id
      }, command);
    }
    return this;
  };


  /*
   * Destroys the physics body if one exists
   */

  ARERawActor.prototype.destroyPhysicsBody = function() {
    if (!this._physics) {
      return;
    }
    window.AREPhysicsManager.sendMessage({
      id: this._id
    }, "physics.shape.remove");
    if (this._mass !== 0) {
      window.AREPhysicsManager.sendMessage({
        id: this._id
      }, "physics.body.remove");
    }
    this._physics = false;
    return this;
  };

  ARERawActor.prototype.enablePhysics = function() {
    if (!this.hasPhysics()) {
      this.createPhysicsBody();
    }
    return this;
  };

  ARERawActor.prototype.disablePhysics = function() {
    if (this.hasPhysics()) {
      this.destroyPhysicsBody;
    }
    return this;
  };

  ARERawActor.prototype.refreshPhysics = function() {
    if (!this.hasPhysics()) {
      return;
    }
    return this.createPhysicsBody(this._mass, this._friction, this._elasticity, true);
  };


  /*
   * @return [Number] mass
   */

  ARERawActor.prototype.getMass = function() {
    return this._mass;
  };


  /*
   * @return [Number] elasticity
   */

  ARERawActor.prototype.getElasticity = function() {
    return this._elasticity;
  };


  /*
   * @return [Number] friction
   */

  ARERawActor.prototype.getFriction = function() {
    return this._friction;
  };


  /*
   * Set Actor mass property
   *
   * @param [Number] mass
   */

  ARERawActor.prototype.setMass = function(_mass) {
    this._mass = _mass;
    this.refreshPhysics();
    return this;
  };


  /*
   * Set Actor elasticity property
   *
   * @param [Number] elasticity
   */

  ARERawActor.prototype.setElasticity = function(_elasticity) {
    this._elasticity = _elasticity;
    this.refreshPhysics();
    return this;
  };


  /*
   * Set Actor friction property
   *
   * @param [Number] friction
   */

  ARERawActor.prototype.setFriction = function(_friction) {
    this._friction = _friction;
    this.refreshPhysics();
    return this;
  };


  /*
   * @return [Number] mass
   */

  ARERawActor.prototype.getMass = function() {
    return this._mass;
  };


  /*
   * @return [Number] elasticity
   */

  ARERawActor.prototype.getElasticity = function() {
    return this._elasticity;
  };


  /*
   * @return [Number] friction
   */

  ARERawActor.prototype.getFriction = function() {
    return this._friction;
  };


  /*
   * Set Actor mass property
   *
   * @param [Number] mass
   */

  ARERawActor.prototype.setMass = function(_mass) {
    this._mass = _mass;
    this.refreshPhysics();
    return this;
  };


  /*
   * Set Actor elasticity property
   *
   * @param [Number] elasticity
   */

  ARERawActor.prototype.setElasticity = function(_elasticity) {
    this._elasticity = _elasticity;
    this.refreshPhysics();
    return this;
  };


  /*
   * Set Actor friction property
   *
   * @param [Number] friction
   */

  ARERawActor.prototype.setFriction = function(_friction) {
    this._friction = _friction;
    this.refreshPhysics();
    return this;
  };


  /*
   * Get actor physics layer
   *
   * @return [Number] physicsLayer
   */

  ARERawActor.prototype.getPhysicsLayer = function() {
    return this._physicsLayer.toString(2).length - 1;
  };


  /*
   * Set physics layer. If we have a physics body, applies immediately. Value
   * persists between physics bodies!
   *
   * There are only 16 physics layers (17 with default layer 0)!
   *
   * @param [Number] layer
   */

  ARERawActor.prototype.setPhysicsLayer = function(layer) {
    this._physicsLayer = 1 << layer;
    return window.AREPhysicsManager.sendMessage({
      id: this._id,
      layer: this._physicsLayer
    }, "physics.shape.set.layer");
  };


  /*
   * Update our vertices, causing a rebuild of the physics body, if it doesn't
   * have its' own set of verts. Note that for large actors this is expensive.
   *
   * Texture coordinates are only required if the actor needs to be textured. If
   * provided, the array must be the same length as that containing the vertices.
   *
   * If either array is missing, no updates to that array are made.
   *
   * @param [Array<Number>] verts flat array of vertices
   * @param [Array<Number>] texverts flat array of texture coords
   */

  ARERawActor.prototype.updateVertices = function(vertices, texverts) {
    var i, mnx, mny, mxx, mxy, newTexVerts, newVertices, _i, _j, _ref, _ref1;
    newVertices = vertices || this._vertices;
    newTexVerts = texverts || this._texVerts;
    if (newVertices.length < 6) {
      throw new Error("At least 3 vertices make up an actor");
    }
    if (newTexVerts !== this._texVerts) {
      if (newVertices !== this._vertices) {
        if (newVertices.length !== newTexVerts.length) {
          throw new Error("Vert and UV count must match!");
        }
      } else {
        if (this._vertices.length !== newTexVerts.length) {
          throw new Error("Vert and UV count must match!");
        }
      }
    }
    this._vertices = newVertices;
    this._texVerts = newTexVerts;
    this._origTexVerts = newTexVerts;
    this._vertexData = [];
    for (i = _i = 0, _ref = this._vertices.length / 2; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      this._vertexData.push(this._vertices[i * 2]);
      this._vertexData.push(this._vertices[i * 2 + 1]);
      this._vertexData.push(this._texVerts[i * 2]);
      this._vertexData.push(this._texVerts[i * 2 + 1]);
    }
    this._vertCount = this._vertexData.length / 4;
    mnx = 0;
    mny = 0;
    mxx = 0;
    mxy = 0;
    for (i = _j = 1, _ref1 = this._vertices.length / 2; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 1 <= _ref1 ? ++_j : --_j) {
      if (mnx > this._vertices[i * 2]) {
        mnx = this._vertices[i * 2];
      }
      if (mxx < this._vertices[i * 2]) {
        mxx = this._vertices[i * 2];
      }
      if (mny > this._vertices[i * 2 + 1]) {
        mny = this._vertices[i * 2 + 1];
      }
      if (mxy < this._vertices[i * 2 + 1]) {
        mxy = this._vertices[i * 2 + 1];
      }
    }
    this._bounds = {
      w: mxx - mnx,
      h: mxy - mny
    };
    if (this._onSizeChange) {
      this._onSizeChange(this._bounds);
    }
    return this._renderer.requestVBORefresh();
  };


  /*
   * Called when the renderer has new vertex indices for us. We must regenerate
   * our indice buffer.
   *
   * @param [Array<Number>] indices
   */

  ARERawActor.prototype.updateIndices = function(indices) {
    var rawIndices;
    rawIndices = new Uint16Array(indices);
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indiceBuffer);
    return this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, rawIndices, this._gl.STATIC_DRAW);
  };


  /*
   * Get raw vertex data, used by the renderer for VBO generation. Array is in
   * the form of <X1, Y1, U1, V1>, <X2, Y2, U2, V2>, ..., <Xn, Yn, Un, Vn> for
   * n vertices.
   *
   * @return [Array<Number>] data
   */

  ARERawActor.prototype.getRawVertexData = function() {
    return this._vertexData;
  };


  /*
   * Set texture repeat per coordinate axis
   *
   * @param [Number] x horizontal repeat
   * @param [Number] y vertical repeat (default 1)
   */

  ARERawActor.prototype.setTextureRepeat = function(x, y) {
    var i, uvs, _i, _ref;
    x || (x = 1);
    y || (y = 1);
    uvs = [];
    for (i = _i = 0, _ref = this._origTexVerts.length; _i < _ref; i = _i += 2) {
      uvs.push((this._origTexVerts[i] / this._texRepeatX) * x);
      uvs.push((this._origTexVerts[i + 1] / this._texRepeatY) * y);
    }
    this._texRepeatX = x;
    this._texRepeatY = y;
    this.updateVertices(this._vertices, uvs);
    return this;
  };


  /*
   * Set an alternate vertex array for our physics object. Note that this also
   * triggers a rebuild! If less than 6 vertices are provided, the normal
   * set of vertices is used
   *
   * @param [Array<Number>] verts flat array of vertices
   */

  ARERawActor.prototype.setPhysicsVertices = function(verts) {
    this._psyxVertices = verts;
    return this.refreshPhysics();
  };


  /*
   * Attach texture to render instead of ourselves. This is very useful when
   * texturing strange physics shapes. We create a square actor of the desired
   * dimensions, set the texture, and render it instead of ourselves when it is
   * visible.
   *
   * If we are not visible, the attached texture does not render! If it is
   * invisible, we render ourselves instead.
   *
   * We perform a check for the existence of the texture, and throw an error if
   * it isn't found.
   *
   * @param [String] texture texture name
   * @param [Number] width attached actor width
   * @param [Number] height attached actor height
   * @param [Number] offx anchor point offset
   * @param [Number] offy anchor point offset
   * @param [Angle] angle anchor point rotation
   * @return [ARERawActor] actor attached actor
   */

  ARERawActor.prototype.attachTexture = function(texture, width, height, offx, offy, angle) {
    this.attachedTextureAnchor.width = width;
    this.attachedTextureAnchor.height = height;
    this.attachedTextureAnchor.x = offx || 0;
    this.attachedTextureAnchor.y = offy || 0;
    this.attachedTextureAnchor.angle = angle || 0;
    if (!this._renderer.hasTexture(texture)) {
      throw new Error("No such texture loaded: " + texture);
    }
    if (this._attachedTexture) {
      this.removeAttachment();
    }
    this._attachedTexture = new ARERectangleActor(width, height);
    this._attachedTexture.setTexture(texture);
    return this._attachedTexture;
  };


  /*
   * Remove attached texture, if we have one
   *
   * @return [Boolean] success fails if we have no attached texture
   */

  ARERawActor.prototype.removeAttachment = function() {
    if (!this._attachedTexture) {
      return false;
    }
    this._attachedTexture.destroy();
    return true;
  };


  /*
   * Set attachment visiblity. Fails if we don't have an attached texture
   *
   * @param [Boolean] visible
   * @return [Boolean] success
   */

  ARERawActor.prototype.setAttachmentVisibility = function(visible) {
    if (!this._attachedTexture) {
      return false;
    }
    this._attachedTexture._visible = visible;
    return true;
  };


  /*
   * Checks to see if we have an attached texture
   *
   * @return [Boolean] hasAttachment
   */

  ARERawActor.prototype.hasAttachment = function() {
    return this._attachedTexture !== null;
  };


  /*
   * Returns attached texture if we have one, null otherwise
   *
   * @return [ARERawActor] attachment
   */

  ARERawActor.prototype.getAttachment = function() {
    return this._attachedTexture;
  };


  /*
   * Updates any attachments on the actor, if there are any, the value
   * returned is the attachment, if not, then the actor is returned instead.
   * @return [ARERawActor]
   */

  ARERawActor.prototype.updateAttachment = function() {
    var a, pos, rot;
    if (this.hasAttachment() && this.getAttachment()._visible) {
      pos = this.getPosition();
      rot = this.getRotation();
      pos.x += this.attachedTextureAnchor.x;
      pos.y += this.attachedTextureAnchor.y;
      rot += this.attachedTextureAnchor.angle;
      a = this.getAttachment();
      a.setPosition(pos);
      a.setRotation(rot);
      return a;
    } else {
      return this;
    }
  };


  /*
   * Binds the actor's WebGL Texture with all needed attributes
   * @param [Object] gl WebGL Context
   */

  ARERawActor.prototype.wglBindTexture = function(gl) {
    this._renderer._currentTexture = this._texture.texture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture.texture);
    gl.uniform1i(this._sh_handles.uSampler, 0);
    return this;
  };


  /*
   * Updates our @_modelM based on our current position and rotation. This used
   * to be in our @wglDraw method, and it used to use methods from EWGL_math.js
   *
   * Since our rotation vector is ALWAYS (0, 0, 1) and our translation Z coord
   * always 1.0, we can reduce the majority of the previous operations, and
   * directly set matrix values ourselves.
   *
   * Since most matrix values never actually change (always either 0, or 1), we
   * set those up in @_initializeModelMatrix() and never touch them again :D
   *
   * This is FUGLY, but as long as we are 2D-only, it's as fast as it gets.
   *
   * THIS. IS. SPARTAAAAA!.
   */

  ARERawActor.prototype._updateModelMatrix = function() {
    var c, camPos, pos, s;
    pos = this._position;
    camPos = this._renderer.getCameraPosition();
    s = Math.sin(this._rotation);
    c = Math.cos(this._rotation);
    this._modelM[0] = c;
    this._modelM[1] = s;
    this._modelM[4] = -s;
    this._modelM[5] = c;
    this._modelM[12] = pos.x - camPos.x;
    return this._modelM[13] = pos.y - camPos.y;
  };


  /*
   * Sets the constant values in our model matrix so that calls to
   * @_updateModelMatrix are sufficient to update our rendered state.
   */

  ARERawActor.prototype._initializeModelMatrix = function() {
    this._modelM = [16];
    this._modelM[2] = 0;
    this._modelM[3] = 0;
    this._modelM[6] = 0;
    this._modelM[7] = 0;
    this._modelM[8] = 0;
    this._modelM[9] = 0;
    this._modelM[10] = 1;
    this._modelM[11] = 0;
    this._modelM[14] = 1;
    return this._modelM[15] = 1;
  };


  /*
   * Renders the Actor using the WebGL interface, this function should only
   * be called by a ARERenderer in WGL mode
   *
   * @param [Object] gl WebGL context
   * @param [Shader] shader optional shader to override our own
   */

  ARERawActor.prototype.wglDraw = function(gl, shader) {
    var _sh_handles_backup;
    if (!this._visible) {
      return;
    }
    this._updateModelMatrix();
    if (shader) {
      _sh_handles_backup = this._sh_handles;
      this._sh_handles = shader.getHandles();
    }
    gl.uniformMatrix4fv(this._sh_handles.uModelView, false, this._modelM);
    gl.uniform4f(this._sh_handles.uColor, this._colArray[0], this._colArray[1], this._colArray[2], 1.0);
    if (this._sh_handles.uClipRect) {
      gl.uniform4fv(this._sh_handles.uClipRect, this._clipRect);
    }
    gl.uniform1f(this._sh_handles.uOpacity, this._opacity);
    gl.enableVertexAttribArray(this._sh_handles.aPosition);
    gl.vertexAttribPointer(this._sh_handles.aPosition, 2, gl.FLOAT, false, this._vertStride, 0);
    if (this._sh_handles.aTexCoord !== void 0) {
      gl.enableVertexAttribArray(this._sh_handles.aTexCoord);
      gl.vertexAttribPointer(this._sh_handles.aTexCoord, 2, gl.FLOAT, false, this._vertStride, this._uvOffset);
    }
    if (this._renderer._currentMaterial === ARERenderer.MATERIAL_TEXTURE) {
      if (this._renderer._currentTexture !== this._texture.texture) {
        this.wglBindTexture(gl);
      }
    }
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indiceBuffer);

    /*
     * @TODO, actually apply the RENDER_STYLE_*
     */
    switch (this._renderMode) {
      case ARERenderer.GL_MODE_LINE_LOOP:
        gl.drawElements(gl.LINE_LOOP, this._vertCount, gl.UNSIGNED_SHORT, 0);
        break;
      case ARERenderer.GL_MODE_TRIANGLE_FAN:
        gl.drawElements(gl.TRIANGLE_FAN, this._vertCount, gl.UNSIGNED_SHORT, 0);
        break;
      case ARERenderer.GL_MODE_TRIANGLE_STRIP:
        gl.drawElements(gl.TRIANGLE_STRIP, this._vertCount, gl.UNSIGNED_SHORT, 0);
        break;
      default:
        throw new Error("Invalid render mode! " + this._renderMode);
    }
    if (shader) {
      this._sh_handles = _sh_handles_backup;
    }
    return this;
  };


  /*
   * Updates the context settings with the Actor's strokeStyle and fillStyle
   * @param [Object] 2d context
   */

  ARERawActor.prototype.cvSetupStyle = function(context) {
    var a, b, g, r;
    if (this._strokeWidth !== null) {
      context.lineWidth = this._strokeWidth;
    } else {
      context.lineWidth = 1;
    }
    if (this._strokeColor) {
      r = Number(this._strokeColor._r).toFixed(0);
      g = Number(this._strokeColor._g).toFixed(0);
      b = Number(this._strokeColor._b).toFixed(0);
      a = Number(this._opacity).toFixed(4);
      context.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    } else {
      context.strokeStyle = "#FFF";
    }
    if (this._renderer._currentMaterial === ARERenderer.MATERIAL_TEXTURE) {

    } else {
      if (this._color) {
        r = Number(this._color._r).toFixed(0);
        g = Number(this._color._g).toFixed(0);
        b = Number(this._color._b).toFixed(0);
        a = Number(this._opacity).toFixed(4);
        context.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      } else {
        context.fillStyle = "#FFF";
      }
    }
    return this;
  };


  /*
   * Renders the current actor using the 2d context, this function should only
   * be called by a ARERenderer in CANVAS mode
   *
   * @param [Object] 2d context
   * @return [self]
   */

  ARERawActor.prototype.cvDraw = function(context) {
    var i, _i, _ref;
    if (!this._visible) {
      return;
    }
    this._updateModelMatrix();
    context.translate(this._modelM[12], context.canvas.clientHeight - this._modelM[13]);
    context.beginPath();
    context.rotate(this._rotation);
    context.moveTo(this._vertices[0], this._vertices[1]);
    for (i = _i = 1, _ref = this._vertices.length / 2; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      context.lineTo(this._vertices[i * 2], this._vertices[i * 2 + 1]);
    }
    context.closePath();
    this.cvSetupStyle(context);
    context.scale(1, -1);
    switch (this._renderMode) {
      case ARERenderer.GL_MODE_LINE_LOOP:
        context.stroke();
        break;
      case ARERenderer.GL_MODE_TRIANGLE_STRIP:
      case ARERenderer.GL_MODE_TRIANGLE_FAN:
        if ((this._renderStyle & ARERenderer.RENDER_STYLE_STROKE) > 0) {
          context.stroke();
        }
        if ((this._renderStyle & ARERenderer.RENDER_STYLE_FILL) > 0) {
          if (this._renderer._currentMaterial === ARERenderer.MATERIAL_TEXTURE) {
            context.clip();
            context.drawImage(this._texture.texture, -this._bounds.w / 2, -this._bounds.h / 2, this._bounds.w, this._bounds.h);
          } else {
            context.fill();
          }
        }
        break;
      default:
        throw new Error("Invalid render mode! " + this._renderMode);
    }
    return this;
  };


  /*
   * Renders the current actor using the 2d context, however, nothing is
   * drawn, only the internal position is updated
   * this function should only be called by a ARERenderer in NULL mode
   * @param [Object] 2d context
   */

  ARERawActor.prototype.nullDraw = function(context) {
    if (!this._visible) {
      return;
    }
    return this;
  };


  /*
   * Set actor render mode, decides how the vertices are perceived
   * @see ARERenderer.GL_MODE_*
   *
   * @paran [Number] mode
   * @return [self]
   */

  ARERawActor.prototype.setRenderMode = function(_renderMode) {
    this._renderMode = _renderMode;
    return this;
  };


  /*
   * Set actor render style, decides how the object is filled/stroked
   * @see ARERenderer.RENDER_STYLE_*
   *
   * @paran [Number] mode
   * @return [self]
   */

  ARERawActor.prototype.setRenderStyle = function(_renderStyle) {
    this._renderStyle = _renderStyle;
    return this;
  };


  /*
   * Set actor opacity
   *
   * @param [Number] opacity
   * @return [self]
   */

  ARERawActor.prototype.setOpacity = function(_opacity) {
    this._opacity = _opacity;
    return this;
  };


  /*
   * Register an orientation change listener
   *
   * @param [Method] cb
   */

  ARERawActor.prototype.setOnOrientationChange = function(cb) {
    return this._onOrientationChange = cb;
  };


  /*
   * Register a size change listener
   *
   * @param [Method] cb
   */

  ARERawActor.prototype.setOnSizeChange = function(cb) {
    return this._onSizeChange = cb;
  };


  /*
   * Set actor position, affects either the actor or the body directly if one
   * exists
   *
   * @param [Object] position x, y
   * @return [self]
   */

  ARERawActor.prototype.setPosition = function(_position) {
    this._position = _position;
    if (this.hasPhysics()) {
      window.AREPhysicsManager.sendMessage({
        id: this._id,
        position: this._position
      }, "physics.body.set.position");
    }
    if (this._onOrientationChange) {
      this._onOrientationChange({
        position: this._position
      });
    }
    return this;
  };


  /*
   * Set actor rotation, affects either the actor or the body directly if one
   * exists
   *
   * @param [Number] rotation angle
   * @param [Boolean] radians true if angle is in radians
   * @return [self]
   */

  ARERawActor.prototype.setRotation = function(rotation, radians) {
    radians = !!radians;
    if (!radians) {
      rotation = Number(rotation) * 0.0174532925;
    }
    if (this._rotation === rotation) {
      return;
    }
    this._rotation = rotation;
    if (this.hasPhysics()) {
      if (this._mass > 0) {
        window.AREPhysicsManager.sendMessage({
          id: this._id,
          rotation: this._rotation
        }, "physics.body.set.rotation");
      } else {
        this.refreshPhysics();
      }
    }
    if (this._onOrientationChange) {
      this._onOrientationChange({
        rotation: this._rotation
      });
    }
    return this;
  };


  /*
   * Sets the character outline/stroke width
   *
   * @param [Number] width
   * @return [self]
   */

  ARERawActor.prototype.setStrokeWidth = function(width) {
    this._strokeWidth = Number(width);
    return this;
  };


  /*
   * Set color
   * @private
   * @param [Integer] target color to extract information to
   * @overload setColor_ext(target,col)
   *   Sets the color using an AREColor3 instance
   *   @param [AREColor3] color
   *
   * @overload setColor_ext(target, r, g, b)
   *   Sets the color using component values
   *   @param [Integer] r red component
   *   @param [Integer] g green component
   *   @param [Integer] b blue component
   * @return [self]
   */

  ARERawActor.prototype.setColor_ext = function(target, colOrR, g, b) {
    if (colOrR instanceof AREColor3) {
      target.setR(colOrR.getR());
      target.setG(colOrR.getG());
      target.setB(colOrR.getB());
    } else {
      if (!(isNaN(colOrR.g) || isNaN(colOrR.b))) {
        g = colOrR.g;
        b = colOrR.b;
        colOrR = colOrR.r;
      }
      target.setR(Number(colOrR));
      target.setG(Number(g));
      target.setB(Number(b));
    }
    return this;
  };


  /*
   * Set color
   *
   * @overload setColor(col)
   *   Sets the color using an AREColor3 instance
   *   @param [AREColor3] color
   *
   * @overload setColor(r, g, b)
   *   Sets the color using component values
   *   @param [Integer] r red component
   *   @param [Integer] g green component
   *   @param [Integer] b blue component
   * @return [self]
   */

  ARERawActor.prototype.setColor = function(colOrR, g, b) {
    this._color || (this._color = new AREColor3);
    this.setColor_ext(this._color, colOrR, g, b);
    this._colArray = [this._color.getR(true), this._color.getG(true), this._color.getB(true)];
    return this;
  };


  /*
   * Set stroke color
   *
   * @overload setStrokeColor(col)
   *   Sets the color using an AREColor3 instance
   *   @param [AREColor3] color
   *
   * @overload setStrokeColor(r, g, b)
   *   Sets the color using component values
   *   @param [Integer] r red component
   *   @param [Integer] g green component
   *   @param [Integer] b blue component
   * @return [self]
   */

  ARERawActor.prototype.setStrokeColor = function(colOrR, g, b) {
    this._strokeColor || (this._strokeColor = new AREColor3);
    this.setColor_ext(this._strokeColor, colOrR, g, b);
    this._strokeColorArray = [this._strokeColor.getR(true), this._strokeColor.getG(true), this._strokeColor.getB(true)];
    return this;
  };


  /*
   * Set the visible state of the actor
   * @param [Boolean] visible
   * @return [self]
   */

  ARERawActor.prototype.setVisible = function(_visible) {
    this._visible = _visible;
    return this;
  };


  /*
   * Get actor opacity
   *
   * @return [Number] opacity
   */

  ARERawActor.prototype.getOpacity = function() {
    return this._opacity;
  };


  /*
   * Returns the actor position as an object with x and y properties
   *
   * @return [Object] position x, y
   */

  ARERawActor.prototype.getPosition = function() {
    return this._position;
  };

  ARERawActor.prototype.getBounds = function() {
    return this._bounds;
  };


  /*
   * Returns actor rotation as an angle in degrees
   *
   * @param [Boolean] radians true to return in radians
   * @return [Number] angle rotation in degrees on z axis
   */

  ARERawActor.prototype.getRotation = function(radians) {
    if (!!radians) {
      return this._rotation;
    } else {
      return this._rotation * 57.2957795;
    }
  };


  /*
   * Get array of vertices
   *
   * @return [Array<Number>] vertices
   */

  ARERawActor.prototype.getVertices = function() {
    return this._vertices;
  };


  /*
   * Get body id
   *
   * @return [Number] id
   */

  ARERawActor.prototype.getId = function() {
    return this._id;
  };


  /*
   * Get color
   *
   * @return [AREColor3] color
   */

  ARERawActor.prototype.getColor = function() {
    return new AREColor3(this._color);
  };


  /*
   * @return [Boolean] visible
   */

  ARERawActor.prototype.getVisible = function() {
    return this._visible;
  };

  ARERawActor.updateCount = 0;

  ARERawActor.lastTime = Date.now();

  ARERawActor.prototype.receiveMessage = function(message, namespace) {
    var command;
    if (namespace.indexOf("actor.") === -1) {
      return;
    }
    if (!(message.id && message.id === this._id)) {
      return;
    }
    command = namespace.split(".");
    switch (command[1]) {
      case "update":
        this._position = message.position;
        this._rotation = message.rotation;
        if (this._onOrientationChange) {
          return this._onOrientationChange({
            position: this._position,
            rotation: this._rotation
          });
        }
    }
  };

  return ARERawActor;

})();

ARERectangleActor = (function(_super) {
  __extends(ARERectangleActor, _super);


  /*
   * Sets us up with the supplied width and height, generating both our vertex
   * and UV sets.
   *
   * @param [ARERenderer] renderer
   * @param [Number] width
   * @param [Number] height
   */

  function ARERectangleActor(renderer, width, height) {
    var uvs, verts;
    this.width = width;
    this.height = height;
    if (width <= 0) {
      throw new Error("Invalid width: " + width);
    }
    if (height <= 0) {
      throw new Error("Invalid height: " + height);
    }
    verts = this.generateVertices();
    uvs = this.generateUVs();
    ARERectangleActor.__super__.constructor.call(this, renderer, verts, uvs);
  }


  /*
   * Generate array of vertices using our dimensions
   *
   * @return [Array<Number>] vertices
   */

  ARERectangleActor.prototype.generateVertices = function() {
    var hH, hW;
    hW = this.width / 2;
    hH = this.height / 2;
    return [-hW, -hH, -hW, hH, hW, hH, hW, -hH, -hW, -hH];
  };


  /*
   * Generate array of UV coordinates
   *
   * @return [Array<Number>] uvs
   */

  ARERectangleActor.prototype.generateUVs = function() {
    return [0, 1, 0, 0, 1, 0, 1, 1, 0, 1];
  };


  /*
   * Get stored width
   *
   * @return [Number] width
   */

  ARERectangleActor.prototype.getWidth = function() {
    return this.width;
  };


  /*
   * Get stored height
   *
   * @return [Number] height
   */

  ARERectangleActor.prototype.getHeight = function() {
    return this.height;
  };


  /*
   * Set width, causes a vert refresh
   *
   * @param [Number] width
   */

  ARERectangleActor.prototype.setWidth = function(width) {
    this.width = width;
    return this.updateVertices(this.generateVertices());
  };


  /*
   * Set height, causes a vert refresh
   *
   * @param [Number] height
   */

  ARERectangleActor.prototype.setHeight = function(height) {
    this.height = height;
    return this.updateVertices(this.generateVertices());
  };

  return ARERectangleActor;

})(ARERawActor);

AREPolygonActor = (function(_super) {
  __extends(AREPolygonActor, _super);

  AREPolygonActor._INDICE_BUFFER_CACHE = {};

  AREPolygonActor._VERTEX_CACHE = {};

  AREPolygonActor._UV_CACHE = {};


  /*
   * Sets us up with the supplied radius and segment count, generating our
   * vertex sets.
   *
   * NOTE: Texture support is not available! No UVs! ;(
   *
   * @param [ARERenderer] renderer
   * @param [Number] radius
   * @param [Number] segments
   */

  function AREPolygonActor(renderer, radius, segments) {
    var psyxVerts, uvs, verts;
    this.radius = radius;
    this.segments = segments;
    if (this.radius instanceof Array) {
      this._verts = this.radius;
      this.radius = null;
      uvs = this.generateUVs(this._verts);
      AREPolygonActor.__super__.constructor.call(this, renderer, this._verts, uvs);
      this.setPhysicsVertices(this._verts);
    } else {
      if (radius <= 0) {
        throw new Error("Invalid radius: " + radius);
      }
      if (segments <= 2) {
        throw new Error("Invalid segment count: " + segments);
      }
      verts = this.generateVertices();
      psyxVerts = this.generateVertices({
        mode: "physics"
      });
      uvs = this.generateUVs(verts);
      AREPolygonActor.__super__.constructor.call(this, renderer, verts, uvs);
      this.setPhysicsVertices(psyxVerts);
    }
    this.setRenderMode(ARERenderer.GL_MODE_TRIANGLE_FAN);
    this.validateCacheEntry();
  }


  /*
   * @private
   * Private method that rebuilds our vertex array.
   *
   * @param [Object] options optional generation options
   * @options options [Boolean] mode generation mode (normal, or for physics)
   */

  AREPolygonActor.prototype.generateVertices = function(options) {
    var cacheLookup, cachedVertexSet, i, radFactor, tanFactor, theta, tx, ty, verts, x, y, _i, _j, _ref, _ref1, _tv;
    options || (options = {});
    cacheLookup = "" + this.radius + "." + this.segments + "." + options.mode;
    cachedVertexSet = AREPolygonActor._VERTEX_CACHE[cacheLookup];
    if (cachedVertexSet) {
      return cachedVertexSet;
    }
    x = this.radius;
    y = 0;
    theta = (2.0 * 3.1415926) / this.segments;
    tanFactor = Math.tan(theta);
    radFactor = Math.cos(theta);
    verts = [];
    for (i = _i = 0, _ref = this.segments; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      verts[i * 2] = x;
      verts[(i * 2) + 1] = y;
      tx = -y;
      ty = x;
      x += tx * tanFactor;
      y += ty * tanFactor;
      x *= radFactor;
      y *= radFactor;
    }
    verts.push(verts[0]);
    verts.push(verts[1]);
    _tv = [];
    for (i = _j = 0, _ref1 = verts.length; _j < _ref1; i = _j += 2) {
      _tv.push(verts[verts.length - 2 - i]);
      _tv.push(verts[verts.length - 1 - i]);
    }
    verts = _tv;
    if (options.mode !== "physics") {
      verts.push(0);
      verts.push(0);
    }
    AREPolygonActor._VERTEX_CACHE[cacheLookup] = verts;
    return verts;
  };


  /*
   * Generate UV array from a vertex set, using our current radius
   *
   * @return [Array<Number>] uvs
   */

  AREPolygonActor.prototype.generateUVs = function(vertices) {
    var cacheLookup, cachedUVSet;
    cacheLookup = "" + this.radius + "." + this.segments;
    cachedUVSet = AREPolygonActor._UV_CACHE[cacheLookup];
    if (cachedUVSet) {
      return cachedUVSet;
    }
    return AREPolygonActor._UV_CACHE[cacheLookup] = _.map(vertices, (function(_this) {
      return function(v) {
        return ((v / _this.radius) / 2) + 0.5;
      };
    })(this));
  };


  /*
   * Preforms a full vert refresh (vertices, physics vertics, and UVs)
   * @private
   */

  AREPolygonActor.prototype.fullVertRefresh = function() {
    var psyxVerts, uvs, verts;
    verts = this.generateVertices();
    psyxVerts = this.generateVertices({
      mode: "physics"
    });
    uvs = this.generateUVs(verts);
    this.updateVertices(verts, uvs);
    return this.setPhysicsVertices(psyxVerts);
  };


  /*
   * Ensure we are in the cache under our radius/segments pair, if no other poly
   * is.
   */

  AREPolygonActor.prototype.validateCacheEntry = function() {
    var cacheLookup, cachedActor;
    cacheLookup = "" + this.radius + "." + this.segments;
    if (AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup]) {
      cachedActor = AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup];
      return this.setHostIndiceBuffer(cachedActor.getIndiceBuffer(), cachedActor.getId());
    } else {
      AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] = this;
      return this.clearHostIndiceBuffer();
    }
  };


  /*
   * Removes the Actor, cleaning the cache
   *
   * @return [null]
   */

  AREPolygonActor.prototype.destroy = function() {
    var cacheLookup;
    cacheLookup = "" + this.radius + "." + this.segments;
    if (AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] === this) {
      AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] = null;
    }
    return AREPolygonActor.__super__.destroy.call(this);
  };


  /*
   * Get stored radius
   *
   * @return [Number] radius
   */

  AREPolygonActor.prototype.getRadius = function() {
    return this.radius;
  };


  /*
   * Get stored segment count
   *
   * @return [Number] segments
   */

  AREPolygonActor.prototype.getSegments = function() {
    return this.segments;
  };


  /*
   * Set radius, causes a full vert refresh
   *
   * @param [Number] radius
   */

  AREPolygonActor.prototype.setRadius = function(radius) {
    this.radius = radius;
    if (radius <= 0) {
      throw new Error("Invalid radius: " + radius);
    }
    this.fullVertRefresh();
    return this.validateCacheEntry();
  };


  /*
   * Set segment count, causes a full vert refresh
   *
   * @param [Number] segments
   */

  AREPolygonActor.prototype.setSegments = function(segments) {
    this.segments = segments;
    if (segments <= 2) {
      throw new Error("Invalid segment count: " + segments);
    }
    this.fullVertRefresh();
    return this.validateCacheEntry();
  };

  return AREPolygonActor;

})(ARERawActor);

ARECircleActor = (function(_super) {
  __extends(ARECircleActor, _super);


  /*
   * Sets us up with the supplied radius and segment count, generating our
   * vertex sets.
   *
   * NOTE: Texture support is not available! No UVs! ;(
   *
   * @param [ARERenderer] renderer
   * @param [Number] radius
   */

  function ARECircleActor(renderer, radius) {
    this.radius = radius;
    ARECircleActor.__super__.constructor.call(this, renderer, radius, 32);
    delete this.setSegments;
    delete this.getSegments;
  }

  return ARECircleActor;

})(AREPolygonActor);

ARETriangleActor = (function(_super) {
  __extends(ARETriangleActor, _super);


  /*
   * Sets us up with the supplied base and height, generating both our vertex
   * and UV sets.
   *
   * @param [ARERenderer] renderer
   * @param [Number] base
   * @param [Number] height
   */

  function ARETriangleActor(renderer, base, height) {
    var uvs, verts;
    this.base = base;
    this.height = height;
    if (base <= 0) {
      throw new Error("Invalid base: " + base);
    }
    if (height <= 0) {
      throw new Error("Invalid height: " + height);
    }
    verts = this.generateVertices();
    uvs = this.generateUVs();
    ARETriangleActor.__super__.constructor.call(this, renderer, verts, uvs);
  }


  /*
   * Generate array of vertices using our dimensions
   *
   * @return [Array<Number>] vertices
   */

  ARETriangleActor.prototype.generateVertices = function() {
    var hB, hH;
    hB = this.base / 2;
    hH = this.height / 2;
    return [-hB, -hH, 0, hH, hB, -hH, -hB, -hH];
  };


  /*
   * Generate array of UV coordinates
   *
   * @return [Array<Number>] uvs
   */

  ARETriangleActor.prototype.generateUVs = function() {
    return [0, 1, 0, 0, 1, 0, 1, 1];
  };


  /*
   * Get stored base
   *
   * @return [Number] base
   */

  ARETriangleActor.prototype.getBase = function() {
    return this.base;
  };


  /*
   * Get stored height
   *
   * @return [Number] height
   */

  ARETriangleActor.prototype.getHeight = function() {
    return this.height;
  };


  /*
   * Set base, causes a vert refresh
   *
   * @param [Number] base
   */

  ARETriangleActor.prototype.setBase = function(base) {
    this.base = base;
    return this.updateVertices(this.generateVertices());
  };


  /*
   * Set height, causes a vert refresh
   *
   * @param [Number] height
   */

  ARETriangleActor.prototype.setHeight = function(height) {
    this.height = height;
    return this.updateVertices(this.generateVertices());
  };

  return ARETriangleActor;

})(ARERawActor);

AREColor3 = (function() {

  /*
   * Sets component values
   *
   * @param [Number] r red component
   * @param [Number] g green component
   * @param [Number] b blue component
   */
  function AREColor3(colOrR, g, b) {
    colOrR || (colOrR = 0);
    g || (g = 0);
    b || (b = 0);
    if (colOrR instanceof AREColor3) {
      this._r = colOrR.getR();
      this._g = colOrR.getG();
      this._b = colOrR.getB();
    } else {
      this.setR(colOrR);
      this.setG(g);
      this.setB(b);
    }
  }


  /*
   * Returns the red component as either an int or float
   *
   * @param [Boolean] float true if a float is requested
   * @return [Number] red
   */

  AREColor3.prototype.getR = function(asFloat) {
    if (asFloat !== true) {
      return this._r;
    }
    return this._r / 255;
  };


  /*
   * Returns the green component as either an int or float
   *
   * @param [Boolean] float true if a float is requested
   * @return [Number] green
   */

  AREColor3.prototype.getG = function(asFloat) {
    if (asFloat !== true) {
      return this._g;
    }
    return this._g / 255;
  };


  /*
   * Returns the blue component as either an int or float
   *
   * @param [Boolean] float true if a float is requested
   * @return [Number] blue
   */

  AREColor3.prototype.getB = function(asFloat) {
    if (asFloat !== true) {
      return this._b;
    }
    return this._b / 255;
  };


  /*
   * Set red component, takes a value between 0-255
   *
   * @param [Number] c
   */

  AREColor3.prototype.setR = function(c) {
    c = Number(c);
    if (c < 0) {
      c = 0;
    }
    if (c > 255) {
      c = 255;
    }
    return this._r = c;
  };


  /*
   * Set green component, takes a value between 0-255
   *
   * @param [Number] c
   */

  AREColor3.prototype.setG = function(c) {
    c = Number(c);
    if (c < 0) {
      c = 0;
    }
    if (c > 255) {
      c = 255;
    }
    return this._g = c;
  };


  /*
   * Set blue component, takes a value between 0-255
   *
   * @param [Number] c
   */

  AREColor3.prototype.setB = function(c) {
    c = Number(c);
    if (c < 0) {
      c = 0;
    }
    if (c > 255) {
      c = 255;
    }
    return this._b = c;
  };


  /*
   * Returns the value as a triple
   *
   * @return [String] triple in the form (r, g, b)
   */

  AREColor3.prototype.toString = function() {
    return "(" + this._r + ", " + this._g + ", " + this._b + ")";
  };

  return AREColor3;

})();

AREShader = (function() {

  /*
   * Doesn't do much except auto-build the shader if requested
   *
   * @param [String] vertSrc vertex shader source
   * @param [String] fragSrc fragment shader source
   * @param [Object] gl gl object if building
   * @param [Boolean] build if true, builds the shader now
   */
  function AREShader(_vertSrc, _fragSrc, _gl, build) {
    var _success;
    this._vertSrc = _vertSrc;
    this._fragSrc = _fragSrc;
    this._gl = _gl;
    build = !!build;
    this.errors = [];
    this._prog = null;
    this._vertShader = null;
    this._fragShader = null;
    this._handles = null;
    if (build === true) {
      _success = this.build(this._gl);
      if (_success === false) {
        throw new Error("Failed to build shader! " + (JSON.stringify(this.errors)));
      }
    }
  }


  /*
   * Builds the shader using the vert/frag sources supplied
   *
   * @param [Object] gl gl object to build shaders with/into
   * @return [Boolean] success false implies an error stored in @errors
   */

  AREShader.prototype.build = function(_gl) {
    var gl;
    this._gl = _gl;
    gl = this._gl;
    this.errors = [];
    if (gl === void 0 || gl === null) {
      throw new Error("Need a valid gl object to build a shader!");
    }
    this._vertShader = gl.createShader(gl.VERTEX_SHADER);
    this._fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this._vertShader, this._vertSrc);
    gl.shaderSource(this._fragShader, this._fragSrc);
    gl.compileShader(this._vertShader);
    gl.compileShader(this._fragShader);
    if (!gl.getShaderParameter(this._vertShader, gl.COMPILE_STATUS)) {
      this.errors.push(gl.getShaderInfoLog(this._vertShader));
    }
    if (!gl.getShaderParameter(this._fragShader, gl.COMPILE_STATUS)) {
      this.errors.push(gl.getShaderInfoLog(this._fragShader));
    }
    this._prog = gl.createProgram();
    gl.attachShader(this._prog, this._vertShader);
    gl.attachShader(this._prog, this._fragShader);
    gl.linkProgram(this._prog);
    if (!gl.getProgramParameter(this._prog, gl.LINK_STATUS)) {
      this.errors.push("Failed to link!");
    }
    if (this.errors.length > 0) {
      return false;
    }
    return true;
  };


  /*
   * Really neat helper function, breaks out and supplies handles to all
   * variables. Really the meat of this class
   *
   * @return [Boolean] success fails if handles have already been generated
   */

  AREShader.prototype.generateHandles = function() {
    var h, l, src, _i, _j, _len, _len1, _makeHandle, _ref;
    if (this._prog === null) {
      AREEngine.getLog().error("Build program before generating handles");
      return false;
    }
    if (this._handles !== null) {
      AREEngine.getLog().warn("Refusing to re-generate handles!");
      return false;
    }
    this._handles = {};
    _makeHandle = function(l, type, me) {
      var name, ret;
      l = l.split(" ");
      name = l[l.length - 1].replace(";", "");
      if (type === 1) {
        ret = {
          n: name,
          h: me._gl.getUniformLocation(me._prog, name)
        };
        if (typeof ret.h !== "object") {
          throw new Error("Failed to get handle for uniform " + name + " [" + ret.h + "]");
        }
        return ret;
      } else if (type === 2) {
        ret = {
          n: name,
          h: me._gl.getAttribLocation(me._prog, name)
        };
        return ret;
      }
      throw new Error("Type not 1 or 2, WTF, internal error");
    };
    _ref = [this._vertSrc, this._fragSrc];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      src = _ref[_i];
      src = src.split(";");
      for (_j = 0, _len1 = src.length; _j < _len1; _j++) {
        l = src[_j];
        if (l.indexOf("main()") !== -1) {
          break;
        } else if (l.indexOf("attribute") !== -1) {
          h = _makeHandle(l, 2, this);
          this._handles[h.n] = h.h;
        } else if (l.indexOf("uniform") !== -1) {
          h = _makeHandle(l, 1, this);
          this._handles[h.n] = h.h;
        }
      }
    }
    return true;
  };


  /*
   * Get generated handles
   *
   * @return [Object] handles
   */

  AREShader.prototype.getHandles = function() {
    return this._handles;
  };


  /*
   * Get generated program (null by default)
   *
   * @return [Object] program
   */

  AREShader.prototype.getProgram = function() {
    return this._prog;
  };

  return AREShader;

})();

AREVector2 = (function() {
  function AREVector2(x, y) {
    this.x || (this.x = 0);
    this.y || (this.y = 0);
  }


  /*
   * @param [Boolean] bipolar should randomization occur in all directions?
   * @return [AREVector2] randomizedVector
   */

  AREVector2.prototype.random = function(options) {
    var bipolar, seed, x, y;
    options || (options = {});
    bipolar = !!options.bipolar;
    seed = options.seed || Math.random() * 0xFFFF;
    x = Math.random() * this.x;
    y = Math.random() * this.y;
    if (bipolar) {
      if (Math.random() < 0.5) {
        x = -x;
      }
      if (Math.random() < 0.5) {
        y = -y;
      }
    }
    return new AREVector2(x, y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.add = function(other) {
    return new AREVector2(this.x + other.x, this.y + other.y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.sub = function(other) {
    return new AREVector2(this.x - other.x, this.y - other.y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.mul = function(other) {
    return new AREVector2(this.x * other.x, this.y * other.y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.div = function(other) {
    return new AREVector2(this.x / other.x, this.y / other.y);
  };


  /*
   * @return [AREVector2]
   */

  AREVector2.prototype.floor = function() {
    return new AREVector2(Math.floor(this.x), Math.floor(this.y));
  };


  /*
   * @return [AREVector2]
   */

  AREVector2.prototype.ceil = function() {
    return new AREVector2(Math.ceil(this.x), Math.ceil(this.y));
  };


  /*
   * @return [AREVector2]
   */

  AREVector2.zero = function() {
    return new AREVector2(0, 0);
  };

  return AREVector2;

})();

AREShader.shaders = {};

AREShader.shaders.wire = {};

AREShader.shaders.solid = {};

AREShader.shaders.texture = {};

precision = "mediump";

varying_precision = "mediump";

precision_declaration = "precision " + precision + " float;";

AREShader.shaders.wire.vertex = "" + precision_declaration + "\n\nattribute vec2 aPosition;\n\nuniform mat4 uProjection;\nuniform mat4 uModelView;\n\nvoid main() {\n  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);\n}";

AREShader.shaders.wire.fragment = "" + precision_declaration + "\n\nuniform vec4 uColor;\nuniform float uOpacity;\n\nvoid main() {\n  vec4 frag = uColor;\n  frag.a *= uOpacity;\n  gl_FragColor = frag;\n}";

AREShader.shaders.solid.vertex = AREShader.shaders.wire.vertex;

AREShader.shaders.solid.fragment = "" + precision_declaration + "\n\nuniform vec4 uColor;\nuniform float uOpacity;\n\nvoid main() {\n  vec4 frag = uColor;\n  frag.a *= uOpacity;\n  gl_FragColor = frag;\n}";

AREShader.shaders.texture.vertex = "" + precision_declaration + "\n\nattribute vec2 aPosition;\nattribute vec2 aTexCoord;\n\nuniform mat4 uProjection;\nuniform mat4 uModelView;\n\nvarying " + varying_precision + " vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);\n  vTexCoord = aTexCoord;\n}";

AREShader.shaders.texture.fragment = "" + precision_declaration + "\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform float uOpacity;\nuniform vec4 uClipRect;\n\nvarying " + varying_precision + " vec2 vTexCoord;\n\nvoid main() {\n  vec4 baseColor = texture2D(uSampler,\n                             uClipRect.xy +\n                             vTexCoord * uClipRect.zw);\n  // baseColor *= uColor;\n  baseColor.a *= uOpacity;\n\n  gl_FragColor = baseColor;\n}";

ARERenderer = (function() {

  /*
   * Renderer Modes
   * 0: null
   *    The null renderer is the same as the canvas renderer, however
   *    it will only clear the screen each tick.
   * 1: canvas
   *    All rendering will be done using the 2d Context
   * 2: wgl
   *    All rendering will be done using WebGL
   * @enum
   */
  ARERenderer.RENDER_MODE_NULL = 0;

  ARERenderer.RENDER_MODE_CANVAS = 1;

  ARERenderer.RENDER_MODE_WGL = 2;


  /*
   * Render Modes
   * This affects the method GL will use to render a WGL element
   * @enum
   */

  ARERenderer.GL_MODE_LINE_LOOP = 0;

  ARERenderer.GL_MODE_TRIANGLE_FAN = 1;

  ARERenderer.GL_MODE_TRIANGLE_STRIP = 2;


  /*
   * A render style determines how a canvas element is drawn, this can
   * also be used for WebGL elements as well, as they fine tune the drawing
   * process.
  
   * STROKE will work with all RENDER_MODE*.
   * FILL will work with GL_MODE_TRIANGLE_FAN and
   * GL_MODE_TRIANGLE_STRIP only.
   * FILL_AND_STROKE will work with all current render modes, however
   * GL_MODE_LINE_LOOP will only use STROKE
   * @enum
   */

  ARERenderer.RENDER_STYLE_STROKE = 1;

  ARERenderer.RENDER_STYLE_FILL = 2;

  ARERenderer.RENDER_STYLE_FILL_AND_STROKE = 3;


  /*
   * Render Modes
   * This affects the method GL will use to render a WGL element
   * @enum
   */

  ARERenderer.MATERIAL_NONE = "none";

  ARERenderer.MATERIAL_FLAT = "flat";

  ARERenderer.MATERIAL_TEXTURE = "texture";


  /*
   * Sets up the renderer, using either an existing canvas or creating a new one
   * If a canvasId is provided but the element is not a canvas, it is treated
   * as a parent. If it is a canvas, it is adopted as our canvas.
   *
   * Bails early if the GL context could not be created
   *
   * @param [Object] options renderer initialization options
   * @option options [String] canvasId canvas id or parent selector
   * @option options [Number] width canvas width
   * @option options [Number] height canvas height
   * @option options [Number] renderMode optional render mode, defaults to WebGL
   * @option options [Boolean] antialias default true
   * @option options [Boolean] alpha default true
   * @option options [Boolean] premultipliedAlpha default true
   * @option options [Boolean] depth default true
   * @option options [Boolean] stencil default false
   * @option options [Boolean] preserveDrawingBuffer manual clears, default false
   *
   * @return [Boolean] success
   */

  function ARERenderer(opts) {
    var canvasId, renderMode, _createCanvas;
    this._width = opts.width;
    this._height = opts.height;
    canvasId = opts.canvasId || "";
    renderMode = opts.renderMode || ARERenderer.RENDER_MODE_WGL;
    opts.premultipliedAlpha || (opts.premultipliedAlpha = true);
    opts.antialias || (opts.antialias = true);
    opts.alpha || (opts.alpha = true);
    opts.depth || (opts.depth = true);
    opts.stencil || (opts.stencil = false);
    this._alwaysClearScreen = !!opts.preserveDrawingBuffer;
    this._nextID = 0;
    this._defaultShader = null;
    this._canvas = null;
    this._ctx = null;
    this._gl = null;
    this._actors = [];
    this._actor_hash = {};
    this._textures = [];
    this._culling = false;
    this._currentMaterial = "none";
    this._activeRendererMode = null;
    this._cameraPosition = {
      x: 0,
      y: 0
    };
    this._zoomFactor = 1;
    this._pickRenderRequested = false;
    this._pickRenderBuff = null;
    this._pickRenderSelectionRect = null;
    this._pickRenderCB = null;
    this._clearColor = new AREColor3(255, 255, 255);
    _createCanvas = (function(_this) {
      return function(parent, id) {
        var parentElm;
        _this._canvas = document.createElement("canvas");
        _this._canvas.width = _this._width;
        _this._canvas.height = _this._height;
        _this._canvas.id = id;
        parentElm = document.querySelector(parent);
        parentElm || (parentElm = document.getElementById(parent));
        parentElm.appendChild(_this._canvas);
        return ARELog.info("Creating canvas #" + id + " [" + _this._width + "x" + _this._height + "] <" + parent + ">");
      };
    })(this);
    if (!canvasId) {
      _createCanvas("body", "are_anvas");
    } else {
      this._canvas = document.getElementById(canvasId);
      if (!this._canvas) {
        _createCanvas("body", canvasId);
      } else {
        if (this._canvas.nodeName.toLowerCase() === "canvas") {
          this._canvas.width = this._width;
          this._canvas.height = this._height;
        } else {
          _createCanvas(canvasId, "are_canvas");
        }
      }
    }
    if (!this._canvas) {
      throw new Error("Failed to create or find suitable canvas!");
    }
    switch (renderMode) {
      case ARERenderer.RENDER_MODE_NULL:
        this._initializeNullRendering();
        break;
      case ARERenderer.RENDER_MODE_CANVAS:
        this._initializeCanvasRendering();
        break;
      case ARERenderer.RENDER_MODE_WGL:
        if (!this._initializeWebGLRendering(opts)) {
          ARELog.info("Falling back on regular canvas renderer");
          this._initializeCanvasRendering();
        }
        break;
      default:
        throw new Error("Invalid Renderer " + rendererMode);
    }
    ARELog.info("Using the " + this._activeRendererMode + " renderer mode");
    this.setClearColor(255, 255, 255);
    this.switchMaterial(ARERenderer.MATERIAL_FLAT);
  }


  /*
   * Initializes a WebGL renderer context
   *
   * @return [Boolean] success
   */

  ARERenderer.prototype._initializeWebGLRendering = function(options) {
    var b, g, r, shaders, solidShader, textureShader, wireShader;
    this._gl = this._canvas.getContext("webgl", options);
    if (!this._gl) {
      ARELog.warn("Continuing with experimental webgl support");
      this._gl = this._canvas.getContext("experimental-webgl", options);
    }
    if (!this._gl) {
      ARELog.warn("Failed to obtain WebGL context");
      return false;
    }
    ARELog.info("Obtained WebGL context");
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.enable(this._gl.BLEND);
    this._gl.depthFunc(this._gl.LEQUAL);
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
    r = this._clearColor.getR(true);
    g = this._clearColor.getG(true);
    b = this._clearColor.getB(true);
    this._gl.clearColor(r, g, b, 1.0);
    shaders = AREShader.shaders;
    wireShader = shaders.wire;
    solidShader = shaders.solid;
    textureShader = shaders.texture;
    this._defaultShader = new AREShader(solidShader.vertex, solidShader.fragment, this._gl, true);
    this._defaultShader.generateHandles();
    this._wireShader = new AREShader(wireShader.vertex, wireShader.fragment, this._gl, true);
    this._wireShader.generateHandles();
    this._texShader = new AREShader(textureShader.vertex, textureShader.fragment, this._gl, true);
    this._texShader.generateHandles();
    ARELog.info("Initialized shaders");
    this._activeRendererMode = ARERenderer.RENDER_MODE_WGL;
    this.render = this._wglRender;
    this._pendingVBORefresh = false;
    this._vertexDataBuffer = this._gl.createBuffer();
    this.requestVBORefresh();
    ARELog.info("WebgL renderer initialized");
    return true;
  };


  /*
   * Initializes a canvas renderer context
   *
   * @return [Boolean]
   */

  ARERenderer.prototype._initializeCanvasRendering = function() {
    this._ctx = this._canvas.getContext("2d");
    this._activeRendererMode = ARERenderer.RENDER_MODE_CANVAS;
    this.render = this._cvRender;
    ARELog.info("Canvas renderer initialized");
    return true;
  };


  /*
   * Initializes a null renderer context
   * @return [Boolean]
   */

  ARERenderer.prototype._initializeNullRendering = function() {
    this._ctx = this._canvas.getContext("2d");
    this._activeRendererMode = ARERenderer.RENDER_MODE_NULL;
    this.render = this._nullRender;
    ARELog.info("Null renderer initialized");
    return true;
  };


  /*
   * Render method set by our mode, so we don't have to iterate over a
   * switch-case on each render call.
   *
   * Renders a frame, needs to be set in our constructor, by one of the init
   * methods.
   */

  ARERenderer.prototype.render = function() {};

  ARERenderer.prototype.enableCulling = function() {
    this._culling = true;
    return this;
  };

  ARERenderer.prototype.disableCulling = function() {
    this._culling = false;
    return this;
  };


  /*
   * Called once per frame, we perform various internal updates if needed
   */

  ARERenderer.prototype.update = function() {
    var VBOData, a, absBaseIndex, absI, actor, baseIndex, compiledVertices, currentOffset, deletedActors, i, indices, totalVertCount, vData, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2;
    deletedActors = _.remove(this._actors, function(a) {
      return a.flaggedForDeletion();
    });
    for (_i = 0, _len = deletedActors.length; _i < _len; _i++) {
      a = deletedActors[_i];
      a.rendererActorDelete();
    }
    if (this._pendingVBORefresh && this.isWGLRendererActive()) {
      currentOffset = 0;
      indices = [];
      compiledVertices = [];
      totalVertCount = 0;
      _ref = this._actors;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        actor = _ref[_j];
        if (actor.hasOwnIndiceBuffer()) {
          totalVertCount += actor.getRawVertexData().length;
        }
      }
      VBOData = new Float32Array(totalVertCount);
      _ref1 = this._actors;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        actor = _ref1[_k];
        if (actor.hasOwnIndiceBuffer()) {
          vData = actor.getRawVertexData();
          indices = [];
          for (i = _l = 0, _ref2 = vData.length / 4; 0 <= _ref2 ? _l < _ref2 : _l > _ref2; i = 0 <= _ref2 ? ++_l : --_l) {
            baseIndex = currentOffset + i;
            indices.push(baseIndex);
            absBaseIndex = baseIndex * 4;
            absI = i * 4;
            VBOData[absBaseIndex] = vData[absI];
            VBOData[absBaseIndex + 1] = vData[absI + 1];
            VBOData[absBaseIndex + 2] = vData[absI + 2];
            VBOData[absBaseIndex + 3] = vData[absI + 3];
          }
          currentOffset += vData.length / 4;
          actor.updateIndices(indices);
        }
      }
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexDataBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, VBOData, this._gl.STATIC_DRAW);
      return this._pendingVBORefresh = false;
    }
  };


  /*
   * Request VBO regeneration to be performed on next update
   */

  ARERenderer.prototype.requestVBORefresh = function() {
    return this._pendingVBORefresh = true;
  };


  /*
   * Returns the internal default shader
   *
   * @return [AREShader] shader default shader
   */

  ARERenderer.prototype.getDefaultShader = function() {
    return this._defaultShader;
  };


  /*
   * Returns the shader used for wireframe objects
   *
   * @return [AREShader] shader wire shader
   */

  ARERenderer.prototype.getWireShader = function() {
    return this._wireShader;
  };


  /*
   * Returns the shader used for textured objects
   *
   * @return [AREShader] shader texture shader
   */

  ARERenderer.prototype.getTextureShader = function() {
    return this._texShader;
  };


  /*
   * Returns canvas element
   *
   * @return [Object] canvas
   */

  ARERenderer.prototype.getCanvas = function() {
    return this._canvas;
  };


  /*
   * Returns canvas rendering context
   *
   * @return [Object] ctx
   */

  ARERenderer.prototype.getContext = function() {
    return this._ctx;
  };


  /*
   * Returns canvas width
   *
   * @return [Number] width
   */

  ARERenderer.prototype.getWidth = function() {
    return this._width;
  };


  /*
   * Returns canvas height
   *
   * @return [Number] height
   */

  ARERenderer.prototype.getHeight = function() {
    return this._height;
  };


  /*
   * @param [Object] position hash with x, y values
   */

  ARERenderer.prototype.setCameraPosition = function(_cameraPosition) {
    this._cameraPosition = _cameraPosition;
  };


  /*
   * @return [Object] position hash with x, y values
   */

  ARERenderer.prototype.getCameraPosition = function() {
    return {
      x: this._cameraPosition.x,
      y: this._cameraPosition.y
    };
  };


  /*
   * Sets a new zoom factor, and triggers a viewport refresh!
   *
   * @param [Number] zoom
   */

  ARERenderer.prototype.setCameraZoom = function(_zoomFactor) {
    var shader;
    this._zoomFactor = _zoomFactor;
    if (!(shader = this.getShaderForMaterial(this._currentMaterial))) {
      return;
    }
    return this.refreshViewport(shader);
  };


  /*
   * @return [Number] zoom
   */

  ARERenderer.prototype.getCameraZoom = function() {
    return this._zoomFactor;
  };


  /*
   * Returns the clear color
   *
   * @return [AREColor3] clearCol
   */

  ARERenderer.prototype.getClearColor = function() {
    return this._clearColor;
  };


  /*
   * Sets the clear color
   *
   * @overload setClearCol(col)
   *   Set using an AREColor3 object
   *   @param [AREColor3] col
   *
   * @overload setClearCol(r, g, b)
   *   Set using component values (0.0-1.0 or 0-255)
   *   @param [Number] r red component
   *   @param [Number] g green component
   *   @param [Number] b blue component
   */

  ARERenderer.prototype.setClearColor = function(colOrR, g, b) {
    var r;
    if (!this._clearColor) {
      this._clearColor = new AREColor3;
    }
    if (colOrR instanceof AREColor3) {
      this._clearColor = colOrR;
    } else {
      this._clearColor.setR(colOrR || 0);
      this._clearColor.setG(g || 0);
      this._clearColor.setB(b || 0);
    }
    if (this._activeRendererMode === ARERenderer.RENDER_MODE_WGL) {
      r = this._clearColor.getR(true);
      g = this._clearColor.getG(true);
      b = this._clearColor.getB(true);
      if (!!this._gl) {
        this._gl.clearColor(r, g, b, 1.0);
      }
    }
    return this;
  };


  /*
   * Request a frame to be rendered for scene picking.
   *
   * @param [FrameBuffer] buffer
   * @param [Method] cb cb to call post-render
   */

  ARERenderer.prototype.requestPickingRenderWGL = function(buffer, cb) {
    if (this._pickRenderRequested) {
      return ARELog.warn("Pick render already requested! No request queue");
    }
    this._pickRenderBuff = buffer;
    this._pickRenderSelectionRect = null;
    this._pickRenderCB = cb;
    this._pickRenderRequested = true;
    return this;
  };


  /*
   * Request a frame to be rendered for scene picking.
   *
   * @param [Object] selectionRect
   *   @property [Number] x
   *   @property [Number] y
   *   @property [Number] width
   *   @property [Number] height
   * @param [Method] cb cb to call post-render
   */

  ARERenderer.prototype.requestPickingRenderCanvas = function(selectionRect, cb) {
    if (this._pickRenderRequested) {
      return ARELog.warn("Pick render already requested! No request queue");
    }
    this._pickRenderBuff = null;
    this._pickRenderSelectionRect = selectionRect;
    this._pickRenderCB = cb;
    this._pickRenderRequested = true;
    return this;
  };


  /*
   * Draws a using WebGL frame
   * @return [Void]
   * @private
   */

  ARERenderer.prototype._wglRender = function() {
    var a, a_id, actorCount, actorIterator, bottomEdge, camPos, gl, leftEdge, rightEdge, topEdge, windowHeight_h, windowWidth_h, _id, _idSector, _savedColor, _savedOpacity;
    gl = this._gl;
    if (this._pickRenderRequested) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._pickRenderBuff);
    }
    if (this._alwaysClearScreen) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    actorCount = this._actors.length;
    actorIterator = this._actors.length;
    if (this._pickRenderRequested) {
      while (actorIterator--) {
        a = this._actors[actorCount - actorIterator - 1];
        if (a._visible) {
          a_id = a._id;
          _savedColor = {
            r: a._color._r,
            g: a._color._g,
            b: a._color._b
          };
          _savedOpacity = a._opacity;
          _id = a_id - (Math.floor(a_id / 255) * 255);
          _idSector = Math.floor(a_id / 255);
          this.switchMaterial(ARERenderer.MATERIAL_FLAT);
          a.setColor(_id, _idSector, 248);
          a.setOpacity(1.0);
          a.wglDraw(gl, this._defaultShader);
          a.setColor(_savedColor.r, _savedColor.g, _savedColor.b);
          a.setOpacity(_savedOpacity);
        }
      }
      this._pickRenderCB();
      this._pickRenderRequested = false;
      this._pickRenderBuff = null;
      this._pickRenderCB = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.render();
    } else {
      windowWidth_h = window.innerWidth * this._zoomFactor * 0.5;
      windowHeight_h = window.innerHeight * this._zoomFactor * 0.5;
      leftEdge = rightEdge = topEdge = bottomEdge = true;
      camPos = this._cameraPosition;
      while (actorIterator--) {
        a = this._actors[actorCount - actorIterator - 1];
        if (a._visible) {
          leftEdge = (a._position.x - camPos.x) + (a._bounds.w / 2) < -windowWidth_h;
          rightEdge = (a._position.x - camPos.x) - (a._bounds.w / 2) > windowWidth_h;
          topEdge = (a._position.y - camPos.y) + (a._bounds.h / 2) < -windowHeight_h;
          bottomEdge = (a._position.y - camPos.y) - (a._bounds.h / 2) > windowHeight_h;
          if (!this._culling || !(bottomEdge || topEdge || leftEdge || rightEdge)) {
            if (a._attachedTexture) {
              a = a.updateAttachment();
            }
            if (a._material !== this._currentMaterial) {
              this.switchMaterial(a._material);
            }
            a.wglDraw(gl);
          }
        }
      }
    }
    return this;
  };


  /*
   * Canavs render
   * @return [self]
   * @private
   */

  ARERenderer.prototype._cvRender = function() {
    var a, ctx, material, r, _i, _id, _idSector, _len, _ref, _savedColor, _savedOpacity;
    if (!this._ctx) {
      return;
    }
    ctx = this._ctx;
    if (this._clearColor) {
      ctx.fillStyle = "rgb" + this._clearColor;
      ctx.fillRect(0, 0, this._width, this._height);
    } else {
      ctx.clearRect(0, 0, this._width, this._height);
    }
    ctx.save();
    ctx.translate(0, this._height);
    ctx.scale(1, -1);
    _ref = this._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      ctx.save();
      if (this._pickRenderRequested) {
        _savedColor = a._color;
        _savedColor = {
          r: _savedColor._r,
          g: _savedColor._g,
          b: _savedColor._b
        };
        _savedOpacity = a._opacity;
        _id = a.getId() - (Math.floor(a.getId() / 255) * 255);
        _idSector = Math.floor(a.getId() / 255);
        this.switchMaterial(ARERenderer.MATERIAL_FLAT);
        a.setColor(_id, _idSector, 248);
        a.setOpacity(1.0);
        a.cvDraw(ctx);
        a.setColor(_savedColor.r, _savedColor.g, _savedColor.b);
        a.setOpacity(_savedOpacity);
      } else {
        a = a.updateAttachment();
        if ((material = a.getMaterial()) !== this._currentMaterial) {
          this.switchMaterial(material);
        }
        a.cvDraw(ctx);
      }
      ctx.restore();
    }
    ctx.restore();
    if (this._pickRenderRequested) {
      r = this._pickRenderSelectionRect;
      this._pickRenderCB(ctx.getImageData(r.x, r.y, r.width, r.height));
      this._pickRenderRequested = false;
      this._pickRenderBuff = null;
      this._pickRenderSelectionRect = null;
      this._pickRenderCB = null;
      this.render();
    }
    return this;
  };


  /*
   * "No render" function
   * @return [Void]
   * @private
   */

  ARERenderer.prototype._nullRender = function() {
    var a, ctx, _i, _len, _ref;
    if (!this._ctx) {
      return;
    }
    ctx = this._ctx;
    if (this._clearColor) {
      ctx.fillStyle = "rgb" + this._clearColor;
      ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    _ref = this._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      a = a.updateAttachment();
      a.nullDraw(ctx);
    }
    return this;
  };


  /*
   * Manually clear the screen
   *
   * @return [Void]
   */

  ARERenderer.prototype.clearScreen = function() {
    switch (this._activeRendererMode) {
      case ARERenderer.RENDER_MODE_CANVAS:
        if (this._clearColor) {
          this._ctx.fillStyle = "rgb" + this._clearColor;
          this._ctx.fillRect(0, 0, this._width, this._height);
        } else {
          this._ctx.clearRect(0, 0, this._width, this._height);
        }
        break;
      case ARERenderer.RENDER_MODE_WGL:
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    }
    return this;
  };


  /*
   * Returns the currently active renderer mode
   * @return [Number] rendererMode
   */

  ARERenderer.prototype.getActiveRendererMode = function() {
    return this._activeRendererMode;
  };


  /*
   * Is the null renderer active?
   * @return [Boolean] is_active
   */

  ARERenderer.prototype.isNullRendererActive = function() {
    return this._activeRendererMode === ARERenderer.RENDER_MODE_NULL;
  };


  /*
   * Is the canvas renderer active?
   * @return [Boolean] is_active
   */

  ARERenderer.prototype.isCanvasRendererActive = function() {
    return this._activeRendererMode === ARERenderer.RENDER_MODE_CANVAS;
  };


  /*
   * Is the WebGL renderer active?
   * @return [Boolean] is_active
   */

  ARERenderer.prototype.isWGLRendererActive = function() {
    return this._activeRendererMode === ARERenderer.RENDER_MODE_WGL;
  };


  /*
   * Returns a unique id, used by actors
   * @return [Number] id unique id
   */

  ARERenderer.prototype.getNextId = function() {
    return this._nextID++;
  };


  /*
   * Get GL context
   *
   * @return [Context] gl
   */

  ARERenderer.prototype.getGL = function() {
    return this._gl;
  };


  /*
   * Add an actor to our render list. A layer can be optionally specified, at
   * which point it will also be applied to the actor.
   *
   * If no layer is specified, we use the current actor layer (default 0)
   *
   * @param [ARERawActor] actor
   * @param [Number] layer
   * @return [ARERawActor] actor added actor
   */

  ARERenderer.prototype.addActor = function(actor, layer) {
    var layerIndex;
    if (!isNaN(layer)) {
      actor.layer = layer;
    }
    layerIndex = _.sortedIndex(this._actors, actor, "layer");
    this._actors.splice(layerIndex, 0, actor);
    this._actor_hash[actor.getId()] = actor;
    return actor;
  };


  /*
   * Remove an actor from our render list by either actor, or id
   *
   * @param [ARERawActor, Number] actorId actor id, or actor
   * @return [Boolean] success
   */

  ARERenderer.prototype.removeActor = function(actorId) {
    var removedActor;
    if (actorId instanceof ARERawActor) {
      actorId = actorId.getId();
    }
    removedActor = _.remove(this._actors, (function(a) {
      return a.getId() === actorId;
    }))[0];
    return !!removedActor;
  };

  ARERenderer.prototype.makeOrthoMatrix = function(left, right, bottom, top, znear, zfar) {
    return new Float32Array([2 / (right - left), 0, 0, 0, 0, 2 / (top - bottom), 0, 0, 0, 0, -2 / (zfar - znear), 0, -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(zfar + znear) / (zfar - znear), 1]);
  };


  /*
   * Reconstructs our viewport based on the camera scale, and uploads a fresh
   * projection matrix for the provided material (should be our current shader)
   */

  ARERenderer.prototype.refreshViewport = function(material) {
    var handles, height, ortho, width;
    width = this._width * this._zoomFactor;
    height = this._height * this._zoomFactor;
    ortho = this.makeOrthoMatrix(-width / 2, width / 2, height / 2, -height / 2, -10, 10);
    handles = material.getHandles();
    return this._gl.uniformMatrix4fv(handles.uProjection, false, ortho);
  };


  /*
   * Get the shader we are using for the specified material. Returns null if we
   * don't recognize it.
   *
   * @param [String] material
   * @return [AREShader] shader
   */

  ARERenderer.prototype.getShaderForMaterial = function(material) {
    switch (material) {
      case ARERenderer.MATERIAL_FLAT:
        return this._defaultShader;
      case ARERenderer.MATERIAL_TEXTURE:
        return this._texShader;
      default:
        return null;
    }
  };


  /*
   * Switch material (shader program)
   *
   * @param [String] material
   */

  ARERenderer.prototype.switchMaterial = function(material) {
    var shader;
    if (material === this._currentMaterial) {
      return false;
    }
    if (this.isWGLRendererActive()) {
      if (!(shader = this.getShaderForMaterial(material))) {
        throw new Error("Unknown material " + material);
      }
      this._gl.useProgram(shader.getProgram());
      this.refreshViewport(shader);
    }
    this._currentMaterial = material;
    return this;
  };


  /*
   * Checks if we have a texture loaded
   *
   * @param [String] name texture name to check for
   */

  ARERenderer.prototype.hasTexture = function(name) {
    return !!_.find(this._textures, function(t) {
      return t.name === name;
    });
  };


  /*
   * Fetches a texture by name
   *
   * @param [String] name name of texture to fetch
   * @param [Object] texture
   */

  ARERenderer.prototype.getTexture = function(name) {
    return _.find(this._textures, function(t) {
      return t.name === name;
    });
  };


  /*
   * Fetches texture size
   *
   * @param [String] name name of texture
   * @param [Object] size
   */

  ARERenderer.prototype.getTextureSize = function(name) {
    var t;
    if (t = this.getTexture(name)) {
      return {
        w: t.width * t.scaleX,
        h: t.height * t.scaleY
      };
    } else {
      return null;
    }
  };


  /*
   * Adds a texture to our internal collection
   *
   * @param [Object] texture texture object with name and gl texture
   */

  ARERenderer.prototype.addTexture = function(tex) {
    this._textures.push(tex);
    return this;
  };

  return ARERenderer;

})();


/*
 * PhysicsManager is in charge of starting and communicating with the physics
 * web worker.
 */

PhysicsManager = (function() {
  function PhysicsManager(_renderer, depPaths, cb) {
    var dependencies;
    this._renderer = _renderer;
    this._backlog = [];
    dependencies = [
      {
        raw: "cp = exports = {};"
      }, {
        url: depPaths.chipmunk
      }, {
        url: depPaths.physics_worker
      }
    ];
    async.map(dependencies, function(dependency, depCB) {
      var request;
      if (dependency.raw) {
        return depCB(null, dependency.raw);
      }
      request = new XMLHttpRequest();
      request.open("GET", dependency.url, true);
      request.onerror = function(e) {
        return depCB("Connection error: " + e, null);
      };
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          return depCB(null, request.responseText);
        } else {
          return depCB("Request returned " + request.status, null);
        }
      };
      return request.send();
    }, (function(_this) {
      return function(error, sources) {
        _this._initFromSources(sources);
        _this._emptyBacklog();
        if (cb) {
          return cb();
        }
      };
    })(this));
  }

  PhysicsManager.prototype._initFromSources = function(sources) {
    var data;
    if (!!this._worker) {
      return;
    }
    data = new Blob([sources.join("\n\n")], {
      type: "text/javascript"
    });
    this._worker = new Worker((URL || window.webkitURL).createObjectURL(data));
    this._worker.postMessage("");
    return this._connectWorkerListener();
  };

  PhysicsManager.prototype._emptyBacklog = function() {
    var item, _i, _len, _ref, _results;
    if (!this._worker) {
      return;
    }
    _ref = this._backlog;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _results.push(this.sendMessage(item.message, item.command));
    }
    return _results;
  };


  /*
   * Broadcast a message to the physics manager; this gets passed through to the
   * underlying web worker.
   *
   * @param [Object] message
   * @param [String] command
   */

  PhysicsManager.prototype.sendMessage = function(message, command) {
    if (!!this._worker) {
      return this._worker.postMessage({
        message: message,
        command: command
      });
    } else {
      return this._backlog.push({
        message: message,
        command: command
      });
    }
  };

  PhysicsManager.prototype._connectWorkerListener = function() {
    var ID_INDEX, POS_INDEX, ROT_INDEX, actor, data, dataPacket;
    ID_INDEX = 0;
    POS_INDEX = 1;
    ROT_INDEX = 2;
    data = {};
    dataPacket = {};
    actor = {};
    return this._worker.onmessage = (function(_this) {
      return function(e) {
        var l, _results;
        data = e.data;
        if (data.length) {
          l = data.length;
          _results = [];
          while (l--) {
            dataPacket = data[l];
            actor = _this._renderer._actor_hash[dataPacket[ID_INDEX]];
            actor._position = dataPacket[POS_INDEX];
            actor._rotation = dataPacket[ROT_INDEX];
            _results.push(actor._updateModelMatrix());
          }
          return _results;
        }
      };
    })(this);
  };

  return PhysicsManager;

})();

ARELog = (function() {
  function ARELog() {}

  ARELog.tags = ["", "[Error]> ", "[Warning]> ", "[Debug]> ", "[Info]> "];

  ARELog.level = 4;

  ARELog.w = function(level, str) {
    var me;
    me = ARELog;
    if (level > me.level || level === 0 || me.level === 0) {
      return;
    }
    if (level === 1 && console.error !== void 0) {
      if (console.error) {
        return console.error("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level === 2 && console.warn !== void 0) {
      if (console.warn) {
        return console.warn("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level === 3 && console.debug !== void 0) {
      if (console.debug) {
        return console.debug("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level === 4 && console.info !== void 0) {
      if (console.info) {
        return console.info("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level > 4 && me.tags[level] !== void 0) {
      return console.log("" + me.tags[level] + str);
    } else {
      return console.log(str);
    }
  };

  ARELog.error = function(str) {
    return this.w(1, str);
  };

  ARELog.warn = function(str) {
    return this.w(2, str);
  };

  ARELog.debug = function(str) {
    return this.w(3, str);
  };

  ARELog.info = function(str) {
    return this.w(4, str);
  };

  return ARELog;

})();

AREBezAnimation = (function() {

  /*
   * For all animateable properties the options param passes in the end value,
   * an array of [time, value] control points, the duration of the animation
   * and the property to be affected by these options.
   *
   * Properties are named by keys (rotation, position, color), with composite
   * values supplied as an array of the property name, and the composite name.
   *
   * i.e. ["position", "x"]
   * @param [ARERawActor] actor represents the actor we animate
   * @param [Object] options represents the options used to animate
   * @option options [Number] endVal
   * @option options [Array<Object>] controlPoints
   * @option options [Number] duration
   * @option options [String, Array] property
   * @option options [Number] fps framerate, defaults to 30
   * @option options [Method] cbStart callback to call before animating
   * @option options [Method] cbEnd callback to call after animating
   * @option options [Method] cbStep callback to call after each update
   * @param [Boolean] dryRun sets up for preCalculate only! Actor optional.
   */
  function AREBezAnimation(actor, options, dryRun) {
    this.actor = actor;
    dryRun = !!dryRun;
    this._duration = options.duration;
    this._property = options.property;
    this._controlPoints = options.controlPoints || [];
    this._fps = options.fps || 30;
    this._cbStep = options.cbStep || function() {};
    this._cbEnd = options.cbEnd || function() {};
    this._cbStart = options.cbStart || function() {};
    this._animated = false;
    this.bezOpt = {};
    this.bezOpt.degree = 0;
    if (options.controlPoints.length > 0) {
      this.bezOpt.degree = options.controlPoints.length;
      this.bezOpt.ctrl = options.controlPoints;
    }
    this.bezOpt.endPos = options.endVal;
    this.tIncr = 1 / (this._duration * (this._fps / 1000));
    if (dryRun) {
      this.bezOpt.startPos = options.startVal;
    } else {
      if (this._property[0] === "rotation") {
        this.bezOpt.startPos = this.actor.getRotation();
      }
      if (this._property[0] === "position") {
        if (this._property[1] === "x") {
          this.bezOpt.startPos = this.actor.getPosition().x;
        } else if (this._property[1] === "y") {
          this.bezOpt.startPos = this.actor.getPosition().y;
        }
      }
      if (this._property[0] === "color") {
        if (this._property[1] === "r") {
          this.bezOpt.startPos = this.actor.getColor().getR();
        } else if (this._property[1] === "g") {
          this.bezOpt.startPos = this.actor.getColor().getG();
        } else if (this._property[1] === "b") {
          this.bezOpt.startPos = this.actor.getColor().getB();
        }
      }
    }
  }


  /*
   * Updates the animation for a certain value t, between 0 and 1
   *
   * @param [Number] t animation state, 0.0-1.0
   * @param [Boolean] apply applies the updated value, defaults to true
   *
   * @return [Number] val new value
   * @private
   */

  AREBezAnimation.prototype._update = function(t, apply) {
    var val, _Mt, _Mt2, _Mt3, _t2, _t3;
    apply || (apply = true);
    if (t < 0) {
      t = 0;
    }
    if (t > 1) {
      t = 1;
    }
    if (this.bezOpt.degree === 0) {
      val = this.bezOpt.startPos + ((this.bezOpt.endPos - this.bezOpt.startPos) * t);
    } else if (this.bezOpt.degree === 1) {
      _Mt = 1 - t;
      _Mt2 = _Mt * _Mt;
      _t2 = t * t;
      val = (_Mt2 * this.bezOpt.startPos) + (2 * _Mt * t * this.bezOpt.ctrl[0].y) + _t2 * this.bezOpt.endPos;
    } else if (this.bezOpt.degree === 2) {
      _Mt = 1 - t;
      _Mt2 = _Mt * _Mt;
      _Mt3 = _Mt2 * _Mt;
      _t2 = t * t;
      _t3 = _t2 * t;
      val = (_Mt3 * this.bezOpt.startPos) + (3 * _Mt2 * t * this.bezOpt.ctrl[0].y) + (3 * _Mt * _t2 * this.bezOpt.ctrl[1].y) + (_t3 * this.bezOpt.endPos);
    } else {
      throw new Error("Invalid degree, can't evaluate (" + this.bezOpt.degree + ")");
    }
    if (apply) {
      this._applyValue(val);
      this._cbStep(val);
    }
    return val;
  };


  /*
   * Calculate value for each step, return an object with "values" and
   * "stepTime" keys
   *
   * @return [Object] bezValues
   */

  AREBezAnimation.prototype.preCalculate = function() {
    var bezValues, t;
    t = 0;
    bezValues = {
      stepTime: this._duration * this.tIncr
    };
    bezValues.values = [];
    while (t <= 1.0) {
      t += this.tIncr;
      if (t > 1 && t < (1 + this.tIncr)) {
        t = 1;
      } else if (t > 1) {
        break;
      }
      bezValues.values.push(this._update(t, false));
    }
    return bezValues;
  };


  /*
   * Apply value to our actor
   *
   * @param [Number] val
   * @private
   */

  AREBezAnimation.prototype._applyValue = function(val) {
    var _b, _g, _r;
    if (this._property[0] === "rotation") {
      return this.actor.setRotation(val);
    } else if (this._property[0] === "position") {
      if (this._property[1] === "x") {
        return this.actor.setPosition({
          x: val,
          y: this.actor.getPosition().y
        });
      } else if (this._property[1] === "y") {
        return this.actor.setPosition({
          x: this.actor.getPosition().x,
          y: val
        });
      }
    } else if (this._property[0] === "color") {
      if (this._property[1] === "r") {
        _r = val;
        _g = this.actor.getColor().getG();
        _b = this.actor.getColor().getB();
        return this.actor.setColor(_r, _g, _b);
      } else if (this._property[1] === "g") {
        _r = this.actor.getColor().getR();
        _g = val;
        _b = this.actor.getColor().getB();
        return this.actor.setColor(_r, _g, _b);
      } else if (this._property[1] === "b") {
        _r = this.actor.getColor().getR();
        _g = this.actor.getColor().getG();
        _b = val;
        return this.actor.setColor(_r, _g, _b);
      }
    }
  };


  /*
   * Called after construction of the animation object
   * to actually begin the animation
   */

  AREBezAnimation.prototype.animate = function() {
    var t;
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    this._cbStart();
    t = -this.tIncr;
    return this._intervalID = setInterval((function(_this) {
      return function() {
        t += _this.tIncr;
        if (t > 1) {
          t = 1;
        }
        _this._update(t);
        if (t === 1) {
          clearInterval(_this._intervalID);
          return _this._cbEnd();
        } else {
          return _this._cbStep();
        }
      };
    })(this), 1000 / this._fps);
  };

  return AREBezAnimation;

})();

AREVertAnimation = (function() {

  /*
   * Class to animate vertices using vertex delta sets. The delta sets describe
   * the change in vertice structure at a specific point in time.
   *
   * Note that vertex sets are stored flat, and deltas are interpreted the same
   * way. So deltas take the form of [deltaX1, deltaY1, deltaX2, deltaY2, ....]
   *
   * Vertices need to be passed in as deltas. Any vertices not currently present
   * in the actor (new vertices, index > actor.vertices.length) will be pushed
   * directly. If the new vertice set is smaller than that of the actor, the
   * difference will be dropped unless the ending vertice has a value of "|"
   *
   * Vertices with a value of "." will be left unchanged. Absolute values will
   * be set directly, whereas numbers prefixed with "-" or "+" will be offset
   * accordingly.
   *
   * Repeating series may also be passed in, signaling repetition with "...",
   * and ending delta parsing. As such, no unique deltas may exist after an
   * occurence of "..." is encountered! Repeating series also support partial
   * application (existing vert set length does not have to be divisible by
   * the repeat step)
   *
   * @example Example vertex set specifications
   *   ["+5", "-3", 3.53, 5, ".", "."]
   *   applied to
   *   [20, 42, 23, 67, 34, 75, 96, 32, 76, 23]
   *   yields
   *   [25, 39, 3.53, 5, 34, 75]
   *
   *   ["2", "|"]
   *   applied to
   *   [1, 1, 1, 1, 1, 1]
   *   yields
   *   [2, 1, 1, 1, 1, 1]
   *
   *   ["+1", ".", "..."]
   *   applies to
   *   [4, 4, 4, 4, 4, 4, 4, 4, 4]
   *   yields
   *   [5, 4, 5, 4, 5, 4, 5, 4, 5]
   *
   *   Values passed in as numbers (not strings) will be interpreted as absolute
   *   changes. If you need to set a negative value, use a number, not a string!
   *
   * @param [ARERawActor] actor the actor we apply the modifications to
   * @param [Object] options the options we apply
   * @option options [Number, Array<Number>] delays
   * @option options [Array, Array<Array>] deltas
   * @option options [Array<Number>] udata objects passed into step callback
   * @option options [Method] cbStart callback to call before animating
   * @option options [Method] cbStep callback to call on each delta application
   * @option options [Method] cbEnd callback to call after animating
   */
  function AREVertAnimation(actor, options) {
    this.actor = actor;
    this._delays = options.delays;
    this._deltas = options.deltas;
    this._udata = options.udata;
    this._cbStep = options.cbStep || function() {};
    this._cbEnd = options.cbEnd || function() {};
    this._cbStart = options.cbStart || function() {};
    if (this._delays.length !== this._deltas.length) {
      ARELog.warn("Vert animation delay count != delta set count! Bailing.");
      this._animated = true;
      return;
    }
    this._animated = false;
  }


  /*
   * Set the timeout for our _applyDeltas() method
   *
   * @param [Object] deltaSet set of deltas to apply to the actor
   * @param [Number] delay the delay in miliseconds to make the update
   * @param [Object] udata optional userdata to send to callback
   * @param [Boolean] last signals this is the last timeout
   * @private
   */

  AREVertAnimation.prototype._setTimeout = function(deltaSet, delay, udata, last) {
    return setTimeout((function(_this) {
      return function() {
        _this._applyDeltas(deltaSet, udata);
        if (last) {
          return _this._cbEnd();
        }
      };
    })(this), delay);
  };


  /*
   * @private
   * Applies the delta set to the actor
   *
   * @param [Array<String, Number>] deltaSet
   * @param [Object] udata optional userdata to send to callback
   */

  AREVertAnimation.prototype._applyDeltas = function(deltaSet, udata) {
    var d, finalVerts, i, repeat, val, _i, _ref;
    this._cbStep(udata);
    finalVerts = this.actor.getVertices();
    repeat = deltaSet.join("_").indexOf("...") !== -1;
    for (i = _i = 0, _ref = deltaSet.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      d = deltaSet[i];
      if (i >= finalVerts.length) {
        if (repeat) {
          break;
        }
        val = void 0;
      } else {
        val = finalVerts[i];
      }
      if (typeof d === "number") {
        val = d;
      } else if (typeof d === "string") {
        if (!val) {
          ARELog.warn("Vertex does not exist, yet delta is relative!");
          return;
        }
        if (d.charAt(0) === "|") {
          break;
        } else if (d.charAt(0) === "-") {
          val -= Number(d.slice(1));
        } else if (d.charAt(0) === "+") {
          val += Number(d.slice(1));
        } else if (d === "...") {
          i = 0;
        } else if (d.charAt(0) !== ".") {
          ARELog.warn("Unknown delta action, " + d + ", can't apply deltas.");
          return;
        }
      } else {
        ARELog.warn("Unknown delta type, can't apply deltas! " + d + " " + (typeof d));
        return;
      }
      if (i > finalVerts.length) {
        ARELog.warn("Vertex gap, can't push new vert! " + val + ":" + d + ":" + i);
        return;
      } else if (i === finalVerts.length) {
        finalVerts.push(val);
      } else {
        finalVerts[i] = val;
      }
    }
    return this.actor.updateVertices(finalVerts);
  };


  /*
   * Looks through all the options provided and sends them to the update
   * function so they are not lost when i updates
   */

  AREVertAnimation.prototype.animate = function() {
    var i, last, udata, _i, _ref, _results;
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    this._cbStart();
    _results = [];
    for (i = _i = 0, _ref = this._deltas.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      udata = null;
      if (this._udata) {
        if (this._udata instanceof Array) {
          if (i < this._udata.length) {
            udata = this._udata[i];
          }
        } else {
          udata = this._udata;
        }
      }
      last = i === (this._deltas.length - 1);
      _results.push(this._setTimeout(this._deltas[i], this._delays[i], udata, last));
    }
    return _results;
  };

  return AREVertAnimation;

})();

AREPsyxAnimation = (function() {

  /*
   * Class to "animate" physics properties which means changing them
   * at certain times by calling the createPhysicsBody method of an actor
   *
   * @param [ARERawActor] actor the actor we apply the modifications to
   * @param [Object] options
   * @option options [Number] mass
   * @option options [Number] friction
   * @option options [Number] elasticity
   * @option options [Number] timeout
   * @option options [Method] cbStart callback to call before animating
   * @option options [Method] cbEnd callback to call after animating
   */
  function AREPsyxAnimation(actor, options) {
    this.actor = actor;
    this._mass = options.mass || 0;
    this._friction = options.friction || 0;
    this._elasticity = options.elasticity || 0;
    this._timeout = options.timeout;
    this._cbStep = options.cbStep || function() {};
    this._cbEnd = options.cbEnd || function() {};
    this._cbStart = options.cbStart || function() {};
    this._animated = false;
  }


  /*
   * Activates the animation (can only be run once)
   */

  AREPsyxAnimation.prototype.animate = function() {
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    this._cbStart();
    return setTimeout((function(_this) {
      return function() {
        _this.actor.createPhysicsBody(_this._mass, _this._friction, _this._elasticity);
        return _this._cbEnd();
      };
    })(this), this._timeout);
  };

  return AREPsyxAnimation;

})();

AREActorInterface = (function() {
  function AREActorInterface(masterInterface) {}

  AREActorInterface.prototype.setEngine = function(engine) {
    return this._renderer = engine.getRenderer();
  };


  /*
   * Fails with null
   * @private
   */

  AREActorInterface.prototype._findActor = function(id) {
    var a, _i, _len, _ref;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id) {
        return a;
      }
    }
    return null;
  };


  /*
   * Create actor using the supplied vertices, passed in as a flat array
   *
   * @param [Array<Number>] verts
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.create2DRawPolygon = function(verts) {
    return new ARERawActor(this._renderer, verts).getId();
  };


  /*
   * Create a variable sided actor of the specified radius
   *
   * @param [Number] radius
   * @param [Number] segments
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.create2DPolygon = function(radius, segments) {
    if (typeof radius === "string") {
      return this.createRawActor(radius);
    } else {
      return new AREPolygonActor(this._renderer, radius, segments).getId();
    }
  };


  /*
   * Creates a rectangle actor of the specified width and height
   *
   * @param [Number] width
   * @param [Number] height
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.create2DRectangle = function(width, height) {
    return new ARERectangleActor(this._renderer, width, height).getId();
  };


  /*
   * Creates a circle actor with the specified radius
   *
   * @param [Number] radius
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.create2DCircle = function(radius) {
    return new ARECircleActor(this._renderer, radius).getId();
  };


  /*
   * Get actor render layer
   *
   * @param [Number] id
   * @return [Number] layer
   */

  AREActorInterface.prototype.getLayer = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getLayer();
    } else {
      return null;
    }
  };


  /*
   * Get actor physics layer
   *
   * @param [Number] id
   * @return [Number] physicsLayer
   */

  AREActorInterface.prototype.getPhysicsLayer = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getPhysicsLayer();
    } else {
      return null;
    }
  };


  /*
   * Fetch the width of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] width
   */

  AREActorInterface.prototype.getRectangleWidth = function(id) {
    var a;
    if ((a = this._findActor(id)) && a instanceof ARERectangleActor) {
      return a.getWidth();
    } else {
      return null;
    }
  };


  /*
   * Fetch the height of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] height
   */

  AREActorInterface.prototype.getRectangleHeight = function(id) {
    var a;
    if ((a = this._findActor(id)) && a instanceof ARERectangleActor) {
      return a.getHeight();
    } else {
      return null;
    }
  };


  /*
   * Get actor opacity using handle, fails with null
   *
   * @param [Number] id
   * @return [Number] opacity
   */

  AREActorInterface.prototype.getOpacity = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getOpacity();
    } else {
      return null;
    }
  };


  /*
   * Get actor visible using handle, fails with null
   *
   * @param [Number] id
   * @return [Boolean] visible
   */

  AREActorInterface.prototype.isVisible = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getVisible();
    } else {
      return null;
    }
  };


  /*
   * Get actor position using handle, fails with null
   * Returns position as a JSON representation of a primitive (x, y) object!
   *
   * @param [Number] id
   * @return [Object] position {x, y}
   */

  AREActorInterface.prototype.getPosition = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getPosition();
    } else {
      return null;
    }
  };


  /*
   * Get actor rotation
   *
   * @param [Number] id
   * @param [Boolean] radians defaults to false
   * @return [Number] angle in degrees or radians
   */

  AREActorInterface.prototype.getRotation = function(id, radians) {
    var a;
    if (a = this._findActor(id)) {
      return a.getRotation(!!radians);
    } else {
      return null;
    }
  };


  /*
   * Returns actor color as a JSON triple, in 0-255 range
   * Uses id, fails with null
   *
   * @param [Number] id
   * @return [String] col
   */

  AREActorInterface.prototype.getColor = function(id) {
    var a, color;
    if (a = this._findActor(id)) {
      color = a.getColor();
      return {
        r: color.getR(),
        g: color.getG(),
        b: color.getB()
      };
    } else {
      return null;
    }
  };


  /*
   * Return an Actor's texture name
   *
   * @param [Number] id
   * @return [String] texture_name
   */

  AREActorInterface.prototype.getTexture = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getTexture().name;
    } else {
      return null;
    }
  };


  /*
   * Retrieve an Actor's texture repeat
   *
   * @param [Number] id
   * @return [Object] repeat
   */

  AREActorInterface.prototype.getTextureRepeat = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getTextureRepeat();
    } else {
      return null;
    }
  };


  /*
   * Set the height of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] height
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRectangleHeight = function(id, height) {
    var a;
    if ((a = this._findActor(id)) && a instanceof ARERectangleActor) {
      a.setHeight(height);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set the width of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] width
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRectangleWidth = function(id, width) {
    var a;
    if ((a = this._findActor(id)) && a instanceof ARERectangleActor) {
      a.setWidth(width);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set the segment count of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] segments
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPolygonSegments = function(id, segments) {
    var a;
    if ((a = this._findActor(id)) && a instanceof AREPolygonActor) {
      a.setSegments(segments);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set the radius of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] radius
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPolygonRadius = function(id, radius) {
    var a;
    if ((a = this._findActor(id)) && a instanceof AREPolygonActor) {
      a.setRadius(radius);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Get the radius of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] radius
   */

  AREActorInterface.prototype.getPolygonRadius = function(id) {
    var a;
    if ((a = this._findActor(id)) && a instanceof AREPolygonActor) {
      return a.getRadius();
    } else {
      return null;
    }
  };


  /*
   * Get the segment count of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] segments
   */

  AREActorInterface.prototype.getPolygonSegments = function(id, radius) {
    var a;
    if ((a = this._findActor(id)) && a instanceof AREPolygonActor) {
      return a.getSegments();
    } else {
      return null;
    }
  };


  /*
   * Attach texture to actor. Fails if actor isn't found
   *
   * @param [Number] id id of actor to attach texture to
   * @param [String] texture texture name
   * @param [Number] width attached actor width
   * @param [Number] height attached actor height
   * @param [Number] offx anchor point offset
   * @param [Number] offy anchor point offset
   * @param [Angle] angle anchor point rotation
   * @return [Boolean] success
   */

  AREActorInterface.prototype.attachTexture = function(id, texture, w, h, x, y, angle) {
    var a;
    x || (x = 0);
    y || (y = 0);
    angle || (angle = 0);
    if (a = this._findActor(id)) {
      a.attachTexture(texture, w, h, x, y, angle);
      return true;
    }
    return false;
  };


  /*
   * Set actor layer. Fails if actor isn't found.
   * Actors render from largest layer to smallest
   *
   * @param [Number] id id of actor to set layer of
   * @param [Number] layer
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setLayer = function(id, layer) {
    var a;
    if (a = this._findActor(id)) {
      a.setLayer(layer);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor physics layer. Fails if actor isn't found.
   * Physics layers persist within an actor between body creations. Only bodies
   * in the same layer will collide! There are only 16 physics layers!
   *
   * @param [Number] id id of actor to set layer of
   * @param [Number] layer
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPhysicsLayer = function(id, layer) {
    var a;
    if (a = this._findActor(id)) {
      a.setPhysicsLayer(layer);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Remove attachment from an actor. Fails if actor isn't found
   *
   * @param [Number] id id of actor to remove texture from
   * @return [Boolean] success
   */

  AREActorInterface.prototype.removeAttachment = function(id) {
    var a;
    if (a = this._findActor(id)) {
      a.removeAttachment();
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set attachment visiblity. Fails if actor isn't found, or actor has no
   * attachment.
   *
   * @param [Number] id id of actor to modify
   * @param [Boolean] visible
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setAttachmentVisiblity = function(id, visible) {
    var a;
    if (a = this._findActor(id)) {
      return a.setAttachmentVisibility(visible);
    } else {
      return false;
    }
  };


  /*
   * Refresh actor vertices, passed in as a flat array
   *
   * @param [Number] id actor id
   * @param [Array<Number<] verts
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setVertices = function(id, verts) {
    var a;
    if (a = this._findActor(id)) {
      a.updateVertices(verts);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Get actor vertices as a flat array
   *
   * @param [Number] id actor id
   * @return [Array<Number>] vertices
   */

  AREActorInterface.prototype.getVertices = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getVertices();
    } else {
      return null;
    }
  };


  /*
   * Clears stored information about the actor in question. This includes the
   * rendered and physics bodies
   *
   * @param [Numer] id actor id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.destroyActor = function(id) {
    var a;
    if (a = this._findActor(id)) {
      a.destroy();
      return true;
    } else {
      return false;
    }
  };


  /*
   * Supply an alternate set of vertices for the physics body of an actor. This
   * is necessary for triangle-fan shapes, since the center point must be
   * removed when building the physics body. If a physics body already exists,
   * this rebuilds it!
   *
   * @param [Number] id actor id
   * @param [Array<Number>] verts
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPhysicsVertices = function(id, verts) {
    var a;
    if (a = this._findActor(id)) {
      a.setPhysicsVertices(verts);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Change actors' render mode, currently only options are avaliable
   *   1 == TRIANGLE_STRIP
   *   2 == TRIANGLE_FAN
   *
   * @param [Number] id actor id
   * @param [Number] mode
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRenderMode = function(id, mode) {
    var a;
    if (a = this._findActor(id)) {
      a.setRenderMode(mode);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor opacity using handle, fails with false
   *
   * @param [Number] id
   * @param [Number opacity
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setOpacity = function(id, opacity) {
    var a;
    if (isNaN(opacity)) {
      return false;
    }
    opacity = Number(opacity);
    if (opacity > 1.0) {
      opacity = 1.0;
    }
    if (opacity < 0.0) {
      opacity = 0.0;
    }
    if (a = this._findActor(id)) {
      a.setOpacity(opacity);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor visible using handle, fails with false
   *
   * @param [Number] id
   * @param [Boolean] visible
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setVisible = function(id, visible) {
    var a;
    if (a = this._findActor(id)) {
      a.setVisible(visible);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor position using handle, fails with false
   *
   * @param [Number] id
   * @param [Object] position
   * @option position [Number] x x coordinate
   * @option position [Number] y y coordinate
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPosition = function(id, position) {
    var a;
    if (a = this._findActor(id)) {
      a.setPosition(position);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor rotation using handle, fails with false
   *
   * @param [Number] id
   * @param [Number] angle in degrees or radians
   * @param [Boolean] radians defaults to false
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRotation = function(id, angle, radians) {
    var a;
    if (a = this._findActor(id)) {
      a.setRotation(angle, !!radians);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor color using handle, fails with false
   *
   * @param [Number] id
   * @param [Object] color
   * @option color [Number] r red component
   * @option color [Number] g green component
   * @option color [Number] b blue component
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setColor = function(id, color) {
    var a;
    if (a = this._findActor(id)) {
      a.setColor(color);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor texture by texture handle. Expects the texture to already be
   * loaded by the asset system!
   *
   * @param [Number] id
   * @param [String] name
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setTexture = function(id, name) {
    var a;
    if (a = this._findActor(id)) {
      a.setTexture(name);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor texture repeat
   *
   * @param [Number] id
   * @param [Object] repeat
   * @option repeat [Number] x horizontal repeat
   * @option repeat [Number] y vertical repeat (default 1)
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setTextureRepeat = function(id, repeat) {
    var a;
    if (a = this._findActor(id)) {
      a.setTextureRepeat(repeat.x, repeat.y);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Creates the internal physics body, if one does not already exist
   * Fails with false
   *
   * @param [Number] id
   * @param [Number] mass 0.0 - unbound
   * @param [Number] friction 0.0 - 1.0
   * @param [Number] elasticity 0.0 - 1.0
   * @return [Boolean] success
   */

  AREActorInterface.prototype.createPhysicsBody = function(id, mass, friction, elasticity) {
    var a;
    if (a = this._findActor(id)) {
      a.createPhysicsBody(mass, friction, elasticity);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Destroys the physics body if one exists, fails with false
   *
   * @param [Number] id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.destroyPhysicsBody = function(id) {
    var a;
    if (a = this._findActor(id)) {
      a.destroyPhysicsBody();
      return true;
    } else {
      return false;
    }
  };

  AREActorInterface.prototype.enable2DMode = function(id) {
    return false;
  };

  AREActorInterface.prototype.disable2DMode = function(id) {
    return false;
  };

  AREActorInterface.prototype.is2DModeEnabled = function(id) {
    return false;
  };

  AREActorInterface.prototype.create3DActor = function(verts) {
    return false;
  };

  AREActorInterface.prototype.beginActorBatch = function() {
    return false;
  };

  AREActorInterface.prototype.endActorBatch = function() {
    return false;
  };

  AREActorInterface.prototype.set2DRotation = function(id, angle) {
    return false;
  };

  AREActorInterface.prototype.rotateInto2DPlane = function(id) {
    return false;
  };

  AREActorInterface.prototype.clearTexture = function(id) {
    return false;
  };

  AREActorInterface.prototype.set2DVertices = function(id, verts) {
    return false;
  };

  AREActorInterface.prototype.setTextureCoords = function(id, coords) {
    return false;
  };

  AREActorInterface.prototype.getTextureCoords = function(id) {
    return null;
  };

  AREActorInterface.prototype.get2DRotation = function(id) {
    return null;
  };

  AREActorInterface.prototype.getAABB = function(id) {
    return null;
  };

  AREActorInterface.prototype.destroy = function(id) {
    return false;
  };

  AREActorInterface.prototype.setAttachment = function(id, attachment) {
    return false;
  };

  AREActorInterface.prototype.setAttachmentOffset = function(id, offset) {
    return false;
  };

  AREActorInterface.prototype.setAttachmentRotation = function(id, rotation) {
    return false;
  };

  AREActorInterface.prototype.getAttachmentID = function(id) {
    return null;
  };

  AREActorInterface.prototype.getAttachmentVisibility = function(id) {
    return null;
  };

  AREActorInterface.prototype.getAttachmentOffset = function(id) {
    return null;
  };

  AREActorInterface.prototype.getAttachmentRotation = function(id) {
    return null;
  };

  return AREActorInterface;

})();


/*
 * Calculates the next power of 2 number from (x)
 * @param [Number] x
 */

nextHighestPowerOfTwo = function(x) {
  var i;
  --x;
  i = 1;
  while (i < 32) {
    x = x | x >> i;
    i <<= 1;
  }
  return x + 1;
};

AREEngineInterface = (function() {
  function AREEngineInterface(_masterInterface) {
    this._masterInterface = _masterInterface;
  }


  /*
   * Initialize the engine
   *
   * @param [Number] width
   * @param [Number] height
   * @param [Method] ad function to call to create ad
   * @param [Number] log loglevel, defaults to 1
   * @param [String] id id of element to instantiate on
   */

  AREEngineInterface.prototype.initialize = function(width, height, ad, log, id) {
    if (isNaN(log)) {
      log = 4;
    }
    id || (id = "");
    if (this._engine) {
      ARELog.warn("Re-initialize attempt, ignoring and passing through");
      return ad(this._engine);
    }

    /*
     * Should WGL textures be flipped by their Y axis?
     * NOTE. This does not affect existing textures.
     */
    this.wglFlipTextureY = true;
    this._engine = new ARE(width, height, (function(_this) {
      return function() {
        return ad(_this._engine);
      };
    })(this), log, id);
    this._masterInterface.setEngine(this._engine);
    this._renderer = this._engine.getRenderer();
    return this._engine;
  };


  /*
   * Set global render mode
   *   @see ARERenderer.RENDERER_MODE_*
   *
   * This is a special method only we implement; as such, any libraries
   * interfacing with us should check for the existence of the method before
   * calling it!
   */

  AREEngineInterface.prototype.getRendererMode = function() {
    return this._renderer.getActiveRendererMode();
  };


  /*
   * Set engine clear color
   *
   * @param [Object] color
   * @option color [Number] r red component
   * @option color [Number] g green component
   * @option color [Number] b blue component
   */

  AREEngineInterface.prototype.setClearColor = function(color) {
    if (!this._renderer) {
      return;
    }
    return this._renderer.setClearColor(color.r, color.g, color.b);
  };


  /*
   * Get engine clear color
   *
   * @return [Object] color {r, g, b}
   */

  AREEngineInterface.prototype.getClearColor = function() {
    var col;
    if (!this._renderer) {
      return;
    }
    col = this._renderer.getClearColor();
    return {
      r: col.getR(),
      g: col.getG(),
      b: col.getB()
    };
  };


  /*
   * Set log level
   *
   * @param [Number] level 0-4
   */

  AREEngineInterface.prototype.setLogLevel = function(level) {
    level = Number(level);
    if (isNaN(level)) {
      return ARELog.warn("Log level is NaN");
    }
    level = Math.round(level);
    if (level < 0) {
      level = 0;
    }
    if (level > 4) {
      level = 4;
    }
    return ARELog.level = level;
  };


  /*
   * Get the engine log level
   *
   * @return [Number] level
   */

  AREEngineInterface.prototype.getLogLevel = function() {
    return ARELog.level;
  };


  /*
   * Set camera center position with an object. Leaving out a component leaves it
   * unchanged.
   *
   * @param [Object] position
   * @option position [Number] x x component
   * @option position [Number] y y component
   */

  AREEngineInterface.prototype.setCameraPosition = function(position) {
    var currentPosition;
    currentPosition = this._renderer.getCameraPosition();
    if (position.x !== void 0) {
      currentPosition.x = position.x;
    }
    if (position.y !== void 0) {
      currentPosition.y = position.y;
    }
    return this._renderer.setCameraPosition(currentPosition);
  };


  /*
   * Fetch camera position as an object
   *
   * @return [Object] position {x, y}
   */

  AREEngineInterface.prototype.getCameraPosition = function() {
    return this._renderer.getCameraPosition();
  };


  /*
   * Return our engine's width
   *
   * @return [Number] width
   */

  AREEngineInterface.prototype.getWidth = function() {
    if (!this._renderer) {
      return -1;
    }
    return this._renderer.getWidth();
  };


  /*
   * Return our engine's height
   *
   * @return [Number] height
   */

  AREEngineInterface.prototype.getHeight = function() {
    if (!this._renderer) {
      return -1;
    }
    return this._renderer.getHeight();
  };


  /*
   * Enable/disable benchmarking.
   *
   * NOTE: This is a special method that only we have.
   *
   * @param [Boolean] benchmark
   */

  AREEngineInterface.prototype.setBenchmark = function(status) {
    if (!this._engine) {
      return;
    }
    this._engine.benchmark = status;
    return window.AREMessages.broadcast({
      value: status
    }, "physics.benchmark.set");
  };


  /*
   * Get the NRAID version string that this ad engine supports. It is implied
   * that we are backwards compatible with all previous versions.
   *
   * @return [String] version
   */

  AREEngineInterface.prototype.getNRAIDVersion = function() {
    return "1.0.0,freestanding";
  };


  /*
   * Fetch meta data as defined in loaded manifest
   *
   * @return [Object] meta
   */

  AREEngineInterface.prototype.getMetaData = function() {
    return this._metaData;
  };


  /*
   * Load a package.json manifest, assume texture paths are relative to our
   * own.
   *
   * As we are a browser engine built for the desktop, and therefore don't
   * support mobile device features like orientation, or need to load files off
   * the disk, we only support a subset of the NRAID creative manifest.
   *
   * @param [Object] manifest
   * @option manifest [String] version NRAID version string
   * @option manifest [Object] meta
   * @option manifest [Array<Object>] textures
   * @param [Method] cb callback to call once the load completes (textures)
   */

  AREEngineInterface.prototype.loadManifest = function(manifest, cb) {
    if (!manifest.version) {
      throw new Error("No manifest version provided!");
    }
    if (manifest.version.split(",")[0] > this.getNRAIDVersion().split(",")[0]) {
      throw new Error("Unsupported NRAID version");
    }
    this._metaData = manifest.meta;
    if (manifest.textures) {
      return async.each(manifest.textures, (function(_this) {
        return function(tex, done) {
          return _this.loadTexture(tex, function() {
            return done();
          }, _this.wglFlipTextureY);
        };
      })(this), cb);
    } else {
      return cb();
    }
  };


  /*
   * Loads a texture, and adds it to our renderer
   *
   * @param [Object] textureDef Texture definition object, NRAID-compatible
   * @param [Method] cb called when texture is loaded
   * @param [Boolean] flipTexture optional
   */

  AREEngineInterface.prototype.loadTexture = function(textureDef, cb, flipTexture) {
    var gl, img, tex;
    if (typeof flipTexture !== "boolean") {
      flipTexture = this.wglFlipTextureY;
    }
    if (!!textureDef.atlas) {
      throw new Error("This version of ARE does not support atlas loading!");
    }
    img = new Image();
    img.crossOrigin = "anonymous";
    gl = this._renderer.getGL();
    tex = null;
    if (this._renderer.isWGLRendererActive()) {
      tex = gl.createTexture();
      img.onload = (function(_this) {
        return function() {
          var canvas, ctx, h_NPOT, scaleX, scaleY, w_NPOT;
          ARELog.info("Loading GL tex: " + textureDef.name + ", " + textureDef.file);
          scaleX = 1;
          scaleY = 1;
          w_NPOT = (img.width & (img.width - 1)) !== 0;
          h_NPOT = (img.height & (img.height - 1)) !== 0;
          if (w_NPOT || h_NPOT) {
            canvas = document.createElement("canvas");
            canvas.width = nextHighestPowerOfTwo(img.width);
            canvas.height = nextHighestPowerOfTwo(img.height);
            scaleX = img.width / canvas.width;
            scaleY = img.height / canvas.height;
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            img = canvas;
          }
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.bindTexture(gl.TEXTURE_2D, null);
          _this._renderer.addTexture({
            name: textureDef.name,
            texture: tex,
            width: img.width,
            height: img.height,
            scaleX: scaleX,
            scaleY: scaleY
          });
          if (cb) {
            return cb();
          }
        };
      })(this);
    } else {
      img.onload = (function(_this) {
        return function() {
          ARELog.info("Loading canvas tex: " + textureDef.name + ", " + textureDef.file);
          _this._renderer.addTexture({
            name: textureDef.name,
            texture: img,
            width: img.width,
            height: img.height
          });
          if (cb) {
            return cb();
          }
        };
      })(this);
    }
    return img.src = textureDef.file;
  };


  /*
   * Get renderer texture size by name
   *
   * @param [String] name
   * @param [Object] size
   */

  AREEngineInterface.prototype.getTextureSize = function(name) {
    return this._renderer.getTextureSize(name);
  };

  return AREEngineInterface;

})();

AREAnimationInterface = (function() {
  AREAnimationInterface._animationMap = {
    "position": AREBezAnimation,
    "color": AREBezAnimation,
    "rotation": AREBezAnimation,
    "mass": AREPsyxAnimation,
    "friction": AREPsyxAnimation,
    "elasticity": AREPsyxAnimation,
    "physics": AREPsyxAnimation,
    "vertices": AREVertAnimation
  };

  function AREAnimationInterface(masterInterface) {}

  AREAnimationInterface.prototype.setEngine = function(engine) {
    return this._renderer = engine.getRenderer();
  };

  AREAnimationInterface.prototype.canAnimate = function(property) {
    return !!AREAnimationInterface._animationMap[property];
  };

  AREAnimationInterface.prototype.getAnimationName = function(property) {
    if (!AREAnimationInterface._animationMap[property]) {
      return false;
    } else {
      switch (AREAnimationInterface._animationMap[property]) {
        case AREBezAnimation:
          return "bezier";
        case AREPsyxAnimation:
          return "psyx";
        case AREVertAnimation:
          return "vert";
        default:
          return false;
      }
    }
  };

  AREAnimationInterface.prototype.animate = function(actorID, property, options) {
    var a, actor, name, _i, _len, _ref, _spawnAnim;
    options.start || (options.start = 0);
    actor = null;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === actorID) {
        actor = a;
        break;
      }
    }
    if (actor === null) {
      throw new Error("Actor not found, can't animate! " + actorId);
    }
    name = property[0];
    if (options.property === void 0) {
      options.property = property;
    }
    _spawnAnim = function(_n, _a, _o) {
      if (AREAnimationInterface._animationMap[_n] === AREBezAnimation) {
        return new AREBezAnimation(_a, _o).animate();
      } else if (AREAnimationInterface._animationMap[_n] === AREPsyxAnimation) {
        return new AREPsyxAnimation(_a, _o).animate();
      } else if (AREAnimationInterface._animationMap[_n] === AREVertAnimation) {
        return new AREVertAnimation(_a, _o).animate();
      } else {
        return ARELog.warn("Unrecognized property: " + _n);
      }
    };
    if (options.start > 0) {
      return setTimeout((function() {
        return _spawnAnim(name, actor, options);
      }), options.start);
    } else {
      return _spawnAnim(name, actor, options);
    }
  };

  AREAnimationInterface.prototype.preCalculateBez = function(options) {
    options.controlPoints || (options.controlPoints = 0);
    options.fps || (options.fps = 30);
    return new AREBezAnimation(null, options, true).preCalculate();
  };

  return AREAnimationInterface;

})();

AREInterface = (function() {
  function AREInterface() {
    this._Actors = new AREActorInterface(this);
    this._Engine = new AREEngineInterface(this);
    this._Animations = new AREAnimationInterface(this);
  }

  AREInterface.prototype.Actors = function() {
    return this._Actors;
  };

  AREInterface.prototype.Engine = function() {
    return this._Engine;
  };

  AREInterface.prototype.Animations = function() {
    return this._Animations;
  };

  AREInterface.prototype.setEngine = function(engine) {
    this._Actors.setEngine(engine);
    return this._Animations.setEngine(engine);
  };

  return AREInterface;

})();

ARE = (function() {
  ARE.config = {
    physics: true,
    deps: {
      physics: {
        chipmunk: "/components/chipmunk/cp.js",
        physics_worker: "/lib/physics/worker.js"
      }
    }
  };

  ARE.Version = {
    MAJOR: 1,
    MINOR: 5,
    PATCH: 1,
    BUILD: null,
    STRING: "1.5.1"
  };


  /*
   * Instantiates the engine, starting the render loop and physics handler.
   * Further useage should happen through the interface layer, either manually
   * or with the aid of AJS.
   *
   * After instantiation, the cb is called with ourselves as an argument
   *
   * Checks for dependencies and bails early if all are not found.
   *
   * @param [Number] width optional width to pass to the canvas
   * @param [Number] height optional height to pass to the canvas
   * @param [Method] cb callback to execute when finished initializing
   * @param [Number] logLevel level to start ARELog at, defaults to 4
   * @param [String] canvas optional canvas selector to initalize the renderer
   */

  function ARE(width, height, cb, logLevel, canvas) {
    if (isNaN(logLevel)) {
      logLevel = 4;
    }
    ARELog.level = logLevel;
    canvas || (canvas = "");
    this._renderIntervalId = null;
    this._currentlyRendering = false;
    this.benchmark = false;
    this.setFPS(60);
    if (window._ === null || window._ === void 0) {
      return ARELog.error("Underscore.js is not present!");
    }
    this._renderer = new ARERenderer({
      canvasId: canvas,
      width: width,
      height: height
    });
    if (ARE.config.physics) {

      /*
       * We expose the physics manager to the window, so actors can directly
       * communicate with it
       */
      this._physics = new PhysicsManager(this._renderer, ARE.config.deps.physics, (function(_this) {
        return function() {
          _this.startRendering();
          return cb(_this);
        };
      })(this));
      window.AREPhysicsManager = this._physics;
    } else {
      ARELog.info("Proceeding without physics...");
      setTimeout((function(_this) {
        return function() {
          _this.startRendering();
          return cb(_this);
        };
      })(this));
    }
    this;
  }


  /*
   * Get our internal ARERenderer instance
   *
   * @return [ARERenderer] renderer
   */

  ARE.prototype.getRenderer = function() {
    return this._renderer;
  };


  /*
   * Set framerate as an FPS figure
   * @param [Number] fps
   * @return [self]
   */

  ARE.prototype.setFPS = function(fps) {
    this._framerate = 1.0 / fps;
    return this;
  };


  /*
   * Start render loop if it isn't already running
   */

  ARE.prototype.startRendering = function() {
    var render, renderer;
    if (this._currentlyRendering) {
      return;
    }
    this._currentlyRendering = true;
    ARELog.info("Starting render loop");
    renderer = this._renderer;
    render = function() {
      renderer.update();
      renderer.render();
      return window.requestAnimationFrame(render);
    };
    return window.requestAnimationFrame(render);
  };


  /*
   * Check if the render loop is currently running
   *
   * @return [Boolean] rendering
   */

  ARE.prototype.isRendering = function() {
    return this._currentlyRendering;
  };


  /*
   * Set renderer clear color in integer RGB form (passes through to renderer)
   *
   * @param [Number] r
   * @param [Number] g
   * @param [Number] b
   * @return [self]
   */

  ARE.prototype.setClearColor = function(r, g, b) {
    r || (r = 0);
    g || (g = 0);
    b || (b = 0);
    if (this._renderer) {
      this._renderer.setClearColor(r, g, b);
    }
    return this;
  };


  /*
   * Get clear color from renderer (if active, null otherwise)
   *
   * @return [AREColor3] color
   */

  ARE.prototype.getClearColor = function() {
    if (this._renderer) {
      return this._renderer.getClearColor();
    } else {
      return null;
    }
  };


  /*
   * Return our internal renderer width
   *
   * @return [Number] width
   */

  ARE.prototype.getWidth = function() {
    return this._renderer.getWidth();
  };


  /*
   * Return our internal renderer height
   *
   * @return [Number] height
   */

  ARE.prototype.getHeight = function() {
    return this._renderer.getHeight();
  };


  /*
   * Request a pick render, passed straight to the renderer
   *
   * @param [FrameBuffer] buffer
   * @param [Method] cb cb to call post-render
   */

  ARE.prototype.requestPickingRenderWGL = function(buffer, cb) {
    if (this._renderer.isWGLRendererActive()) {
      return this._renderer.requestPickingRenderWGL(buffer, cb);
    } else {
      return ARELog.warn("WebGL renderer available for WebGL pick!");
    }
  };


  /*
   * Request a pick render, passed straight to the renderer
   *
   * -param [FrameBuffer] buffer
   * @param [Method] cb cb to call post-render
   */

  ARE.prototype.requestPickingRenderCanvas = function(selectionRect, cb) {
    if (this._renderer.isCanvasRendererActive()) {
      return this._renderer.requestPickingRenderCanvas(selectionRect, cb);
    } else {
      return ARELog.warn("Canvas renderer available for canvas pick!");
    }
  };

  return ARE;

})();

window.AdefyGLI = window.AdefyRE = new AREInterface;

//# sourceMappingURL=are.js.map
