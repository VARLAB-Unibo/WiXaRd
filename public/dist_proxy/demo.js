(()=>{const e=io("http://localhost:4000"),t=[],n=document.getElementById("demoCanvas"),o=document.getElementById("btn-sphere"),i=document.getElementById("btn-convex");let c,a,s,l,d=0,r=0,p=!1,h=0,m=performance.now(),u=!1,g=!1,v=[];e.on("send_to_cli",(e=>{t.push({buffer:e.data,size:e.data.length,hier:e.sceneHierarchy}),setInterval((()=>{if(0!==t.length)for(;0!==t.length;){const e=t.shift(),o=e.buffer,i=e.size;e.hier,setInterval((()=>{var e,t,i;o.length>0&&(e=o.shift(),t=n.getContext("2d"),(i=new Image).onload=function(){t.drawImage(i,0,0)},i.src=e)}),1e3/i)}}),500)})),e.on("disconnect",(()=>{console.log("client: Disconnected from Server Proxy")})),n.width=window.innerWidth,n.height=window.innerHeight,n.addEventListener("mousemove",(t=>{if(m=performance.now(),p){if(m-h>=0){if(c)switch(c){case 1:console.log("TASTO SINISTRO: ",c),e.emit("camerarot_tp",{x:t.clientX,y:t.clientY});break;case 2:console.log("TASTO CENTRALE (ROTELLA): ",c),e.emit("camerazoom_tp",{x:t.clientX,y:t.clientY});break;case 3:console.log("TASTO DESTRO: ",c),e.emit("cameramove_tp",{x:t.clientX,y:t.clientY})}h=m}}else e.emit("mousemove_tp",{x:t.clientX,y:t.clientY})})),n.addEventListener("mousedown",(t=>{p=!0,c=t.keyCode||t.which,console.log("KEYCODE: ",c);const n=t.buttons;e.emit("mouseclick_tp",{x:t.clientX,y:t.clientY,kc:c,btns:n})})),n.addEventListener("mouseup",(t=>{p=!1,c=void 0,e.emit("reset_coordinates_tp")})),n.addEventListener("wheel",(t=>{const n=t.deltaY;n>0?console.log("Mouse wheel scrolled down."):n<0&&console.log("Mouse wheel scrolled up."),e.emit("camerazoom_tp",{delta:n})})),n.addEventListener("dblclick",(function(t){u&&(e.emit("retrieve_popup_tp",{semid:void 0}),d=t.clientX,r=t.clientY,u=!1),g&&(d=t.clientX,r=t.clientY)})),window.addEventListener("contextmenu",(function(e){e.preventDefault()})),window.addEventListener("mousedown",(function(e){e.preventDefault()})),window.addEventListener("wheel",(function(e){e.preventDefault()}),{passive:!1}),o.addEventListener("mousedown",(function(){l=0,u=!0,o.classList.add("atonBTN-rec"),alert("Adding sphere shape annotation, select a point to put it")})),i.addEventListener("click",(function(){l=1,i.classList.add("atonBTN-rec"),"End shape definition"!==i.textContent?(g=!0,alert("Adding convex shape annotation, define a shape adding points"),i.textContent="End shape definition",e.emit("switch_convex_mode_tp",{data:!0})):(g=!1,i.textContent="Add convex annotation",e.emit("switch_convex_mode_tp",{data:!1}),e.emit("retrieve_popup_tp",{semid:void 0}))})),e.on("new_ann_td",(t=>{const n=t.html.replaceAll("https://localhost:8084","http://localhost:4000");console.log(n),$("#idPopup").html(n),$(".hideWhenOpeningPopup").hide(),$("#idPopup").show(),$("#semid").click((function(){$(this).focus()})),$("#btnRichContent").click((()=>{$("#idSemDescCont").toggle()}));let c=$("#idSemDescription").sceditor({id:"idSCEditor",width:"100%",height:"300px",resizeEnabled:!1,autoExpand:!0,emoticonsEnabled:!1,autoUpdate:!0,style:"vendors/sceditor/minified/themes/content/default.min.css",toolbar:"bold,italic,underline,link,unlink,font,size,color,removeformat|left,center,right,justify|bulletlist,orderedlist,table,code|image,youtube|source"}).sceditor("instance");t.descr&&c.setWysiwygEditorValue(t.descr),$("#btnVocalNote").click((()=>{a?($("#btnVocalNote").attr("class","atonBTN"),$("#btnVocalNote").html("<img src='http://localhost:4000/res/icons/talk.png'>Vocal Note"),a.stop(),a=void 0,$("#ctrlVocalNote").show()):($("#btnVocalNote").attr("class","atonBTN atonBTN-rec"),$("#btnVocalNote").html("<img src='http://localhost:4000/res/icons/rec.png'>STOP Recording"),navigator.mediaDevices.getUserMedia({audio:!0}).then((function(e){a=new MediaRecorder(e),a.ondataavailable=function(e){e.data.size>0&&v.push(e.data)},a.onstop=function(){const e=new Blob(v,{type:"audio/wav"});var t;(t=e,new Promise(((e,n)=>{const o=new FileReader;o.onload=()=>{const t=o.result.split(",")[1];e(t)},o.onerror=e=>{n(e)},o.readAsDataURL(t)}))).then((e=>{s="data:audio/wav;base64,"+e,$("#ctrlVocalNote").attr("src",s)})).catch((e=>{console.error("Error converting Blob to base64:",e)}))},a.start()})).catch((function(e){console.log("An error has occured: ",e)})))})),$("#idAnnOK").click((()=>{const t=$("#semid").val(),n=JSON.stringify(c.val());console.log(t,n),e.emit("remote_ann_tp",{x:d,y:r,annId:t,annTxt:n,annVoc:s,semtype:l}),$("#idPopup").hide(),$("#idPopup").html(""),$(".hideWhenOpeningPopup").show(),o.classList.contains("atonBTN-rec")&&o.classList.remove("atonBTN-rec"),i.classList.contains("atonBTN-rec")&&i.classList.remove("atonBTN-rec")})),$("#idPopup").click((e=>{$("#idPopupContent").is(e.target)||0!==$("#idPopupContent").has(e.target).length||($("#idPopup").hide(),$("#idPopup").html(""),$(".hideWhenOpeningPopup").show(),o.classList.contains("atonBTN-rec")&&o.classList.remove("atonBTN-rec"),i.classList.contains("atonBTN-rec")&&i.classList.remove("atonBTN-rec"))}))})),e.on("annotation_infos_td",(t=>{console.log(t);const n=t.replace("https://localhost:8084","http://localhost:4000").replace("HATHOR.toggleSideSemPanel(false)","").split("</div>");let o="";n.forEach(((e,t)=>{o+=e+"</div>",0===t&&(o+="<div class='atonSidePanelTopRightBTN atonBTN' id='btnEditSem'><img src='http://localhost:4000/res/icons/edit.png'></div>")})),console.log(o),$("#idSemPanel").html(o),$("#idSemPanel").show();const i=document.querySelector(".atonSidePanelCloseBTN");console.log(i),i.addEventListener("click",(function(){$("#idSemPanel").hide(),$("#idSemPanelBG").hide(),$("#idSemPanel").html("")})),$("#btnEditSem").click((()=>{const t=document.querySelector(".atonSidePanelHeader").textContent;console.log(t),e.emit("retrieve_popup_tp",{semid:t}),$("#idSemPanel").hide(),$("#idSemPanelBG").hide(),$("#idSemPanel").html("")}))}))})();