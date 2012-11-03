(function(window){
    var Briage={};
    Briage.Break=function(){};
    Briage.Continue=function(){};
    Briage.error=function(msg){
        throw msg;
    };
    Briage.each=function(object,handle,prototype){
        if(Object.prototype.toString.call(object)=="[object Array]"){
            for(var key=0;key<object.length;key++){
                try{
                    handle.call(object[key],key,object[key]);
                }catch(e){
                    if(e instanceof Briage.Break){
                        break;
                    }else if(e instanceof Briage.Continue){
                        continue;
                    }else{
                        Briage.error(e);
                    }
                }
            }
        }else{
            for(var key in object){
                if(prototype || !object.hasOwnProperty || object.hasOwnProperty(key)){
                    try{
                        handle.call(object[key],key,object[key]);
                    }catch(e){
                        if(e instanceof Briage.Break){
                            break;
                        }else if(e instanceof Briage.Continue){
                            continue;
                        }else{
                            Briage.error(e);
                        }
                    }
                }
            }
        }
    };
    Briage.extend=function(receiver,supplier,deepclone,overwrite,prototype){
        Briage.each(supplier,function(k,v){
            if(overwrite || !(k in receiver)){
                if(deepclone){
                    if(Object.prototype.toString.call(v)=="[object Object]"){
                        receiver[k]=Briage.extend({},v,deepclone,overwrite,prototype);
                    }else if(Object.prototype.toString.call(v)=="[object Array]"){
                        receiver[k]=Briage.extend([],v,deepclone,overwrite,prototype);
                    }else{
                        receiver[k]=v;
                    }
                }else{
                    receiver[k]=v;
                }
            }
        });
        return receiver;
    };
    Briage.param=function(param){
        if(typeof param=="string"){
            return param;
        }
        var arr=[];
        Briage.each(param,function(key,value){
            arr.push(encodeURIComponent(key)+"="+encodeURIComponent(value));
        });
        return arr.join("&");
    };
    Briage.ajax=function(config){
        config=Briage.extend({
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
        config.data=Briage.param(config.data);
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
    Briage.Array={};
    Briage.Array.indexOf=function(arr,value){
        var result=-1;
        Briage.each(arr,function(k,v){
            if(v===value){
                result=k;
                throw new Briage.Break();
            }
        });
        return result;
    };
    Briage.Array.remove=function(arr,value){
        if(Briage.array.indexOf(arr,value)!=-1){
            arr.splice(Briage.array.indexOf(arr,value),1);
        }
    };
    Briage.String={};
    Briage.String.format=function(str){
        Briage.each(Array.prototype.slice.call(arguments,1),function(k,v){
            str=str.replace(new RegExp("\\{"+k+"\\}","g"),v);
        });
        return str;
    };
    Briage.String.trim=function(str){
        return Briage.String.trimLeft(Briage.String.trimRight(str));
    };
    Briage.String.trimLeft=function(str){
        return str.replace(/^\s+/,"");
    };
    Briage.String.trimRight=function(str){
        return str.replace(/\s+$/,"");
    };
    Briage.String.replace=function(arr,a,b){
        if(typeof arr=="string"){
            if(typeof a=="function"){
                return a.call(arr);
            }else{
                return String.prototype.replace.call(arr,a,b);
            }
        }else{
            var r;
            if(Object.prototype.toString.call(arr)=="[object Array]"){
                r=[];
            }else{
                r={};
            }
            Briage.each(arr,function(k,v){
                r[k]=Briage.String.replace(v,a,b);
            });
            return r;
        }
    };
    (function(Briage){
        var path="";
        var scripts=document.getElementsByTagName("script");
        Briage.each(scripts,function(k,v){
            var src=v.src;
            if(/Briage\.js$/.test(src)){
                path=src.replace(/Briage\.js$/,"");
                throw new Briage.Break();
            }
        });
        Briage.path=path;
    })(Briage);
    Briage.Loader={};
    Briage.Loader.State={};
    Briage.Loader.State.FROM_CACHE=0;
    Briage.Loader.State.FROM_SERVER=1;
    Briage.Loader.State.HAS_BEEN_LOADED=0;
    Briage.Loader.State.JUST_LOADED=1;
    Briage.Loader.loaded_images={};
    Briage.Loader.load_image=function(name,url,handle,real,no_cache){
        if(!no_cache && Briage.Loader.loaded_images[name]){
            handle.call(Briage.Loader.loaded_images[name],Briage.Loader.loaded_images[name],Briage.Loader.State.FROM_CACHE);
        }else{
            var image=new Image();
            image.src=real?url:Briage.path+url;
            image.onload=function(){
                Briage.Loader.loaded_images[name]=image;
                handle.call(image,image,Briage.Loader.State.FROM_SERVER)
            }
        }
    };
    Briage.Loader.load_images=function(images,handle,real,no_cache){
        var r={};
        var a=0;
        var c=0;
        Briage.each(images,function(){
            a++;
        });
        if(a==0){
            handle.call(r,r);
        }
        Briage.each(images,function(k,v){
            Briage.Loader.load_image(k,v,function(image){
                r[k]=image;
                c++;
                if(a==c){
                    handle.call(r,r);
                }
            },real,no_cache);
        });
    };
    Briage.Loader.loaded_files={};
    Briage.Loader.load_file=function(name,url,handle,real,no_cache){
        if(!no_cache && Briage.Loader.loaded_files[name]){
            handle.call(Briage.Loader.loaded_files[name],Briage.Loader.loaded_files[name],Briage.Loader.State.FROM_CACHE);
        }else{
            Briage.ajax({
                url:(real?url:Briage.path+url),
                success:function(xhr){
                    Briage.Loader.loaded_files[name]=xhr.responseText;
                    handle.call(xhr.responseText,xhr.responseText,Briage.Loader.State.FROM_SERVER);
                }
            });
        }
    };
    Briage.Loader.load_files=function(files,handle,real,no_cache){
        var r={};
        var a=0;
        var c=0;
        Briage.each(files,function(){
            a++;
        });
        if(a==0){
            handle.call(r,r);
        }
        Briage.each(files,function(k,v){
            Briage.Loader.load_file(k,v,function(file){
                r[k]=file;
                c++;
                if(a==c){
                    handle.call(r,r);
                }
            },real,no_cache);
        });
    };
    Briage.Loader.loaded_scripts={};
    Briage.Loader.load_script=function(name,url,handle,real,no_cache){
        if(!no_cache && Briage.Loader.loaded_scripts[name]){
            handle(Briage.Loader.State.FROM_CACHE);
        }else{
            var script=document.createElement("script");
            script.async=true;
            script.type="text/javascript";
            script.src=real?url:Briage.path+url;
            document.getElementsByTagName("head")[0].appendChild(script);
            script.onreadystatechange=function(){
                if(script.readyState=="loaded" || script.readyState=="complete"){
                    Briage.Loader.loaded_scripts[name]=true;
                    handle(Briage.Loader.State.FROM_SERVER);
                }
            };
            script.onload=function(){
                Briage.Loader.loaded_scripts[name]=true;
                handle(Briage.Loader.State.FROM_SERVER);
            };
        }
    };
    Briage.Loader.load_scripts=function(scripts,handle,real,no_cache){
        var a=0;
        var c=0;
        Briage.each(scripts,function(){
            a++;
        });
        if(a==0){
            handle();
        }
        Briage.each(scripts,function(k,v){
            Briage.Loader.load_script(k,v,function(){
                c++;
                if(a==c){
                    handle();
                }
            },real,no_cache);
        });
    };
    Briage.Loader.loaded_modules={};
    Briage.Loader.load_module=function(name,handle){
        name=name.replace(/^(?:Briage\.)?(.*?)(?:\.js)?$/,"Briage.$1.js");
        if(Briage.Loader.loaded_modules[name]){
            Briage.Loader.loaded_modules[name].handles.push(handle);
        }else{
            Briage.Loader.loaded_modules[name]={
                onload:function(){
                    Briage.each(Briage.Loader.loaded_modules[name].handles,function(k,v){
                        v();
                    });
                    delete Briage.Loader.loaded_modules[name];
                },
                handles:[]
            };
            Briage.Loader.loaded_modules[name].handles.push(handle);
            Briage.Loader.load_script(name,name,function(state){
                if(state==Briage.Loader.State.HAS_BEEN_LOADED){
                    Briage.Loader.loaded_modules[name].onload();
                }
            });
        }
    };
    Briage.Loader.load_modules=function(modules,handle){
        var a=0;
        var c=0;
        Briage.each(modules,function(){
            a++;
        });
        if(a==0){
            handle();
        }
        Briage.each(modules,function(k,v){
            Briage.Loader.load_module(v,function(){
                c++;
                if(a==c){
                    handle();
                }
            });
        });
    };
    Briage.use=function(modules,handle){
        if(typeof modules=="string"){
            modules=[modules];
        }
        Briage.Loader.load_modules(modules,handle);
    };
    Briage.add=function(handle,name,include){
        Briage.use(include,function(){
            handle(Briage);
            Briage.Loader.loaded_modules[name.replace(/^(?:Briage\.)?(.*?)(?:\.js)?$/,"Briage.$1.js")].onload();
        });
    };
    window.Briage=window.B=Briage;
})(window);