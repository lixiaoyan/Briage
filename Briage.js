(function(window){
    var B={};
    B.toString=Object.prototype.toString;
    B.getHandle=function(handle){
        return handle || function(){};
    };
    B.Break=function(){};
    B.Continue=function(){};
    B.error=function(msg){
        throw msg;
    };
    B.each=function(object,handle,prototype){
        if(B.toString.call(object)=="[object Array]"){
            for(var key=0;key<object.length;key++){
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
                    receiver[k]=B.deepclone(v,prototype);
                }else{
                    receiver[k]=v;
                }
            }
        });
        return receiver;
    };
    B.deepclone=function(object,prototype){
        if(B.toString.call(object)=="[object Object]"){
            return B.extend({},object,true,true,prototype);
        }else if(B.toString.call(object)=="[object Array]"){
            return B.extend([],object,true,true,prototype);
        }else{
            return object;
        }
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
                            constructor.call(this,arguments);
                        };
                        B.extend(subClass,config.extend.constructor,true,true);
                    }else{
                        subClass=function(){
                            constructor.call(this,arguments);
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
                        constructor.apply(this,arguments);
                    };
                }
            }else{
                subClass=function(){
                    config.extend.apply(this,arguments);
                    constructor.apply(this,arguments);
                };
                B.extend(subClass,config.extend,true,true);
                subClass.prototype=new config.extend();
            }
        }else{
            subClass=function(){
                constructor.apply(this,arguments);
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
                if(B.toString.call(arguments[0])=="[object Array]"){
                    modules=arguments[0];
                }else{
                    modules=Array.prototype.slice.call(arguments,0,-1);
                }
                var handle=B.getHandle(arguments[length-1]);
                B.Loader.loadModules(modules,function(){handle(B.deepclone(B));});
            },
            add:function(handle,name,include){
                name=name.replace(/^(?:Briage\.)?(.*?)(?:\.js)?$/,"Briage.$1.js");
                this.use(include,function(){
                    handle(B);
                    if(loadedModules[name]){
                        loadedModules[name].onload();
                    }
                });
            }
        }
    });
    window.Briage=Briage;
})(window);