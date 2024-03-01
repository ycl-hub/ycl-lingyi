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

import{a as M}from"./chunk-6XIH6X2G.js";import{a as ht}from"./chunk-N3XJ4YXB.js";import"./chunk-RQI6QM4Q.js";import"./chunk-SAFLIIJC.js";import"./chunk-NXLA2DOI.js";import{a as _t}from"./chunk-2DNLGXTL.js";import{a as J}from"./chunk-ZLPZ2L4F.js";import"./chunk-2KIWNO2C.js";import"./chunk-KOHED3YY.js";import{b as yt}from"./chunk-UPOORNJU.js";import{a as Pt}from"./chunk-2EHQCUJI.js";import"./chunk-EOT3UPEC.js";import"./chunk-QMSAAOM2.js";import"./chunk-W5ZMPE2M.js";import{a as Nt}from"./chunk-EQ7PMEBC.js";import{a as Ct}from"./chunk-FDDSRMXI.js";import{b as Mt,c as Vt,d as x}from"./chunk-VWDXWUZZ.js";import{d as St}from"./chunk-IVTPODG2.js";import"./chunk-PQVQONHO.js";import{c as Et}from"./chunk-KDW4RGIR.js";import{a as F}from"./chunk-VNDUYYBJ.js";import{a as o,b as bt,c as I}from"./chunk-V624RX7A.js";import{a as st}from"./chunk-VZ2RFJ3P.js";import"./chunk-RN5GA5QZ.js";import"./chunk-TWC6ISJU.js";import{a as B}from"./chunk-RKPKWH3Z.js";import{b as it}from"./chunk-BIYNNQRQ.js";import{e as X}from"./chunk-ZLUSVROX.js";var zt=new o,kt=new o,wt=new o,Tt=new o,jt=new o,Ht=new o,at=new o,ft=new o;function Ut(t,e){for(let i=0;i<t.length;i++)t[i]=e.scaleToGeodeticSurface(t[i],t[i]);return t}function Z(t,e,i,l,d,f){let h=t.normals,O=t.tangents,g=t.bitangents,r=o.normalize(o.cross(i,e,at),at);f.normal&&M.addAttribute(h,e,l,d),f.tangent&&M.addAttribute(O,r,l,d),f.bitangent&&M.addAttribute(g,i,l,d)}function Bt(t,e,i){let l=t.positions,d=t.corners,f=t.endPositions,h=t.lefts,O=t.normals,g=new Ct,r,a=0,s=0,n,A=0,u;for(n=0;n<l.length;n+=2)u=l[n].length-3,a+=u,A+=u*2,s+=l[n+1].length-3;for(a+=3,s+=3,n=0;n<d.length;n++){r=d[n];let c=d[n].leftPositions;X(c)?(u=c.length,a+=u,A+=u):(u=d[n].rightPositions.length,s+=u,A+=u)}let b=X(f),p;b&&(p=f[0].length-3,a+=p,s+=p,p/=3,A+=p*6);let R=a+s,m=new Float64Array(R),C=e.normal?new Float32Array(R):void 0,D=e.tangent?new Float32Array(R):void 0,lt=e.bitangent?new Float32Array(R):void 0,z={normals:C,tangents:D,bitangents:lt},y=0,E=R-1,S,V,H,G,P=zt,w=kt,nt,ot,mt=p/2,_=Nt.createTypedArray(R/3,A),T=0;if(b){ot=wt,nt=Tt;let c=f[0];for(P=o.fromArray(O,0,P),w=o.fromArray(h,0,w),n=0;n<mt;n++)ot=o.fromArray(c,(mt-1-n)*3,ot),nt=o.fromArray(c,(mt+n)*3,nt),M.addAttribute(m,nt,y),M.addAttribute(m,ot,void 0,E),Z(z,P,w,y,E,e),V=y/3,G=V+1,S=(E-2)/3,H=S-1,_[T++]=S,_[T++]=V,_[T++]=H,_[T++]=H,_[T++]=V,_[T++]=G,y+=3,E-=3}let At=0,ut=0,rt=l[At++],q=l[At++];m.set(rt,y),m.set(q,E-q.length+1),w=o.fromArray(h,ut,w);let ct,dt;for(u=q.length-3,n=0;n<u;n+=3)ct=i.geodeticSurfaceNormal(o.fromArray(rt,n,at),at),dt=i.geodeticSurfaceNormal(o.fromArray(q,u-n,ft),ft),P=o.normalize(o.add(ct,dt,P),P),Z(z,P,w,y,E,e),V=y/3,G=V+1,S=(E-2)/3,H=S-1,_[T++]=S,_[T++]=V,_[T++]=H,_[T++]=H,_[T++]=V,_[T++]=G,y+=3,E-=3;for(ct=i.geodeticSurfaceNormal(o.fromArray(rt,u,at),at),dt=i.geodeticSurfaceNormal(o.fromArray(q,u,ft),ft),P=o.normalize(o.add(ct,dt,P),P),ut+=3,n=0;n<d.length;n++){let c;r=d[n];let $=r.leftPositions,v=r.rightPositions,L,U,N=Ht,k=wt,Y=Tt;if(P=o.fromArray(O,ut,P),X($)){for(Z(z,P,w,void 0,E,e),E-=3,L=G,U=H,c=0;c<$.length/3;c++)N=o.fromArray($,c*3,N),_[T++]=L,_[T++]=U-c-1,_[T++]=U-c,M.addAttribute(m,N,void 0,E),k=o.fromArray(m,(U-c-1)*3,k),Y=o.fromArray(m,L*3,Y),w=o.normalize(o.subtract(k,Y,w),w),Z(z,P,w,void 0,E,e),E-=3;N=o.fromArray(m,L*3,N),k=o.subtract(o.fromArray(m,U*3,k),N,k),Y=o.subtract(o.fromArray(m,(U-c)*3,Y),N,Y),w=o.normalize(o.add(k,Y,w),w),Z(z,P,w,y,void 0,e),y+=3}else{for(Z(z,P,w,y,void 0,e),y+=3,L=H,U=G,c=0;c<v.length/3;c++)N=o.fromArray(v,c*3,N),_[T++]=L,_[T++]=U+c,_[T++]=U+c+1,M.addAttribute(m,N,y),k=o.fromArray(m,L*3,k),Y=o.fromArray(m,(U+c)*3,Y),w=o.normalize(o.subtract(k,Y,w),w),Z(z,P,w,y,void 0,e),y+=3;N=o.fromArray(m,L*3,N),k=o.subtract(o.fromArray(m,(U+c)*3,k),N,k),Y=o.subtract(o.fromArray(m,U*3,Y),N,Y),w=o.normalize(o.negate(o.add(Y,k,w),w),w),Z(z,P,w,void 0,E,e),E-=3}for(rt=l[At++],q=l[At++],rt.splice(0,3),q.splice(q.length-3,3),m.set(rt,y),m.set(q,E-q.length+1),u=q.length-3,ut+=3,w=o.fromArray(h,ut,w),c=0;c<q.length;c+=3)ct=i.geodeticSurfaceNormal(o.fromArray(rt,c,at),at),dt=i.geodeticSurfaceNormal(o.fromArray(q,u-c,ft),ft),P=o.normalize(o.add(ct,dt,P),P),Z(z,P,w,y,E,e),G=y/3,V=G-1,H=(E-2)/3,S=H+1,_[T++]=S,_[T++]=V,_[T++]=H,_[T++]=H,_[T++]=V,_[T++]=G,y+=3,E-=3;y-=3,E+=3}if(P=o.fromArray(O,O.length-3,P),Z(z,P,w,y,E,e),b){y+=3,E-=3,ot=wt,nt=Tt;let c=f[1];for(n=0;n<mt;n++)ot=o.fromArray(c,(p-n-1)*3,ot),nt=o.fromArray(c,n*3,nt),M.addAttribute(m,ot,void 0,E),M.addAttribute(m,nt,y),Z(z,P,w,y,E,e),G=y/3,V=G-1,H=(E-2)/3,S=H+1,_[T++]=S,_[T++]=V,_[T++]=H,_[T++]=H,_[T++]=V,_[T++]=G,y+=3,E-=3}if(g.position=new x({componentDatatype:F.DOUBLE,componentsPerAttribute:3,values:m}),e.st){let c=new Float32Array(R/3*2),$,v,L=0;if(b){a/=3,s/=3;let U=Math.PI/(p+1);v=1/(a-p+1),$=1/(s-p+1);let N,k=p/2;for(n=k+1;n<p+1;n++)N=st.PI_OVER_TWO+U*n,c[L++]=$*(1+Math.cos(N)),c[L++]=.5*(1+Math.sin(N));for(n=1;n<s-p+1;n++)c[L++]=n*$,c[L++]=0;for(n=p;n>k;n--)N=st.PI_OVER_TWO-n*U,c[L++]=1-$*(1+Math.cos(N)),c[L++]=.5*(1+Math.sin(N));for(n=k;n>0;n--)N=st.PI_OVER_TWO-U*n,c[L++]=1-v*(1+Math.cos(N)),c[L++]=.5*(1+Math.sin(N));for(n=a-p;n>0;n--)c[L++]=n*v,c[L++]=1;for(n=1;n<k+1;n++)N=st.PI_OVER_TWO+U*n,c[L++]=v*(1+Math.cos(N)),c[L++]=.5*(1+Math.sin(N))}else{for(a/=3,s/=3,v=1/(a-1),$=1/(s-1),n=0;n<s;n++)c[L++]=n*$,c[L++]=0;for(n=a;n>0;n--)c[L++]=(n-1)*v,c[L++]=1}g.st=new x({componentDatatype:F.FLOAT,componentsPerAttribute:2,values:c})}return e.normal&&(g.normal=new x({componentDatatype:F.FLOAT,componentsPerAttribute:3,values:z.normals})),e.tangent&&(g.tangent=new x({componentDatatype:F.FLOAT,componentsPerAttribute:3,values:z.tangents})),e.bitangent&&(g.bitangent=new x({componentDatatype:F.FLOAT,componentsPerAttribute:3,values:z.bitangents})),{attributes:g,indices:_}}function qt(t,e){if(!e.normal&&!e.tangent&&!e.bitangent&&!e.st)return t;let i=t.position.values,l,d;(e.normal||e.bitangent)&&(l=t.normal.values,d=t.bitangent.values);let f=t.position.values.length/18,h=f*3,O=f*2,g=h*2,r;if(e.normal||e.bitangent||e.tangent){let a=e.normal?new Float32Array(h*6):void 0,s=e.tangent?new Float32Array(h*6):void 0,n=e.bitangent?new Float32Array(h*6):void 0,A=zt,u=kt,b=wt,p=Tt,R=jt,m=Ht,C=g;for(r=0;r<h;r+=3){let D=C+g;A=o.fromArray(i,r,A),u=o.fromArray(i,r+h,u),b=o.fromArray(i,(r+3)%h,b),u=o.subtract(u,A,u),b=o.subtract(b,A,b),p=o.normalize(o.cross(u,b,p),p),e.normal&&(M.addAttribute(a,p,D),M.addAttribute(a,p,D+3),M.addAttribute(a,p,C),M.addAttribute(a,p,C+3)),(e.tangent||e.bitangent)&&(m=o.fromArray(l,r,m),e.bitangent&&(M.addAttribute(n,m,D),M.addAttribute(n,m,D+3),M.addAttribute(n,m,C),M.addAttribute(n,m,C+3)),e.tangent&&(R=o.normalize(o.cross(m,p,R),R),M.addAttribute(s,R,D),M.addAttribute(s,R,D+3),M.addAttribute(s,R,C),M.addAttribute(s,R,C+3))),C+=6}if(e.normal){for(a.set(l),r=0;r<h;r+=3)a[r+h]=-l[r],a[r+h+1]=-l[r+1],a[r+h+2]=-l[r+2];t.normal.values=a}else t.normal=void 0;if(e.bitangent?(n.set(d),n.set(d,h),t.bitangent.values=n):t.bitangent=void 0,e.tangent){let D=t.tangent.values;s.set(D),s.set(D,h),t.tangent.values=s}}if(e.st){let a=t.st.values,s=new Float32Array(O*6);s.set(a),s.set(a,O);let n=O*2;for(let A=0;A<2;A++){for(s[n++]=a[0],s[n++]=a[1],r=2;r<O;r+=2){let u=a[r],b=a[r+1];s[n++]=u,s[n++]=b,s[n++]=u,s[n++]=b}s[n++]=a[0],s[n++]=a[1]}t.st.values=s}return t}function Ot(t,e,i){i[e++]=t[0],i[e++]=t[1],i[e++]=t[2];for(let l=3;l<t.length;l+=3){let d=t[l],f=t[l+1],h=t[l+2];i[e++]=d,i[e++]=f,i[e++]=h,i[e++]=d,i[e++]=f,i[e++]=h}return i[e++]=t[0],i[e++]=t[1],i[e++]=t[2],i}function Gt(t,e){let i=new J({position:e.position,normal:e.normal||e.bitangent||t.shadowVolume,tangent:e.tangent,bitangent:e.normal||e.bitangent,st:e.st}),l=t.ellipsoid,d=M.computePositions(t),f=Bt(d,i,l),h=t.height,O=t.extrudedHeight,g=f.attributes,r=f.indices,a=g.position.values,s=a.length,n=new Float64Array(s*6),A=new Float64Array(s);A.set(a);let u=new Float64Array(s*4);a=yt.scaleToGeodeticHeight(a,h,l),u=Ot(a,0,u),A=yt.scaleToGeodeticHeight(A,O,l),u=Ot(A,s*2,u),n.set(a),n.set(A,s),n.set(u,s*2),g.position.values=n,g=qt(g,e);let b,p=s/3;if(t.shadowVolume){let S=g.normal.values;s=S.length;let V=new Float32Array(s*6);for(b=0;b<s;b++)S[b]=-S[b];V.set(S,s),V=Ot(S,s*4,V),g.extrudeDirection=new x({componentDatatype:F.FLOAT,componentsPerAttribute:3,values:V}),e.normal||(g.normal=void 0)}if(X(t.offsetAttribute)){let S=new Uint8Array(p*6);if(t.offsetAttribute===_t.TOP)S=S.fill(1,0,p).fill(1,p*2,p*4);else{let V=t.offsetAttribute===_t.NONE?0:1;S=S.fill(V)}g.applyOffset=new x({componentDatatype:F.UNSIGNED_BYTE,componentsPerAttribute:1,values:S})}let R=r.length,m=p+p,C=Nt.createTypedArray(n.length/3,R*2+m*3);C.set(r);let D=R;for(b=0;b<R;b+=3){let S=r[b],V=r[b+1],H=r[b+2];C[D++]=H+p,C[D++]=V+p,C[D++]=S+p}let lt,z,y,E;for(b=0;b<m;b+=2)lt=b+m,z=lt+m,y=lt+1,E=z+1,C[D++]=lt,C[D++]=z,C[D++]=y,C[D++]=y,C[D++]=z,C[D++]=E;return{attributes:g,indices:C}}var Dt=new o,gt=new o,Q=new bt;function Rt(t,e,i,l,d,f){let h=o.subtract(e,t,Dt);o.normalize(h,h);let O=i.geodeticSurfaceNormal(t,gt),g=o.cross(h,O,Dt);o.multiplyByScalar(g,l,g);let r=d.latitude,a=d.longitude,s=f.latitude,n=f.longitude;o.add(t,g,gt),i.cartesianToCartographic(gt,Q);let A=Q.latitude,u=Q.longitude;r=Math.min(r,A),a=Math.min(a,u),s=Math.max(s,A),n=Math.max(n,u),o.subtract(t,g,gt),i.cartesianToCartographic(gt,Q),A=Q.latitude,u=Q.longitude,r=Math.min(r,A),a=Math.min(a,u),s=Math.max(s,A),n=Math.max(n,u),d.latitude=r,d.longitude=a,f.latitude=s,f.longitude=n}var K=new o,pt=new o,W=new bt,j=new bt;function Yt(t,e,i,l,d){t=Ut(t,e);let f=Pt(t,o.equalsEpsilon),h=f.length;if(h<2||i<=0)return new Et;let O=i*.5;W.latitude=Number.POSITIVE_INFINITY,W.longitude=Number.POSITIVE_INFINITY,j.latitude=Number.NEGATIVE_INFINITY,j.longitude=Number.NEGATIVE_INFINITY;let g,r;if(l===ht.ROUNDED){let n=f[0];o.subtract(n,f[1],K),o.normalize(K,K),o.multiplyByScalar(K,O,K),o.add(n,K,pt),e.cartesianToCartographic(pt,Q),g=Q.latitude,r=Q.longitude,W.latitude=Math.min(W.latitude,g),W.longitude=Math.min(W.longitude,r),j.latitude=Math.max(j.latitude,g),j.longitude=Math.max(j.longitude,r)}for(let n=0;n<h-1;++n)Rt(f[n],f[n+1],e,O,W,j);let a=f[h-1];o.subtract(a,f[h-2],K),o.normalize(K,K),o.multiplyByScalar(K,O,K),o.add(a,K,pt),Rt(a,pt,e,O,W,j),l===ht.ROUNDED&&(e.cartesianToCartographic(pt,Q),g=Q.latitude,r=Q.longitude,W.latitude=Math.min(W.latitude,g),W.longitude=Math.min(W.longitude,r),j.latitude=Math.max(j.latitude,g),j.longitude=Math.max(j.longitude,r));let s=X(d)?d:new Et;return s.north=j.latitude,s.south=W.latitude,s.east=j.longitude,s.west=W.longitude,s}function et(t){t=B(t,B.EMPTY_OBJECT);let e=t.positions,i=t.width;it.defined("options.positions",e),it.defined("options.width",i);let l=B(t.height,0),d=B(t.extrudedHeight,l);this._positions=e,this._ellipsoid=I.clone(B(t.ellipsoid,I.WGS84)),this._vertexFormat=J.clone(B(t.vertexFormat,J.DEFAULT)),this._width=i,this._height=Math.max(l,d),this._extrudedHeight=Math.min(l,d),this._cornerType=B(t.cornerType,ht.ROUNDED),this._granularity=B(t.granularity,st.RADIANS_PER_DEGREE),this._shadowVolume=B(t.shadowVolume,!1),this._workerName="createCorridorGeometry",this._offsetAttribute=t.offsetAttribute,this._rectangle=void 0,this.packedLength=1+e.length*o.packedLength+I.packedLength+J.packedLength+7}et.pack=function(t,e,i){it.defined("value",t),it.defined("array",e),i=B(i,0);let l=t._positions,d=l.length;e[i++]=d;for(let f=0;f<d;++f,i+=o.packedLength)o.pack(l[f],e,i);return I.pack(t._ellipsoid,e,i),i+=I.packedLength,J.pack(t._vertexFormat,e,i),i+=J.packedLength,e[i++]=t._width,e[i++]=t._height,e[i++]=t._extrudedHeight,e[i++]=t._cornerType,e[i++]=t._granularity,e[i++]=t._shadowVolume?1:0,e[i]=B(t._offsetAttribute,-1),e};var It=I.clone(I.UNIT_SPHERE),Wt=new J,tt={positions:void 0,ellipsoid:It,vertexFormat:Wt,width:void 0,height:void 0,extrudedHeight:void 0,cornerType:void 0,granularity:void 0,shadowVolume:void 0,offsetAttribute:void 0};et.unpack=function(t,e,i){it.defined("array",t),e=B(e,0);let l=t[e++],d=new Array(l);for(let u=0;u<l;++u,e+=o.packedLength)d[u]=o.unpack(t,e);let f=I.unpack(t,e,It);e+=I.packedLength;let h=J.unpack(t,e,Wt);e+=J.packedLength;let O=t[e++],g=t[e++],r=t[e++],a=t[e++],s=t[e++],n=t[e++]===1,A=t[e];return X(i)?(i._positions=d,i._ellipsoid=I.clone(f,i._ellipsoid),i._vertexFormat=J.clone(h,i._vertexFormat),i._width=O,i._height=g,i._extrudedHeight=r,i._cornerType=a,i._granularity=s,i._shadowVolume=n,i._offsetAttribute=A===-1?void 0:A,i):(tt.positions=d,tt.width=O,tt.height=g,tt.extrudedHeight=r,tt.cornerType=a,tt.granularity=s,tt.shadowVolume=n,tt.offsetAttribute=A===-1?void 0:A,new et(tt))};et.computeRectangle=function(t,e){t=B(t,B.EMPTY_OBJECT);let i=t.positions,l=t.width;it.defined("options.positions",i),it.defined("options.width",l);let d=B(t.ellipsoid,I.WGS84),f=B(t.cornerType,ht.ROUNDED);return Yt(i,d,l,f,e)};et.createGeometry=function(t){let e=t._positions,i=t._width,l=t._ellipsoid;e=Ut(e,l);let d=Pt(e,o.equalsEpsilon);if(d.length<2||i<=0)return;let f=t._height,h=t._extrudedHeight,O=!st.equalsEpsilon(f,h,0,st.EPSILON2),g=t._vertexFormat,r={ellipsoid:l,positions:d,width:i,cornerType:t._cornerType,granularity:t._granularity,saveAttributes:!0},a;if(O)r.height=f,r.extrudedHeight=h,r.shadowVolume=t._shadowVolume,r.offsetAttribute=t._offsetAttribute,a=Gt(r,g);else{let A=M.computePositions(r);if(a=Bt(A,g,l),a.attributes.position.values=yt.scaleToGeodeticHeight(a.attributes.position.values,f,l),X(t._offsetAttribute)){let u=t._offsetAttribute===_t.NONE?0:1,b=a.attributes.position.values.length,p=new Uint8Array(b/3).fill(u);a.attributes.applyOffset=new x({componentDatatype:F.UNSIGNED_BYTE,componentsPerAttribute:1,values:p})}}let s=a.attributes,n=St.fromVertices(s.position.values,void 0,3);return g.position||(a.attributes.position.values=void 0),new Vt({attributes:s,indices:a.indices,primitiveType:Mt.TRIANGLES,boundingSphere:n,offsetAttribute:t._offsetAttribute})};et.createShadowVolume=function(t,e,i){let l=t._granularity,d=t._ellipsoid,f=e(l,d),h=i(l,d);return new et({positions:t._positions,width:t._width,cornerType:t._cornerType,ellipsoid:d,granularity:l,extrudedHeight:f,height:h,vertexFormat:J.POSITION_ONLY,shadowVolume:!0})};Object.defineProperties(et.prototype,{rectangle:{get:function(){return X(this._rectangle)||(this._rectangle=Yt(this._positions,this._ellipsoid,this._width,this._cornerType)),this._rectangle}},textureCoordinateRotationPoints:{get:function(){return[0,0,0,1,1,0]}}});var Lt=et;function Jt(t,e){return X(e)&&(t=Lt.unpack(t,e)),t._ellipsoid=I.clone(t._ellipsoid),Lt.createGeometry(t)}var Ae=Jt;export{Ae as default};
