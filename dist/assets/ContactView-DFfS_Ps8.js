import{d as ae,y as se,r as S,o as ie,c as T,b as a,v as re,B as le,h as R,C as L,D as M,E as ne,F as de,j as ce,i as pe,t as I,f as V,_ as me}from"./index-DX20QISl.js";import"@element-plus/icons-vue";class z{constructor(e=0,s="Network Error"){this.status=e,this.text=s}}const ue=()=>{if(!(typeof localStorage>"u"))return{get:t=>Promise.resolve(localStorage.getItem(t)),set:(t,e)=>Promise.resolve(localStorage.setItem(t,e)),remove:t=>Promise.resolve(localStorage.removeItem(t))}},d={origin:"https://api.emailjs.com",blockHeadless:!1,storageProvider:ue()},F=t=>t?typeof t=="string"?{publicKey:t}:t.toString()==="[object Object]"?t:{}:{},be=(t,e="https://api.emailjs.com")=>{if(!t)return;const s=F(t);d.publicKey=s.publicKey,d.blockHeadless=s.blockHeadless,d.storageProvider=s.storageProvider,d.blockList=s.blockList,d.limitRate=s.limitRate,d.origin=s.origin||e},K=async(t,e,s={})=>{const l=await fetch(d.origin+t,{method:"POST",headers:s,body:e}),n=await l.text(),m=new z(l.status,n);if(l.ok)return m;throw m},N=(t,e,s)=>{if(!t||typeof t!="string")throw"The public key is required. Visit https://dashboard.emailjs.com/admin/account";if(!e||typeof e!="string")throw"The service ID is required. Visit https://dashboard.emailjs.com/admin";if(!s||typeof s!="string")throw"The template ID is required. Visit https://dashboard.emailjs.com/admin/templates"},ge=t=>{if(t&&t.toString()!=="[object Object]")throw"The template params have to be the object. Visit https://www.emailjs.com/docs/sdk/send/"},U=t=>t.webdriver||!t.languages||t.languages.length===0,J=()=>new z(451,"Unavailable For Headless Browser"),fe=(t,e)=>{if(!Array.isArray(t))throw"The BlockList list has to be an array";if(typeof e!="string")throw"The BlockList watchVariable has to be a string"},ve=t=>{var e;return!((e=t.list)!=null&&e.length)||!t.watchVariable},xe=(t,e)=>t instanceof FormData?t.get(e):t[e],Y=(t,e)=>{if(ve(t))return!1;fe(t.list,t.watchVariable);const s=xe(e,t.watchVariable);return typeof s!="string"?!1:t.list.includes(s)},W=()=>new z(403,"Forbidden"),he=(t,e)=>{if(typeof t!="number"||t<0)throw"The LimitRate throttle has to be a positive number";if(e&&typeof e!="string")throw"The LimitRate ID has to be a non-empty string"},ye=async(t,e,s)=>{const l=Number(await s.get(t)||0);return e-Date.now()+l},G=async(t,e,s)=>{if(!e.throttle||!s)return!1;he(e.throttle,e.id);const l=e.id||t;return await ye(l,e.throttle,s)>0?!0:(await s.set(l,Date.now().toString()),!1)},Q=()=>new z(429,"Too Many Requests"),we=async(t,e,s,l)=>{const n=F(l),m=n.publicKey||d.publicKey,k=n.blockHeadless||d.blockHeadless,v=n.storageProvider||d.storageProvider,g={...d.blockList,...n.blockList},P={...d.limitRate,...n.limitRate};return k&&U(navigator)?Promise.reject(J()):(N(m,t,e),ge(s),s&&Y(g,s)?Promise.reject(W()):await G(location.pathname,P,v)?Promise.reject(Q()):K("/api/v1.0/email/send",JSON.stringify({lib_version:"4.4.1",user_id:m,service_id:t,template_id:e,template_params:s}),{"Content-type":"application/json"}))},ke=t=>{if(!t||t.nodeName!=="FORM")throw"The 3rd parameter is expected to be the HTML form element or the style selector of the form"},je=t=>typeof t=="string"?document.querySelector(t):t,Le=async(t,e,s,l)=>{const n=F(l),m=n.publicKey||d.publicKey,k=n.blockHeadless||d.blockHeadless,v=d.storageProvider||n.storageProvider,g={...d.blockList,...n.blockList},P={...d.limitRate,...n.limitRate};if(k&&U(navigator))return Promise.reject(J());const x=je(s);N(m,t,e),ke(x);const f=new FormData(x);return Y(g,f)?Promise.reject(W()):await G(location.pathname,P,v)?Promise.reject(Q()):(f.append("lib_version","4.4.1"),f.append("service_id",t),f.append("template_id",e),f.append("user_id",m),K("/api/v1.0/email/send-form",f))},D={init:be,send:we,sendForm:Le,EmailJSResponseStatus:z},Pe={class:"py-20 bg-gray-50"},$e={class:"container mx-auto px-4"},Se={class:"grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"},Te={class:"bg-white rounded-lg shadow-lg p-8","data-aos":"fade-up","data-aos-delay":"200"},Me={class:"grid grid-cols-1 md:grid-cols-2 gap-6"},Ve={class:"grid grid-cols-1 md:grid-cols-2 gap-6"},ze=["value"],Ce=["disabled"],He={key:0,class:"animate-spin -ml-1 mr-3 h-5 w-5 text-white",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24"},Be={key:0,class:"bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded"},Re={key:1,class:"bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"},Ie=ae({__name:"ContactView",setup(t){const e=se({name:"",email:"",phone:"",company:"",message:"",interest:"general",wechatId:""}),s=[{value:"general",label:"一般咨询"},{value:"path-planning",label:"路径规划"},{value:"person-recognition",label:"人员识别"},{value:"vehicle-monitoring",label:"车辆监控"},{value:"disaster-detection",label:"灾害检测"},{value:"license-plate",label:"车牌识别"},{value:"data-dashboard",label:"数据仪表盘"},{value:"knowledge-graph",label:"知识图谱"}],l=S(!1),n=S(!1),m=S(""),k=S(""),v=S("");ie(()=>{D.init("k8Qcdu81GHSI5Pbro")});const g=c=>{const o=s.find(i=>i.value===c);return o?o.label:"一般咨询"},P=async c=>{if(v.value)return v.value;l.value=!0;try{const o="https://api.deepseek.com/v1/chat/completions",i=g(e.interest),j=`
      请基于以下项目功能描述，对客户询问内容进行分析并提供智能建议。
      
      
      项目主要功能:
      1. 路径规划 - 通过本地大模型进行语义分割实现智能路径规划
      2. 图像识别 - 分为本地模型训练的模型识别(resnet50切割模型、年龄识别模型、性别分类模型、衣服颜色识别模型)以及视觉模型识别，支持与本地模型基于图片进行"聊天"(将识别信息打包发给LLM进行交互)
      3. 知识库交流 - 实现联网搜索、本地LLM对话，以及知识图谱构建与查询
      4. 夜间车辆识别 - 利用图像增强算法，结合YOLO实现夜间增强识别
      5. 超远距离识别 - 用于识别远距离或高空下微小移动物体
      6. 夜间行为识别及报警 - 通过分类识别拥抱、握手、斗殴等行为，检测到危险信号自动通过邮箱实现报警
      7. 森林火灾与洪水检测 - 包括泥石流检测
      8. 车牌识别 - 上传照片识别车牌，并在视频中匹配相同车牌实现报警功能
    
      
      请根据客户咨询的内容和项目功能，提供以下格式的分析和建议：
      
      【标题】(10字以内，一针见血)
      
      【大纲】(30字以内，2-3个要点)
      
      【内容】(50字以内，核心需求)
      
      【建议】(50字以内，1-3条针对性建议，必须参考用户问题和项目功能给出)
      
      【解决方案】(100字以内，针对客户需求提供的具体解决方案，结合我们的功能优势)
      
      客户询问类型：${i}
      客户询问内容：${c}
    `,p=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer sk-e120c0aae8074a368d26fff5136a83fd"},body:JSON.stringify({model:"deepseek-chat",messages:[{role:"user",content:j}],temperature:.7,max_tokens:500})});if(!p.ok){const H=await p.json().catch(()=>({}));if(console.error("DeepSeek API返回错误:",p.status,H),p.status===401)return x(c,i);throw new Error(`API错误: ${p.status}`)}const y=await p.json();if(!y.choices||!y.choices[0]||!y.choices[0].message)return console.error("DeepSeek API返回了无效的响应结构:",y),x(c,i);const C=y.choices[0].message.content;return v.value=C,l.value=!1,C}catch(o){return console.error("处理消息时出错:",o),l.value=!1,x(c,g(e.interest))}},x=(c,o)=>(B=>{const j={路径规划:{title:"路径规划需求",outline:"智能规划、实时调整、避障功能",content:"客户需要一个高精度的路径规划解决方案",advice:"建议结合本地大模型的语义分割技术实现智能路径规划",solution:"我们可以提供结合本地大模型的语义分割技术实现的路径规划方案，支持实时路径调整和智能避障"},人员识别:{title:"人员识别需求",outline:"人员检测、特征分析、行为识别",content:"客户需要精准的人员识别与分析功能",advice:"结合多模型识别技术提升识别准确率",solution:"我们的系统集成了多种识别模型，如年龄识别、性别分类和衣物颜色识别，可以满足您的人员识别需求"},车辆监控:{title:"车辆监控需求",outline:"夜间监控、车辆跟踪、异常报警",content:"客户需要全天候车辆监控与分析系统",advice:"采用我们的夜间车辆识别和车牌识别技术",solution:"我们的夜间车辆识别系统结合图像增强算法和YOLO技术，可实现24小时不间断监控，并支持车牌自动识别和匹配报警"},灾害检测:{title:"灾害监测需求",outline:"火灾检测、洪水监测、预警系统",content:"客户需要自动化灾害检测与预警功能",advice:"部署我们的森林火灾与洪水检测系统",solution:"我们的森林火灾与洪水检测系统可以实时监测环境变化，自动识别灾害迹象并及时预警，提供安全保障"},车牌识别:{title:"车牌识别需求",outline:"车牌检测、数据匹配、自动报警",content:"客户需要精准的车牌识别与管理系统",advice:"使用我们的车牌识别与匹配报警技术",solution:"我们的车牌识别系统支持从照片或视频中提取车牌信息，并可与数据库匹配，发现异常车辆时自动报警"},数据仪表盘:{title:"数据可视化需求",outline:"数据整合、实时监控、可视化展示",content:"客户需要直观的数据分析与展示平台",advice:"定制化数据仪表盘，整合多源数据",solution:"我们可以根据您的需求设计定制化数据仪表盘，整合各类识别系统数据，提供直观的可视化界面和分析报表"},知识图谱:{title:"知识管理需求",outline:"信息关联、智能查询、知识挖掘",content:"客户需要建立知识关联与智能查询系统",advice:"部署我们的知识图谱构建与查询系统",solution:"我们的知识图谱系统支持信息关联分析、智能查询和知识挖掘，可以帮助您构建完整的知识管理体系"},一般咨询:{title:"综合解决方案",outline:"需求分析、方案定制、技术支持",content:"客户对我们的技术方案有综合咨询需求",advice:"根据具体需求提供定制化解决方案",solution:"我们可以根据您的具体需求，整合路径规划、图像识别、知识库等多种技术，提供全方位的智能解决方案"}},h=j[B]||j.一般咨询;return`
【标题】${h.title}

【大纲】${h.outline}

【内容】${h.content}

【建议】${h.advice}

【解决方案】${h.solution}
    `})(o),f=async c=>{try{const o="2356648915@qq.com",i=`网站咨询 - ${g(e.interest)} - ${e.name}`,j=new Date().toLocaleString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}),p=(b=>{const r={title:"",outline:"",content:"",advice:"",solution:""},_=b.match(/【标题】([\s\S]*?)(?=【大纲】|【内容】|【建议】|【解决方案】|$)/),q=b.match(/【大纲】([\s\S]*?)(?=【标题】|【内容】|【建议】|【解决方案】|$)/),A=b.match(/【内容】([\s\S]*?)(?=【标题】|【大纲】|【建议】|【解决方案】|$)/),E=b.match(/【建议】([\s\S]*?)(?=【标题】|【大纲】|【内容】|【解决方案】|$)/),O=b.match(/【解决方案】([\s\S]*?)(?=【标题】|【大纲】|【内容】|【建议】|$)/);if(_&&(r.title=_[1].trim()),q&&(r.outline=q[1].trim()),A&&(r.content=A[1].trim()),E&&(r.advice=E[1].trim()),O&&(r.solution=O[1].trim()),!r.title&&!r.outline&&!r.content&&!r.advice&&!r.solution){const w=b.split(`
`).filter(u=>u.trim());for(const u of w)u.includes("【标题】")?r.title=u.replace(/【标题】/,"").trim():u.includes("【大纲】")?r.outline=u.replace(/【大纲】/,"").trim():u.includes("【内容】")?r.content=u.replace(/【内容】/,"").trim():u.includes("【建议】")?r.advice=u.replace(/【建议】/,"").trim():u.includes("【解决方案】")&&(r.solution=u.replace(/【解决方案】/,"").trim())}const Z=r.outline?r.outline.split(/[,，、;；]\s*/).filter(w=>w.trim().length>0):["功能细节","技术指标","开发支持"];let $=[];r.advice&&(/\d[\.、)）]\s/.test(r.advice)?$=r.advice.split(/\d[\.、)）]\s+/).filter(w=>w.trim().length>0):$=r.advice.split(/[\.。;；]\s*/).filter(w=>w.trim().length>0)),$.length===0&&($=["对对应功能模块提供技术白皮书或案例展示，增强客户信任度","明确项目需求与开发周期，便于客户评估可行性","强调本地LLM与知识图谱的定制化能力，突出差异化优势"]);const ee=r.solution||"结合项目已有功能，可提供以下解决方案：路径规划、图像识别、知识库交互、夜间监控等，满足客户需求。",te=r.title||"智能识别系统开发咨询",oe=r.content||"客户需要详细询问多功能的实现细节、技术指标及开发支持，包括模型性能、算法优化、数据安全等。";return{title:te,outlinePoints:Z,content:oe,advicePoints:$,solution:ee}})(c);console.log("解析后的内容:",p);const y=`
    <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333;">
      <!-- 顶部客户信息卡片 -->
      <div style="background-color: #f0f5ff; padding: 20px; margin-bottom: 25px; border-radius: 6px; border-left: 5px solid #3a86ff; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        <h2 style="margin-top: 0; margin-bottom: 15px; color: #1a56db; font-size: 18px; border-bottom: 1px solid #d1e0ff; padding-bottom: 8px;">📋 客户信息</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 5px; width: 25%; font-weight: bold; vertical-align: top;">客户：</td>
            <td style="padding: 8px 5px;">${e.name}</td>
            <td style="padding: 8px 5px; width: 25%; font-weight: bold; vertical-align: top;">咨询类型：</td>
            <td style="padding: 8px 5px;">${g(e.interest)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 5px; font-weight: bold; vertical-align: top;">联系方式：</td>
            <td style="padding: 8px 5px;">${e.email}${e.phone?" | "+e.phone:""}</td>
            <td style="padding: 8px 5px; font-weight: bold; vertical-align: top;">公司：</td>
            <td style="padding: 8px 5px;">${e.company||"未提供"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 5px; font-weight: bold; vertical-align: top;">提交时间：</td>
            <td style="padding: 8px 5px;" colspan="3">${j}</td>
          </tr>
        </table>
      </div>
      
      <!-- AI分析结果 -->
      <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); margin-bottom: 25px;">
        <h2 style="margin-top: 0; color: #2563eb; font-size: 20px; margin-bottom: 20px; display: flex; align-items: center;">
          <span style="background-color: #2563eb; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; justify-content: center; align-items: center; margin-right: 10px; font-size: 14px;">AI</span>
          ${p.title||"智能分析报告"}
        </h2>
        
        <!-- 大纲部分 -->
        <div style="margin-bottom: 20px; background-color: #f9fafb; padding: 15px; border-radius: 4px;">
          <h3 style="color: #3b82f6; margin-top: 0; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">📊 核心要点</h3>
          <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
            ${p.outlinePoints.map(b=>`<li style="margin-bottom: 8px;">${b}</li>`).join("")}
          </ul>
        </div>
        
        <!-- 内容部分 -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #3b82f6; margin-top: 0; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">📝 需求描述</h3>
          <p style="margin: 0; line-height: 1.6; color: #4b5563;">${p.content}</p>
        </div>
        
        <!-- 建议部分 -->
        <div style="margin-bottom: 20px; background-color: #f0f9ff; padding: 15px; border-radius: 4px; border-left: 3px solid #0ea5e9;">
          <h3 style="color: #0284c7; margin-top: 0; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #bae6fd; padding-bottom: 8px;">💡 建议方案</h3>
          <ol style="margin: 0; padding-left: 20px;">
            ${p.advicePoints.map(b=>`<li style="margin-bottom: 8px;">${b}</li>`).join("")}
          </ol>
        </div>
        
        <!-- 解决方案部分 -->
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 4px; border-left: 3px solid #10b981;">
          <h3 style="color: #047857; margin-top: 0; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #a7f3d0; padding-bottom: 8px;">🔍 解决方案</h3>
          <p style="margin: 0; line-height: 1.6; color: #374151;">${p.solution}</p>
        </div>
      </div>
      
      <!-- 原始留言 -->
      <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px;">
        <h3 style="margin-top: 0; color: #71717a; font-size: 16px; margin-bottom: 12px; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px;">📩 原始留言</h3>
        <p style="margin: 0; white-space: pre-wrap; color: #52525b; font-size: 14px; line-height: 1.6;">${e.message}</p>
      </div>
    </div>
    `,C={to_email:o,from_name:e.name,from_email:e.email,subject:i,message:c,html:y},H=await D.send("service_jbw13bs","template_8721z3o",C);return console.log("邮件发送成功:",H.text),H}catch(o){throw console.error("发送邮件失败:",o),new Error(`邮件发送失败: ${o.message}`)}},X=async()=>{l.value=!0,m.value="",k.value="";try{const c=await P(e.message);await f(c),n.value=!0,e.name="",e.email="",e.phone="",e.company="",e.message="",e.interest="general",e.wechatId=""}catch(c){m.value=c.message||"发送留言时出现错误，请重试。",console.error("提交表单失败:",c)}finally{l.value=!1}};return(c,o)=>(V(),T("div",null,[a("section",Pe,[a("div",$e,[o[16]||(o[16]=a("h1",{class:"text-4xl md:text-5xl font-bold text-center mb-4","data-aos":"fade-up"}," 联系我们 ",-1)),o[17]||(o[17]=a("p",{class:"text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto","data-aos":"fade-up","data-aos-delay":"100"}," 与我们的团队联系，了解更多关于我们无人机解决方案如何满足您的特定需求。 ",-1)),a("div",Se,[a("div",Te,[o[14]||(o[14]=a("h2",{class:"text-2xl font-bold mb-6"},"给我们留言",-1)),a("form",{onSubmit:le(X,["prevent"]),class:"space-y-6"},[a("div",Me,[a("div",null,[o[6]||(o[6]=a("label",{for:"name",class:"block text-sm font-medium text-gray-700 mb-1"},"姓名",-1)),L(a("input",{id:"name","onUpdate:modelValue":o[0]||(o[0]=i=>e.name=i),type:"text",required:"",class:"w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"},null,512),[[M,e.name]])]),a("div",null,[o[7]||(o[7]=a("label",{for:"email",class:"block text-sm font-medium text-gray-700 mb-1"},"电子邮箱",-1)),L(a("input",{id:"email","onUpdate:modelValue":o[1]||(o[1]=i=>e.email=i),type:"email",required:"",class:"w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"},null,512),[[M,e.email]])])]),a("div",Ve,[a("div",null,[o[8]||(o[8]=a("label",{for:"phone",class:"block text-sm font-medium text-gray-700 mb-1"},"电话号码",-1)),L(a("input",{id:"phone","onUpdate:modelValue":o[2]||(o[2]=i=>e.phone=i),type:"tel",class:"w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"},null,512),[[M,e.phone]])]),a("div",null,[o[9]||(o[9]=a("label",{for:"company",class:"block text-sm font-medium text-gray-700 mb-1"},"公司",-1)),L(a("input",{id:"company","onUpdate:modelValue":o[3]||(o[3]=i=>e.company=i),type:"text",class:"w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"},null,512),[[M,e.company]])])]),a("div",null,[o[10]||(o[10]=a("label",{for:"interest",class:"block text-sm font-medium text-gray-700 mb-1"},"我对以下方面感兴趣",-1)),L(a("select",{id:"interest","onUpdate:modelValue":o[4]||(o[4]=i=>e.interest=i),class:"w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"},[(V(),T(de,null,ce(s,i=>a("option",{key:i.value,value:i.value},I(i.label),9,ze)),64))],512),[[ne,e.interest]])]),a("div",null,[o[11]||(o[11]=a("label",{for:"message",class:"block text-sm font-medium text-gray-700 mb-1"},"留言内容",-1)),L(a("textarea",{id:"message","onUpdate:modelValue":o[5]||(o[5]=i=>e.message=i),rows:"4",required:"",class:"w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue",placeholder:"请详细描述您的需求，我们将通过AI助手整理后发送到相关部门"},null,512),[[M,e.message]])]),a("div",null,[a("button",{type:"submit",class:"btn-primary w-full flex justify-center items-center",disabled:l.value},[l.value?(V(),T("svg",He,o[12]||(o[12]=[a("circle",{class:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"4"},null,-1),a("path",{class:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"},null,-1)]))):R("",!0),pe(" "+I(l.value?"处理中...":"发送留言"),1)],8,Ce),o[13]||(o[13]=a("p",{class:"text-xs text-gray-500 mt-2"}," 您的留言将由AI助手整理后发送到我们的邮箱，我们会尽快回复您。 ",-1))]),n.value?(V(),T("div",Be," 感谢您的留言！留言已通过AI助手处理并发送至相关部门，我们会尽快回复您。 ")):R("",!0),m.value?(V(),T("div",Re,I(k.value||"发送留言时出现错误，请重试。"),1)):R("",!0)],32)]),o[15]||(o[15]=re('<div data-aos="fade-up" data-aos-delay="300" data-v-a259a2a2><div class="bg-white rounded-lg shadow-lg p-8 mb-8" data-v-a259a2a2><h2 class="text-2xl font-bold mb-6" data-v-a259a2a2>联系方式</h2><div class="space-y-4" data-v-a259a2a2><div class="flex items-start" data-v-a259a2a2><svg class="w-6 h-6 text-skydio-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-a259a2a2><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" data-v-a259a2a2></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" data-v-a259a2a2></path></svg><div data-v-a259a2a2><p class="font-medium" data-v-a259a2a2>总部地址</p><p class="text-gray-600" data-v-a259a2a2>中国河南省郑州市惠济区英才街18号</p></div></div><div class="flex items-start" data-v-a259a2a2><svg class="w-6 h-6 text-skydio-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-a259a2a2><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" data-v-a259a2a2></path></svg><div data-v-a259a2a2><p class="font-medium" data-v-a259a2a2>电子邮箱</p><p class="text-gray-600" data-v-a259a2a2>1241515924@qq.com</p></div></div><div class="flex items-start" data-v-a259a2a2><svg class="w-6 h-6 text-skydio-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-a259a2a2><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" data-v-a259a2a2></path></svg><div data-v-a259a2a2><p class="font-medium" data-v-a259a2a2>电话</p><p class="text-gray-600" data-v-a259a2a2>（+86）15978568969</p></div></div></div></div><div class="rounded-lg overflow-hidden shadow-lg h-64 bg-gray-300" data-v-a259a2a2><img src="https://cdn.sanity.io/images/mgxz50fq/~production-v3/b05a19afaed85c6b8145dc929d1df8aed06ee414-1158x585.png?w=3000&amp;fit=max&amp;auto=format" alt="地图" class="w-full h-full object-cover" data-v-a259a2a2></div></div>',1))])])])]))}}),qe=me(Ie,[["__scopeId","data-v-a259a2a2"]]);export{qe as default};
