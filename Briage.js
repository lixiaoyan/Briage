(function(window){
    var B={};
    B.toString=Object.prototype.toString;
    B.getHandle=function(handle){
        return handle || function(){};
    };
    B.assert=function(bool,msg){
        if(!bool){
            B.error(msg);
        }
    };
    B.Break=function(){};
    B.Continue=function(){};
    B.error=function(msg){
        throw msg;
    };
    B.each=function(object,handle,prototype){
        if(B.toString.call(object)=="[object Array]"){
            for(var key=0,len=object.length;key<len;key++){
                try{
                    handle.call(object[key],key,object[key]);
                }catch(e){
                    if(e instanceof B.Break){
                        break;
                    }else if(e instanceof B.Continue){
                        continue;
                    }else{
                        B.error(e);
                    }
                }
            }
        }else{
            for(var key in object){
                if(prototype || !object.hasOwnProperty || object.hasOwnProperty(key)){
                    try{
                        handle.call(object[key],key,object[key]);
                    }catch(e){
                        if(e instanceof B.Break){
                            break;
                        }else if(e instanceof B.Continue){
                            continue;
                        }else{
                            B.error(e);
                        }
                    }
                }
            }
        }
    };
    B.extend=function(receiver,supplier,deepclone,overwrite,prototype){
        B.each(supplier,function(k,v){
            if(overwrite || !(k in receiver)){
                if(deepclone){
                    if(B.toString.call(v)=="[object Object]" && !(object.toString && object.toString()=="[object]")){
                        receiver[k]=B.extend({},v,deepclone,overwrite,prototype);
                    }else if(B.toString.call(v)=="[object Array]"){
                        receiver[k]=B.extend([],v,deepclone,overwrite,prototype);
                    }else{
                        receiver[k]=v;
                    }
                }else{
                    receiver[k]=v;
                }
            }
        },prototype);
        return receiver;
    };
    B.deepclone=function(object,prototype){
        if(!object){
            return null;
        }
        var clone;
        if((B.toString.call(object)=="[object Object]" && !(object.toString && object.toString()=="[object]")) || B.toString.call(object)=="[object Array]"){
            if(prototype && object.constructor){
                clone=new object.constructor();
                B.each(object,function(k,v){
                    clone[k]=B.deepclone(v,prototype);
                },false);
            }else{
                if(B.toString.call(object)=="[object Array]"){
                    clone=[];
                }else{
                    clone={};
                }
                B.each(object,function(k,v){
                    clone[k]=B.deepclone(v,prototype);
                },prototype);
            }
        }else{
            clone=object;
        }
        return clone;
    };
    B.Class=function(constructor,config){
        constructor=constructor || function(){};
        config=config || {};
        var subClass;
        if(config.extend){
            if(B.toString.call(config.extend)=="[object Object]"){
                if(config.extend.prototype || config.extend.constructor){
                    if(config.extend.constructor){
                        subClass=function(){
                            config.extend.constructor.apply(this,arguments);
                            var r=constructor.apply(this,arguments);
                            if(r!==undefined){
                                return r;
                            }
                        };
                        B.extend(subClass,config.extend.constructor,true,true);
                    }else{
                        subClass=function(){
                            var r=constructor.apply(this,arguments);
                            if(r){
                                return r;
                            }
                        };
                    }
                    if(config.extend.prototype){
                        if(B.toString.call(config.extend.prototype)=="[object Object]"){
                            var tempClass=function(){};
                            tempClass.prototype=config.extend.prototype;
                            subClass.prototype=new tempClass();
                        }else{
                            subClass.prototype=new config.extend.prototype();
                        }
                    }
                }else{
                    subClass=function(){
                        var r=constructor.apply(this,arguments);
                        if(r){
                            return r;
                        }
                    };
                }
            }else{
                subClass=function(){
                    config.extend.apply(this,arguments);
                    var r=constructor.apply(this,arguments);
                    if(r){
                        return r;
                    }
                };
                B.extend(subClass,config.extend,true,true);
                subClass.prototype=new config.extend();
            }
        }else{
            subClass=function(){
                var r=constructor.apply(this,arguments);
                if(r!==undefined){
                    return r;
                }
            };
        }
        subClass.prototype.constructor=subClass;
        if(config.method){
            B.extend(subClass,config.method,true,true);
        }
        if(config.prototype){
            B.extend(subClass.prototype,config.prototype,true,true);
        }
        return subClass;
    };
    B.param=function(param){
        if(typeof param=="string"){
            return param;
        }
        var arr=[];
        B.each(param,function(key,value){
            arr.push(encodeURIComponent(key)+"="+encodeURIComponent(value));
        });
        return arr.join("&");
    };
    B.ajax=function(config){
        config=B.extend({
            xhr:window.XMLHttpRequest?new window.XMLHttpRequest():new window.ActiveXObject("Microsoft.XMLHTTP"),
            type:"GET",
            url:window.location.href,
            data:{},
            contentType:"application/x-www-form-urlencoded",
            async:true,
            success:function(){},
            error:function(){}
        },config,true,true);
        config.type=config.type.toUpperCase();
        config.data=B.param(config.data);
        if(config.data && config.type==="GET"){
            config.url+=(/\?/.test(config.url)?"&":"?")+config.data;
        }
        config.xhr.open(config.type,config.url,config.async);
        config.xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
        config.xhr.setRequestHeader("Content-Type",config.contentType);
        config.xhr.send(config.type==="GET"?null:config.data);
        config.xhr.onreadystatechange=function(){
            if(config.xhr.readyState==4){
                if((config.xhr.status>=200 && config.xhr.status<300) || config.xhr.status==304 || config.xhr.status==1223){
                    config.success.call(config.xhr,config.xhr);
                }else{
                    config.error.call(config.xhr,config.xhr);
                }
            }
        };
        return config.xhr;
    };
    B.Array={};
    B.Array.indexOf=function(arr,value){
        var result=-1;
        B.each(arr,function(k,v){
            if(v===value){
                result=k;
                throw new B.Break();
            }
        });
        return result;
    };
    B.Array.remove=function(arr,value){
        if(B.array.indexOf(arr,value)!=-1){
            arr.splice(B.array.indexOf(arr,value),1);
        }
    };
    B.String={};
    B.String.format=function(str){
        B.each(Array.prototype.slice.call(arguments,1),function(k,v){
            str=str.replace(new RegExp("\\{"+k+"\\}","g"),v);
        });
        return str;
    };
    B.String.fill=function(length,fill){
        length=length || 0;
        fill=fill || " ";
        var add=[];
        for(var i=0;i<length;i++){
            add.push(fill);
        }
        return add.join("");
    };
    B.String.leftFill=function(str,length,fill){
        return B.String.fill(length-str.length,fill)+str;
    };
    B.String.rightFill=function(){
        return str+B.String.fill(length-str.length,fill);
    };
    B.String.trim=function(str){
        return B.String.trimLeft(B.String.trimRight(str));
    };
    B.String.trimLeft=function(str){
        return str.replace(/^\s+/,"");
    };
    B.String.trimRight=function(str){
        return str.replace(/\s+$/,"");
    };
    B.String.replace=function(arr,a,b){
        if(typeof arr=="string"){
            if(typeof a=="function"){
                return a.call(arr);
            }else{
                return String.prototype.replace.call(arr,a,b);
            }
        }else{
            var r;
            if(B.toString.call(arr)=="[object Array]"){
                r=[];
            }else{
                r={};
            }
            B.each(arr,function(k,v){
                r[k]=B.String.replace(v,a,b);
            });
            return r;
        }
    };
    B.Color={};
    B.Color.FLAG_TO_NUM=1<<0;
    B.Color.FLAG_TO_STR=1<<1;
    B.Color.FLAG_TO_RGB=1<<2;
    B.Color.FLAG_TO_HEX=1<<3;
    B.Color.FLAG_TO_HSL=1<<4;
    B.Color.convert=function(flag){
        if(flag & B.Color.FLAG_TO_NUM){
            var f;
            var m;
            var str=arguments[1];
            if((f=0,m=str.match(/^rgb\((\d+),(\d+),(\d+)\)$/)) || (f=1,m=str.match(/^#(.*?)$/))){
                if(f==0){
                    if(flag & B.Color.FLAG_TO_RGB){
                        var n=parseInt(m[1],16);
                        var r=(n>>16) & 255;
                        var g=(n>>8) & 255;
                        var b=(n) & 255;
                        return [r,g,b];
                    }
                    if(flag & B.Color.FLAG_TO_HEX){
                        var n=parseInt(m[1],16);
                        return n;
                    }
                }
                if(f==1){
                    if(flag & B.Color.FLAG_TO_RGB){
                        var r=parseInt(m[1]);
                        var g=parseInt(m[2]);
                        var b=parseInt(m[3]);
                        return [r,g,b];
                    }
                    if(flag & B.Color.FLAG_TO_HEX){
                        var r=parseInt(m[1]);
                        var g=parseInt(m[2]);
                        var b=parseInt(m[3]);
                        var n=(r<<16)+(g<<8)+(b);
                        return n;
                    }
                }
            }
            if(m=str.match(/^hsl\((\d+),(\d+%?),(\d+%?)\)$/)){
                if(flag & B.Color.FLAG_TO_HSL){
                    var h=parseInt(m[1]);
                    var s=/%$/.test(m[2])?parseInt(m[2].replace(/%$/,""))/100:parseInt(m[2]);
                    var l=/%$/.test(m[3])?parseInt(m[3].replace(/%$/,""))/100:parseInt(m[3]);
                    return [h,s,l];
                }
            }
        }
        if(flag & B.Color.FLAG_TO_STR){
            if(flag & B.Color.FLAG_TO_RGB){
                if(arguments.length==2){
                    var n=arguments[1];
                    var r=(n>>16) & 255;
                    var g=(n>>8) & 255;
                    var b=(n) & 255;
                    return B.String.format("rgb({0},{1},{2})",r,g,b);
                }else{
                    var r=arguments[1];
                    var g=arguments[2];
                    var b=arguments[3];
                    return B.String.format("rgb({0},{1},{2})",r,g,b);
                }
            }
            if(flag & B.Color.FLAG_TO_HEX){
                if(arguments.length==2){
                    var n=arguments[1];
                    return "#"+B.String.leftFill(n.toString(16),6,"0");
                }else{
                    var r=arguments[1];
                    var g=arguments[2];
                    var b=arguments[3];
                    return "#"+B.String.leftFill(((r<<16)+(g<<8)+(b)).toString(16),6,"0");
                }
            }
            if(flag & B.Color.FLAG_TO_HSL){
                var h=arguments[1];
                var s=arguments[2];
                var l=arguments[3];
                return B.String.format("hsl({0},{1},{2})",h,s,l);
            }
        }
        return null;
    };
    (function(B){
        var path="";
        var scripts=document.getElementsByTagName("script");
        B.each(scripts,function(k,v){
            var src=v.src;
            if(/Briage\.js$/.test(src)){
                path=src.replace(/Briage\.js$/,"");
                throw new B.Break();
            }
        });
        B.path=path;
    })(B);
    B.Loader={};
    B.Loader.State={};
    B.Loader.State.FROM_CACHE=0;
    B.Loader.State.FROM_SERVER=1;
    B.Loader.State.HAS_BEEN_LOADED=0;
    B.Loader.State.JUST_LOADED=1;
    var loadedImages={};
    B.Loader.loadImage=function(name,url,handle,real,noCache){
        handle=B.getHandle(handle);
        if(!noCache && loadedImages[name]){
            handle.call(loadedImages[name],loadedImages[name],B.Loader.State.FROM_CACHE);
        }else{
            var image=new Image();
            image.src=real?url:B.path+url;
            image.onload=function(){
                loadedImages[name]=image;
                handle.call(image,image,B.Loader.State.FROM_SERVER)
            }
        }
    };
    B.Loader.loadImages=function(images,handle,real,noCache){
        handle=B.getHandle(handle);
        var r={};
        var a=0;
        var c=0;
        B.each(images,function(){
            a++;
        });
        if(a==0){
            handle.call(r,r);
        }
        B.each(images,function(k,v){
            B.Loader.loadImage(k,v,function(image){
                r[k]=image;
                c++;
                if(a==c){
                    handle.call(r,r);
                }
            },real,noCache);
        });
    };
    var loadedFiles={};
    B.Loader.loadFile=function(name,url,handle,real,noCache){
        handle=B.getHandle(handle);
        if(!noCache && loadedFiles[name]){
            handle.call(loadedFiles[name],loadedFiles[name],B.Loader.State.FROM_CACHE);
        }else{
            B.ajax({
                url:(real?url:B.path+url),
                success:function(xhr){
                    loadedFiles[name]=xhr.responseText;
                    handle.call(xhr.responseText,xhr.responseText,B.Loader.State.FROM_SERVER);
                }
            });
        }
    };
    B.Loader.loadFiles=function(files,handle,real,noCache){
        handle=B.getHandle(handle);
        var r={};
        var a=0;
        var c=0;
        B.each(files,function(){
            a++;
        });
        if(a==0){
            handle.call(r,r);
        }
        B.each(files,function(k,v){
            B.Loader.loadFile(k,v,function(file){
                r[k]=file;
                c++;
                if(a==c){
                    handle.call(r,r);
                }
            },real,noCache);
        });
    };
    var loadedScripts={};
    B.Loader.loadScript=function(name,url,handle,real,noCache){
        handle=B.getHandle(handle);
        if(!noCache && loadedScripts[name]){
            handle(B.Loader.State.FROM_CACHE);
        }else{
            var script=document.createElement("script");
            script.async=true;
            script.type="text/javascript";
            script.src=real?url:B.path+url;
            document.getElementsByTagName("head")[0].appendChild(script);
            script.onreadystatechange=function(){
                if(script.readyState=="loaded" || script.readyState=="complete"){
                    loadedScripts[name]=true;
                    handle(B.Loader.State.FROM_SERVER);
                }
            };
            script.onload=function(){
                loadedScripts[name]=true;
                handle(B.Loader.State.FROM_SERVER);
            };
        }
    };
    B.Loader.loadScripts=function(scripts,handle,real,noCache){
        handle=B.getHandle(handle);
        var a=0;
        var c=0;
        B.each(scripts,function(){
            a++;
        });
        if(a==0){
            handle();
        }
        B.each(scripts,function(k,v){
            B.Loader.loadScript(k,v,function(){
                c++;
                if(a==c){
                    handle();
                }
            },real,noCache);
        });
    };
    var loadedStyleSheet={};
    B.Loader.loadStyleSheet=function(name,url,real,noCache){
        if(!noCache && loadedStyleSheet[name]){
            return
        }
        var style=document.createElement("link");
        style.rel="stylesheet";
        style.type="text/css";
        style.href=url;
        document.getElementsByTagName("head")[0].appendChild(style);
        loadedStyleSheet[name]=true;
    };
    B.Loader.loadStyleSheets=function(styleSheets,url,real,noCache){
        B.each(styleSheets,function(k,v){
            B.Loader.loadStyleSheet(k,v,real,noCache);
        });
    }
    var loadedModules={};
    B.Loader.loadModule=function(name,handle){
        handle=B.getHandle(handle);
        name=name.replace(/^(?:Briage\.)?(.*?)(?:\.js)?$/,"Briage.$1.js");
        if(loadedModules[name]){
            loadedModules[name].handles.push(handle);
        }else{
            loadedModules[name]={
                onload:function(){
                    B.each(loadedModules[name].handles,function(k,v){
                        v();
                    });
                    delete loadedModules[name];
                },
                handles:[]
            };
            loadedModules[name].handles.push(handle);
            B.Loader.loadScript(name,name,function(state){
                if(state==B.Loader.State.HAS_BEEN_LOADED){
                    loadedModules[name].onload();
                }
            });
        }
    };
    B.Loader.loadModules=function(modules,handle){
        handle=B.getHandle(handle);
        var a=0;
        var c=0;
        B.each(modules,function(){
            a++;
        });
        if(a==0){
            handle();
        }
        B.each(modules,function(k,v){
            B.Loader.loadModule(v,function(){
                c++;
                if(a==c){
                    handle();
                }
            });
        });
    };

    var Briage=function(){
        return new Briage.Briage();
    };
    Briage.Briage=new B.Class(function(){

    },{
        prototype:{
            use:function(){
                var length=arguments.length;
                if(!length){
                    return;
                }
                var modules;
                var handle;
                if(B.toString.call(arguments[0])=="[object Array]"){
                    modules=arguments[0];
                    if(length==1){
                        handle=B.getHandle();
                    }else{
                        if(typeof arguments[1]=="function"){
                            handle=arguments[1];
                        }else{
                            handle=B.getHandle();
                        }
                    }
                }else{
                    if(typeof arguments[length-1]=="function"){
                        modules=Array.prototype.slice.call(arguments,0,-1);
                        handle=arguments[length-1];
                    }else{
                        modules=arguments;
                        handle=B.getHandle();
                    }
                }
                B.Loader.loadModules(modules,function(){handle(B.deepclone(B,true));});
            },
            add:function(handle,name,include,resource){
                name=name.replace(/^(?:Briage\.)?(.*?)(?:\.js)?$/,"Briage.$1.js");
                resource=resource || {};
                this.use(include,function(){
                    B.Loader.loadScripts(resource.scripts,function(){
                        handle(B);
                        if(loadedModules[name]){
                            loadedModules[name].onload();
                        }
                        B.load
                    });
                    if(resource.images){
                        images={};
                        B.each(resource.images,function(k,v){
                            images[v]=v;
                        });
                        B.Loader.loadImages(images);
                    }
                    if(resource.styleSheets){
                        styleSheets={};
                        B.each(resource.styleSheets,function(k,v){
                            styleSheets[v]=v;
                        });
                        B.Loader.loadStyleSheets(styleSheets);
                    }
                });
            }
        }
    });
    window.Briage=Briage;
})(window);