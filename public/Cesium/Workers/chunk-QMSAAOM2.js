/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.112
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import{c as Z}from"./chunk-IVTPODG2.js";import{a as o,b as ft,d as b}from"./chunk-V624RX7A.js";import{a as R}from"./chunk-VZ2RFJ3P.js";import{a as H}from"./chunk-RKPKWH3Z.js";import{a as w,b as et}from"./chunk-BIYNNQRQ.js";import{e as g}from"./chunk-ZLUSVROX.js";var nt={};nt.computeDiscriminant=function(t,e,r){if(typeof t!="number")throw new w("a is a required number.");if(typeof e!="number")throw new w("b is a required number.");if(typeof r!="number")throw new w("c is a required number.");return e*e-4*t*r};function mt(t,e,r){let n=t+e;return R.sign(t)!==R.sign(e)&&Math.abs(n/Math.max(Math.abs(t),Math.abs(e)))<r?0:n}nt.computeRealRoots=function(t,e,r){if(typeof t!="number")throw new w("a is a required number.");if(typeof e!="number")throw new w("b is a required number.");if(typeof r!="number")throw new w("c is a required number.");let n;if(t===0)return e===0?[]:[-r/e];if(e===0){if(r===0)return[0,0];let a=Math.abs(r),f=Math.abs(t);if(a<f&&a/f<R.EPSILON14)return[0,0];if(a>f&&f/a<R.EPSILON14)return[];if(n=-r/t,n<0)return[];let l=Math.sqrt(n);return[-l,l]}else if(r===0)return n=-e/t,n<0?[n,0]:[0,n];let i=e*e,c=4*t*r,s=mt(i,-c,R.EPSILON14);if(s<0)return[];let u=-.5*mt(e,R.sign(e)*Math.sqrt(s),R.EPSILON14);return e>0?[u/t,r/u]:[r/u,u/t]};var T=nt;var ot={};ot.computeDiscriminant=function(t,e,r,n){if(typeof t!="number")throw new w("a is a required number.");if(typeof e!="number")throw new w("b is a required number.");if(typeof r!="number")throw new w("c is a required number.");if(typeof n!="number")throw new w("d is a required number.");let i=t*t,c=e*e,s=r*r,u=n*n;return 18*t*e*r*n+c*s-27*i*u-4*(t*s*r+c*e*n)};function rt(t,e,r,n){let i=t,c=e/3,s=r/3,u=n,a=i*s,f=c*u,l=c*c,d=s*s,p=i*s-l,q=i*u-c*s,m=c*u-d,h=4*p*m-q*q,C,D;if(h<0){let X,k,G;l*f>=a*d?(X=i,k=p,G=-2*c*p+i*q):(X=u,k=m,G=-u*q+2*s*m);let at=-(G<0?-1:1)*Math.abs(X)*Math.sqrt(-h);D=-G+at;let $=D/2,j=$<0?-Math.pow(-$,1/3):Math.pow($,1/3),tt=D===at?-j:-k/j;return C=k<=0?j+tt:-G/(j*j+tt*tt+k),l*f>=a*d?[(C-c)/i]:[-u/(C+s)]}let W=p,V=-2*c*p+i*q,L=m,B=-u*q+2*s*m,I=Math.sqrt(h),E=Math.sqrt(3)/2,P=Math.abs(Math.atan2(i*I,-V)/3);C=2*Math.sqrt(-W);let y=Math.cos(P);D=C*y;let S=C*(-y/2-E*Math.sin(P)),M=D+S>2*c?D-c:S-c,N=i,x=M/N;P=Math.abs(Math.atan2(u*I,-B)/3),C=2*Math.sqrt(-L),y=Math.cos(P),D=C*y,S=C*(-y/2-E*Math.sin(P));let _=-u,A=D+S<2*s?D+s:S+s,v=_/A,yt=N*A,ut=-M*A-N*_,bt=M*_,U=(s*ut-c*bt)/(-c*ut+s*yt);return x<=U?x<=v?U<=v?[x,U,v]:[x,v,U]:[v,x,U]:x<=v?[U,x,v]:U<=v?[U,v,x]:[v,U,x]}ot.computeRealRoots=function(t,e,r,n){if(typeof t!="number")throw new w("a is a required number.");if(typeof e!="number")throw new w("b is a required number.");if(typeof r!="number")throw new w("c is a required number.");if(typeof n!="number")throw new w("d is a required number.");let i,c;if(t===0)return T.computeRealRoots(e,r,n);if(e===0){if(r===0){if(n===0)return[0,0,0];c=-n/t;let s=c<0?-Math.pow(-c,1/3):Math.pow(c,1/3);return[s,s,s]}else if(n===0)return i=T.computeRealRoots(t,0,r),i.Length===0?[0]:[i[0],0,i[1]];return rt(t,0,r,n)}else{if(r===0)return n===0?(c=-e/t,c<0?[c,0,0]:[0,0,c]):rt(t,e,0,n);if(n===0)return i=T.computeRealRoots(t,e,r),i.length===0?[0]:i[1]<=0?[i[0],i[1],0]:i[0]>=0?[0,i[0],i[1]]:[i[0],0,i[1]]}return rt(t,e,r,n)};var F=ot;var it={};it.computeDiscriminant=function(t,e,r,n,i){if(typeof t!="number")throw new w("a is a required number.");if(typeof e!="number")throw new w("b is a required number.");if(typeof r!="number")throw new w("c is a required number.");if(typeof n!="number")throw new w("d is a required number.");if(typeof i!="number")throw new w("e is a required number.");let c=t*t,s=c*t,u=e*e,a=u*e,f=r*r,l=f*r,d=n*n,p=d*n,q=i*i,m=q*i;return u*f*d-4*a*p-4*t*l*d+18*t*e*r*p-27*c*d*d+256*s*m+i*(18*a*r*n-4*u*l+16*t*f*f-80*t*e*f*n-6*t*u*d+144*c*r*d)+q*(144*t*u*r-27*u*u-128*c*f-192*c*e*n)};function z(t,e,r,n){let i=t*t,c=e-3*i/8,s=r-e*t/2+i*t/8,u=n-r*t/4+e*i/16-3*i*i/256,a=F.computeRealRoots(1,2*c,c*c-4*u,-s*s);if(a.length>0){let f=-t/4,l=a[a.length-1];if(Math.abs(l)<R.EPSILON14){let d=T.computeRealRoots(1,c,u);if(d.length===2){let p=d[0],q=d[1],m;if(p>=0&&q>=0){let h=Math.sqrt(p),C=Math.sqrt(q);return[f-C,f-h,f+h,f+C]}else{if(p>=0&&q<0)return m=Math.sqrt(p),[f-m,f+m];if(p<0&&q>=0)return m=Math.sqrt(q),[f-m,f+m]}}return[]}else if(l>0){let d=Math.sqrt(l),p=(c+l-s/d)/2,q=(c+l+s/d)/2,m=T.computeRealRoots(1,d,p),h=T.computeRealRoots(1,-d,q);return m.length!==0?(m[0]+=f,m[1]+=f,h.length!==0?(h[0]+=f,h[1]+=f,m[1]<=h[0]?[m[0],m[1],h[0],h[1]]:h[1]<=m[0]?[h[0],h[1],m[0],m[1]]:m[0]>=h[0]&&m[1]<=h[1]?[h[0],m[0],m[1],h[1]]:h[0]>=m[0]&&h[1]<=m[1]?[m[0],h[0],h[1],m[1]]:m[0]>h[0]&&m[0]<h[1]?[h[0],m[0],h[1],m[1]]:[m[0],h[0],m[1],h[1]]):m):h.length!==0?(h[0]+=f,h[1]+=f,h):[]}}return[]}function Y(t,e,r,n){let i=r*r,c=e*e,s=t*t,u=-2*e,a=r*t+c-4*n,f=s*n-r*e*t+i,l=F.computeRealRoots(1,u,a,f);if(l.length>0){let d=l[0],p=e-d,q=p*p,m=t/2,h=p/2,C=q-4*n,D=q+4*Math.abs(n),W=s-4*d,V=s+4*Math.abs(d),L,B;if(d<0||C*V<W*D){let N=Math.sqrt(W);L=N/2,B=N===0?0:(t*h-r)/N}else{let N=Math.sqrt(C);L=N===0?0:(t*h-r)/N,B=N/2}let I,E;m===0&&L===0?(I=0,E=0):R.sign(m)===R.sign(L)?(I=m+L,E=d/I):(E=m-L,I=d/E);let P,y;h===0&&B===0?(P=0,y=0):R.sign(h)===R.sign(B)?(P=h+B,y=n/P):(y=h-B,P=n/y);let S=T.computeRealRoots(1,I,P),M=T.computeRealRoots(1,E,y);if(S.length!==0)return M.length!==0?S[1]<=M[0]?[S[0],S[1],M[0],M[1]]:M[1]<=S[0]?[M[0],M[1],S[0],S[1]]:S[0]>=M[0]&&S[1]<=M[1]?[M[0],S[0],S[1],M[1]]:M[0]>=S[0]&&M[1]<=S[1]?[S[0],M[0],M[1],S[1]]:S[0]>M[0]&&S[0]<M[1]?[M[0],S[0],M[1],S[1]]:[S[0],M[0],S[1],M[1]]:S;if(M.length!==0)return M}return[]}it.computeRealRoots=function(t,e,r,n,i){if(typeof t!="number")throw new w("a is a required number.");if(typeof e!="number")throw new w("b is a required number.");if(typeof r!="number")throw new w("c is a required number.");if(typeof n!="number")throw new w("d is a required number.");if(typeof i!="number")throw new w("e is a required number.");if(Math.abs(t)<R.EPSILON15)return F.computeRealRoots(e,r,n,i);let c=e/t,s=r/t,u=n/t,a=i/t,f=c<0?1:0;switch(f+=s<0?f+1:f,f+=u<0?f+1:f,f+=a<0?f+1:f,f){case 0:return z(c,s,u,a);case 1:return Y(c,s,u,a);case 2:return Y(c,s,u,a);case 3:return z(c,s,u,a);case 4:return z(c,s,u,a);case 5:return Y(c,s,u,a);case 6:return z(c,s,u,a);case 7:return z(c,s,u,a);case 8:return Y(c,s,u,a);case 9:return z(c,s,u,a);case 10:return z(c,s,u,a);case 11:return Y(c,s,u,a);case 12:return z(c,s,u,a);case 13:return z(c,s,u,a);case 14:return z(c,s,u,a);case 15:return z(c,s,u,a);default:return}};var dt=it;function J(t,e){e=o.clone(H(e,o.ZERO)),o.equals(e,o.ZERO)||o.normalize(e,e),this.origin=o.clone(H(t,o.ZERO)),this.direction=e}J.clone=function(t,e){if(g(t))return g(e)?(e.origin=o.clone(t.origin),e.direction=o.clone(t.direction),e):new J(t.origin,t.direction)};J.getPoint=function(t,e,r){return et.typeOf.object("ray",t),et.typeOf.number("t",e),g(r)||(r=new o),r=o.multiplyByScalar(t.direction,e,r),o.add(t.origin,r,r)};var st=J;var O={};O.rayPlane=function(t,e,r){if(!g(t))throw new w("ray is required.");if(!g(e))throw new w("plane is required.");g(r)||(r=new o);let n=t.origin,i=t.direction,c=e.normal,s=o.dot(c,i);if(Math.abs(s)<R.EPSILON15)return;let u=(-e.distance-o.dot(c,n))/s;if(!(u<0))return r=o.multiplyByScalar(i,u,r),o.add(n,r,r)};var Ot=new o,Pt=new o,Mt=new o,lt=new o,ht=new o;O.rayTriangleParametric=function(t,e,r,n,i){if(!g(t))throw new w("ray is required.");if(!g(e))throw new w("p0 is required.");if(!g(r))throw new w("p1 is required.");if(!g(n))throw new w("p2 is required.");i=H(i,!1);let c=t.origin,s=t.direction,u=o.subtract(r,e,Ot),a=o.subtract(n,e,Pt),f=o.cross(s,a,Mt),l=o.dot(u,f),d,p,q,m,h;if(i){if(l<R.EPSILON6||(d=o.subtract(c,e,lt),q=o.dot(d,f),q<0||q>l)||(p=o.cross(d,u,ht),m=o.dot(s,p),m<0||q+m>l))return;h=o.dot(a,p)/l}else{if(Math.abs(l)<R.EPSILON6)return;let C=1/l;if(d=o.subtract(c,e,lt),q=o.dot(d,f)*C,q<0||q>1||(p=o.cross(d,u,ht),m=o.dot(s,p)*C,m<0||q+m>1))return;h=o.dot(a,p)*C}return h};O.rayTriangle=function(t,e,r,n,i,c){let s=O.rayTriangleParametric(t,e,r,n,i);if(!(!g(s)||s<0))return g(c)||(c=new o),o.multiplyByScalar(t.direction,s,c),o.add(t.origin,c,c)};var Ct=new st;O.lineSegmentTriangle=function(t,e,r,n,i,c,s){if(!g(t))throw new w("v0 is required.");if(!g(e))throw new w("v1 is required.");if(!g(r))throw new w("p0 is required.");if(!g(n))throw new w("p1 is required.");if(!g(i))throw new w("p2 is required.");let u=Ct;o.clone(t,u.origin),o.subtract(e,t,u.direction),o.normalize(u.direction,u.direction);let a=O.rayTriangleParametric(u,r,n,i,c);if(!(!g(a)||a<0||a>o.distance(t,e)))return g(s)||(s=new o),o.multiplyByScalar(u.direction,a,s),o.add(u.origin,s,s)};function Et(t,e,r,n){let i=e*e-4*t*r;if(i<0)return;if(i>0){let s=1/(2*t),u=Math.sqrt(i),a=(-e+u)*s,f=(-e-u)*s;return a<f?(n.root0=a,n.root1=f):(n.root0=f,n.root1=a),n}let c=-e/(2*t);if(c!==0)return n.root0=n.root1=c,n}var Nt={root0:0,root1:0};function Rt(t,e,r){g(r)||(r=new Z);let n=t.origin,i=t.direction,c=e.center,s=e.radius*e.radius,u=o.subtract(n,c,Mt),a=o.dot(i,i),f=2*o.dot(i,u),l=o.magnitudeSquared(u)-s,d=Et(a,f,l,Nt);if(g(d))return r.start=d.root0,r.stop=d.root1,r}O.raySphere=function(t,e,r){if(!g(t))throw new w("ray is required.");if(!g(e))throw new w("sphere is required.");if(r=Rt(t,e,r),!(!g(r)||r.stop<0))return r.start=Math.max(r.start,0),r};var Lt=new st;O.lineSegmentSphere=function(t,e,r,n){if(!g(t))throw new w("p0 is required.");if(!g(e))throw new w("p1 is required.");if(!g(r))throw new w("sphere is required.");let i=Lt;o.clone(t,i.origin);let c=o.subtract(e,t,i.direction),s=o.magnitude(c);if(o.normalize(c,c),n=Rt(i,r,n),!(!g(n)||n.stop<0||n.start>s))return n.start=Math.max(n.start,0),n.stop=Math.min(n.stop,s),n};var It=new o,Dt=new o;O.rayEllipsoid=function(t,e){if(!g(t))throw new w("ray is required.");if(!g(e))throw new w("ellipsoid is required.");let r=e.oneOverRadii,n=o.multiplyComponents(r,t.origin,It),i=o.multiplyComponents(r,t.direction,Dt),c=o.magnitudeSquared(n),s=o.dot(n,i),u,a,f,l,d;if(c>1){if(s>=0)return;let p=s*s;if(u=c-1,a=o.magnitudeSquared(i),f=a*u,p<f)return;if(p>f){l=s*s-f,d=-s+Math.sqrt(l);let m=d/a,h=u/d;return m<h?new Z(m,h):{start:h,stop:m}}let q=Math.sqrt(u/a);return new Z(q,q)}else if(c<1)return u=c-1,a=o.magnitudeSquared(i),f=a*u,l=s*s-f,d=-s+Math.sqrt(l),new Z(0,d/a);if(s<0)return a=o.magnitudeSquared(i),new Z(0,-s/a)};function Q(t,e,r){let n=t+e;return R.sign(t)!==R.sign(e)&&Math.abs(n/Math.max(Math.abs(t),Math.abs(e)))<r?0:n}function Bt(t,e,r,n,i){let c=n*n,s=i*i,u=(t[b.COLUMN1ROW1]-t[b.COLUMN2ROW2])*s,a=i*(n*Q(t[b.COLUMN1ROW0],t[b.COLUMN0ROW1],R.EPSILON15)+e.y),f=t[b.COLUMN0ROW0]*c+t[b.COLUMN2ROW2]*s+n*e.x+r,l=s*Q(t[b.COLUMN2ROW1],t[b.COLUMN1ROW2],R.EPSILON15),d=i*(n*Q(t[b.COLUMN2ROW0],t[b.COLUMN0ROW2])+e.z),p,q=[];if(d===0&&l===0){if(p=T.computeRealRoots(u,a,f),p.length===0)return q;let P=p[0],y=Math.sqrt(Math.max(1-P*P,0));if(q.push(new o(n,i*P,i*-y)),q.push(new o(n,i*P,i*y)),p.length===2){let S=p[1],M=Math.sqrt(Math.max(1-S*S,0));q.push(new o(n,i*S,i*-M)),q.push(new o(n,i*S,i*M))}return q}let m=d*d,h=l*l,C=u*u,D=d*l,W=C+h,V=2*(a*u+D),L=2*f*u+a*a-h+m,B=2*(f*a-D),I=f*f-m;if(W===0&&V===0&&L===0&&B===0)return q;p=dt.computeRealRoots(W,V,L,B,I);let E=p.length;if(E===0)return q;for(let P=0;P<E;++P){let y=p[P],S=y*y,M=Math.max(1-S,0),N=Math.sqrt(M),x;R.sign(u)===R.sign(f)?x=Q(u*S+f,a*y,R.EPSILON12):R.sign(f)===R.sign(a*y)?x=Q(u*S,a*y+f,R.EPSILON12):x=Q(u*S+a*y,f,R.EPSILON12);let _=Q(l*y,d,R.EPSILON15),A=x*_;A<0?q.push(new o(n,i*y,i*N)):A>0?q.push(new o(n,i*y,i*-N)):N!==0?(q.push(new o(n,i*y,i*-N)),q.push(new o(n,i*y,i*N)),++P):q.push(new o(n,i*y,i*N))}return q}var ct=new o,wt=new o,qt=new o,K=new o,xt=new o,Tt=new b,zt=new b,Wt=new b,Vt=new b,vt=new b,gt=new b,pt=new b,St=new o,Ut=new o,Qt=new ft;O.grazingAltitudeLocation=function(t,e){if(!g(t))throw new w("ray is required.");if(!g(e))throw new w("ellipsoid is required.");let r=t.origin,n=t.direction;if(!o.equals(r,o.ZERO)){let I=e.geodeticSurfaceNormal(r,ct);if(o.dot(n,I)>=0)return r}let i=g(this.rayEllipsoid(t,e)),c=e.transformPositionToScaledSpace(n,ct),s=o.normalize(c,c),u=o.mostOrthogonalAxis(c,K),a=o.normalize(o.cross(u,s,wt),wt),f=o.normalize(o.cross(s,a,qt),qt),l=Tt;l[0]=s.x,l[1]=s.y,l[2]=s.z,l[3]=a.x,l[4]=a.y,l[5]=a.z,l[6]=f.x,l[7]=f.y,l[8]=f.z;let d=b.transpose(l,zt),p=b.fromScale(e.radii,Wt),q=b.fromScale(e.oneOverRadii,Vt),m=vt;m[0]=0,m[1]=-n.z,m[2]=n.y,m[3]=n.z,m[4]=0,m[5]=-n.x,m[6]=-n.y,m[7]=n.x,m[8]=0;let h=b.multiply(b.multiply(d,q,gt),m,gt),C=b.multiply(b.multiply(h,p,pt),l,pt),D=b.multiplyByVector(h,r,xt),W=Bt(C,o.negate(D,ct),0,0,1),V,L,B=W.length;if(B>0){let I=o.clone(o.ZERO,Ut),E=Number.NEGATIVE_INFINITY;for(let y=0;y<B;++y){V=b.multiplyByVector(p,b.multiplyByVector(l,W[y],St),St);let S=o.normalize(o.subtract(V,r,K),K),M=o.dot(S,n);M>E&&(E=M,I=o.clone(V,I))}let P=e.cartesianToCartographic(I,Qt);return E=R.clamp(E,0,1),L=o.magnitude(o.subtract(I,r,K))*Math.sqrt(1-E*E),L=i?-L:L,P.height=L,e.cartographicToCartesian(P,new o)}};var At=new o;O.lineSegmentPlane=function(t,e,r,n){if(!g(t))throw new w("endPoint0 is required.");if(!g(e))throw new w("endPoint1 is required.");if(!g(r))throw new w("plane is required.");g(n)||(n=new o);let i=o.subtract(e,t,At),c=r.normal,s=o.dot(c,i);if(Math.abs(s)<R.EPSILON6)return;let u=o.dot(c,t),a=-(r.distance+u)/s;if(!(a<0||a>1))return o.multiplyByScalar(i,a,n),o.add(t,n,n),n};O.trianglePlaneIntersection=function(t,e,r,n){if(!g(t)||!g(e)||!g(r)||!g(n))throw new w("p0, p1, p2, and plane are required.");let i=n.normal,c=n.distance,s=o.dot(i,t)+c<0,u=o.dot(i,e)+c<0,a=o.dot(i,r)+c<0,f=0;f+=s?1:0,f+=u?1:0,f+=a?1:0;let l,d;if((f===1||f===2)&&(l=new o,d=new o),f===1){if(s)return O.lineSegmentPlane(t,e,n,l),O.lineSegmentPlane(t,r,n,d),{positions:[t,e,r,l,d],indices:[0,3,4,1,2,4,1,4,3]};if(u)return O.lineSegmentPlane(e,r,n,l),O.lineSegmentPlane(e,t,n,d),{positions:[t,e,r,l,d],indices:[1,3,4,2,0,4,2,4,3]};if(a)return O.lineSegmentPlane(r,t,n,l),O.lineSegmentPlane(r,e,n,d),{positions:[t,e,r,l,d],indices:[2,3,4,0,1,4,0,4,3]}}else if(f===2)if(s)if(u){if(!a)return O.lineSegmentPlane(t,r,n,l),O.lineSegmentPlane(e,r,n,d),{positions:[t,e,r,l,d],indices:[0,1,4,0,4,3,2,3,4]}}else return O.lineSegmentPlane(r,e,n,l),O.lineSegmentPlane(t,e,n,d),{positions:[t,e,r,l,d],indices:[2,0,4,2,4,3,1,3,4]};else return O.lineSegmentPlane(e,t,n,l),O.lineSegmentPlane(r,t,n,d),{positions:[t,e,r,l,d],indices:[1,2,4,1,4,3,0,3,4]}};var qe=O;export{st as a,qe as b};
