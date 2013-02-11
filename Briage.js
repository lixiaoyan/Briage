(function(window){
    var B={};
    B.toString=Object.prototype.toString;
    /**
     * 当表达式的值为假时，抛出异常。
     * @param {Boolean} bool 表达式
     * @param {String}  msg  异常信息
     */
    B.assert=function(bool,msg){
        if(!bool){
            B.error(msg);
        }
    };
    /**
     * 在B.each中使用以跳出循环。
     * @class B.Break
     * @constructor
     */
    B.Break=function(){};
    /**
     * 在B.each中使用以继续循环。
     * @class B.Continue
     * @constructor
     */
    B.Continue=function(){};
    /**
     * 抛出异常。
     * @param  {String} msg 异常信息
     */
    B.error=function(msg){
        throw new Error(msg);
    };
    /**
     * 迭代一个对象/数组。
     * @param {Object|Array} object    被迭代的对象/数组
     * @param {Boolean}      handle    回调函数
     * @param {Boolean}      prototype 是否迭代原型链内的属性
     * @param {Boolean}      ignore    是否忽略值为undefined的属性
     */
    B.each=function(object,handle,prototype,ignore){
        if(object){
            if(B.toString.call(object)=="[object Array]"){
                for(var key=0,len=object.length;key<len;key++){
                    if(!ignore || object[key]!==undefined){
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
            }else{
                for(var key in object){
                    if(prototype || !object.hasOwnProperty || object.hasOwnProperty(key)){
                        if(!ignore || object[key]!==undefined){
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
            }
        }
    };
    /**
     * 将提供者的属性合并到接受者上。
     * @param  {Object|Array} receiver  属性的接受者
     * @param  {Object|Array} supplier  属性的提供者
     * @param  {Boolean}      deepclone 是否深度拷贝属性
     * @param  {Boolean}      overwrite 是否覆盖原有属性
     * @param  {Boolean}      prototype 是否拷贝原型链属性
     * @param  {Boolean}      ignore    是否忽略值为undefined的属性
     * @return {Object|Array}           合并得到的对象/数组
     */
    B.extend=function(receiver,supplier,deepclone,overwrite,prototype,ignore){
        if(receiver && supplier){
            B.each(supplier,function(k,v){
                if(overwrite || !(k in receiver)){
                    if(deepclone){
                        if(B.toString.call(v)=="[object Object]" && !(v.toString && v.toString()=="[object]")){
                            receiver[k]=B.extend({},v,deepclone,overwrite,prototype,ignore);
                        }else if(B.toString.call(v)=="[object Array]"){
                            receiver[k]=B.extend([],v,deepclone,overwrite,prototype,ignore);
                        }else{
                            receiver[k]=v;
                        }
                    }else{
                        receiver[k]=v;
                    }
                }
            },prototype,ignore);
            return receiver;
        }else{
            return null;
        }
    };
    /**
     * 深度拷贝一个对象/数组。
     * @param  {Object|Array} object    需要深度拷贝的对象
     * @param  {Boolean}      prototype 是否深度拷贝原型链
     * @return {Object|Array}           深度拷贝得到的对象/数组
     */
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
    /**
     * 根据参数生成一个类。
     * @class B.Class
     * @constructor
     * @param  {Function} constructor 类的构造函数
     * @param  {Object}   config      类的参数
     * @return {Function}             生成的类
     * @example
     *     var d=new B.Class(function(){
     *         //构造函数
     *     },{
     *         extend:{
     *             constructor:a, //继承类a的构造函数及静态属性
     *             prototype:b //继承类b的实例属性
     *         },
     *         extend:c, //继承类c的构造函数、静态属性及实例属性
     *         method:{
     *             //扩展的静态属性
     *         },
     *         prototype:{
     *             //扩展的实例属性
     *         }
     *     });
     */
    B.Class=function(constructor,config){
        constructor=constructor || function(){};
        config=config || {};
        var subClass;
        var superClass=[];
        if(config.extend){
            if(B.toString.call(config.extend)=="[object Object]"){
                if(config.extend.prototype || config.extend.constructor){
                    if(config.extend.constructor){
                        subClass=function(){
                            config.extend.constructor.apply(this,arguments);
                            var r=constructor.apply(this,arguments);
                            if(r){
                                return r;
                            }
                        };
                        B.extend(subClass,config.extend.constructor,true,true);
                        superClass.push(config.extend.constructor);
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
                        superClass.push(config.extend.prototype);
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
                superClass.push(config.extend);
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
        subClass.superClass=superClass;
        subClass.prototype.super=function(name){
            var self=this;
            var args=Array.prototype.slice.call(arguments,1);
            B.each(subClass.superClass,function(k,v){
                if(v.prototype[name]){
                    v.prototype[name].apply(self,args);
                }
            });
        };
        return subClass;
    };
    /**
     * 生成一个命名空间。
     * @param  {String}   namespace 命名空间的路径
     * @param  {Function} handle    回调函数
     * @example
     *     B.namespace("B.C.D",function(){
     *         this.E=12;
     *     });
     *     alert(B.C.D.E); //输出12
     */
    B.namespace=function(namespace,handle){
        namespace=namespace.replace(/^B\./,"");
        var names=namespace.split(".");
        var temp=this;
        B.each(names,function(){
            if(!temp[this]){
                temp[this]={};
            }
            temp=temp[this];
        });
        if(handle){
            handle.call(temp);
        }
    };
    /**
     * 将对象转换成URL参数。
     * @param  {Object} param 需要转换的对象
     * @return {String}       转换得到的字符串
     */
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
    /**
     * Ajax加载URL。
     * @param  {[type]} config 配置对象
     * @return {[type]}        XMLHttpRequest对象
     */
    B.ajax=function(config){
        config=B.extend({
            type:"GET",
            url:window.location.href,
            data:{},
            contentType:"application/x-www-form-urlencoded",
            async:true,
            success:function(){},
            error:function(){}
        },config,true,true);
        config.xhr=config.xhr || window.XMLHttpRequest?new window.XMLHttpRequest():new window.ActiveXObject("Microsoft.XMLHTTP");
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
    /**
     * 判断一个值在数组中的索引。
     * @param  {Array}  arr   数组
     * @param  {Mixed}  value 值
     * @return {Number}       索引
     */
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
    /**
     * 删除数组中值为value的项。
     * @param  {Array} arr   数组
     * @param  {Mixed} value 值
     */
    B.Array.remove=function(arr,value){
        var index;
        if((index=B.Array.indexOf(arr,value))!=-1){
            arr.splice(index,1);
        }
    };
    B.String={};
    /**
     * 根据参数格式化字符串。
     * @param  {String} str 格式字符串
     * @return {String}     格式化后的字符串
     */
    B.String.format=function(str){
        B.each(Array.prototype.slice.call(arguments,1),function(k,v){
            str=str.replace(new RegExp("\\{"+k+"\\}","g"),v);
        });
        return str;
    };
    /**
     * 将指定长度的字符串填充为指定字符
     * @param  {Number} length 长度
     * @param  {String} fill   字符
     * @return {String}        填充后的字符串
     */
    B.String.fill=function(length,fill){
        length=length || 0;
        fill=fill || " ";
        var add=[];
        for(var i=0;i<length;i++){
            add.push(fill);
        }
        return add.join("");
    };
    /**
     * 将给定字符串的左边填充指定字符直到字符串长度为length。
     * @param  {String} str    原字符串
     * @param  {Number} length 长度
     * @param  {String} fill   字符
     * @return {String}        填充后的字符串
     */
    B.String.leftFill=function(str,length,fill){
        return B.String.fill(length-str.length,fill)+str;
    };
    /**
     * 将给定字符串的右边填充指定字符直到字符串长度为length。
     * @param  {String} str    原字符串
     * @param  {Number} length 长度
     * @param  {String} fill   字符
     * @return {String}        填充后的字符串
     */
    B.String.rightFill=function(){
        return str+B.String.fill(length-str.length,fill);
    };
    /**
     * 将字符串两端的空白字符删去。
     * @param  {String} str 原字符串
     * @return {String}     生成的字符串
     */
    B.String.trim=function(str){
        return B.String.trimLeft(B.String.trimRight(str));
    };
    /**
     * 将字符串左端的空白字符删去。
     * @param  {String} str 原字符串
     * @return {String}     生成的字符串
     */
    B.String.trimLeft=function(str){
        return str.replace(/^\s+/,"");
    };
    /**
     * 将字符串右端的空白字符删去。
     * @param  {String} str 原字符串
     * @return {String}     生成的字符串
     */
    B.String.trimRight=function(str){
        return str.replace(/\s+$/,"");
    };
    /**
     * 替换字符串。
     * @param  {String|Array}          arr 原字符串/字符串数组
     * @param  {String|Array|Function} a   要被替换的字符串/字符串数组/自定义替换方法
     * @param  {String|Array}          b   要替换为的字符串/字符串数组
     * @return {String}                    替换得到的字符串
     */
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
    B.later=function(timeout,handle,context){
        var args=Array.prototype.slice.call(arguments,3);
        setTimeout(function(){
            handle.apply(context,args);
        },timeout);
    };
    (function(B){
        var path="";
        var min;
        var match;
        var scripts=document.getElementsByTagName("script");
        B.each(scripts,function(k,v){
            var src=v.src;
            if(match=src.match(/Briage(\.min)?\.js$/)){
                path=src.replace(match[0],"");
                if(match[1]){
                    min=true;
                }else{
                    min=false;
                }
                throw new B.Break();
            }
        });
        B.path=path;
        B.min=min;
    })(B);
    B.Loader={};
    B.Loader.State={};
    B.Loader.State.FROM_CACHE=0;
    B.Loader.State.FROM_SERVER=1;
    B.Loader.State.HAS_BEEN_LOADED=0;
    B.Loader.State.JUST_LOADED=1;
    var loadedImages={};
    B.Loader.loadImage=function(name,url,handle,real,noCache){
        if(!noCache && loadedImages[name]){
            if(handle){
                handle.call(loadedImages[name],loadedImages[name],B.Loader.State.FROM_CACHE);
            }
        }else{
            var image=new Image();
            image.src=real?url:B.path+url;
            image.onload=function(){
                loadedImages[name]=image;
                if(handle){
                    handle.call(image,image,B.Loader.State.FROM_SERVER);
                }
            }
        }
    };
    B.Loader.loadImages=function(images,handle,real,noCache){
        var r={};
        var a=0;
        var c=0;
        B.each(images,function(){
            a++;
        });
        if(a==0){
            if(handle){
                handle.call(r,r);
            }
        }
        B.each(images,function(k,v){
            B.Loader.loadImage(k,v,function(image){
                r[k]=image;
                c++;
                if(a==c){
                    if(handle){
                        handle.call(r,r);
                    }
                }
            },real,noCache);
        });
    };
    var loadedFiles={};
    B.Loader.loadFile=function(name,url,handle,real,noCache){
        if(!noCache && loadedFiles[name]){
            if(handle){
                handle.call(loadedFiles[name],loadedFiles[name],B.Loader.State.FROM_CACHE);
            }
        }else{
            B.ajax({
                url:(real?url:B.path+url),
                success:function(xhr){
                    loadedFiles[name]=xhr.responseText;
                    if(handle){
                        handle.call(xhr.responseText,xhr.responseText,B.Loader.State.FROM_SERVER);
                    }
                }
            });
        }
    };
    B.Loader.loadFiles=function(files,handle,real,noCache){
        var r={};
        var a=0;
        var c=0;
        B.each(files,function(){
            a++;
        });
        if(a==0){
            if(handle){
                handle.call(r,r);
            }
        }
        B.each(files,function(k,v){
            B.Loader.loadFile(k,v,function(file){
                r[k]=file;
                c++;
                if(a==c){
                    if(handle){
                        handle.call(r,r);
                    }
                }
            },real,noCache);
        });
    };
    var loadedScripts={};
    B.Loader.loadScript=function(name,url,handle,real,noCache){
        if(!noCache && loadedScripts[name]){
            if(handle){
                handle(B.Loader.State.FROM_CACHE);
            }
        }else{
            var script=document.createElement("script");
            script.async=true;
            script.type="text/javascript";
            script.src=real?url:B.path+url;
            document.getElementsByTagName("head")[0].appendChild(script);
            script.onreadystatechange=function(){
                if(script.readyState=="loaded" || script.readyState=="complete"){
                    loadedScripts[name]=true;
                    if(handle){
                        handle(B.Loader.State.FROM_SERVER);
                    }
                }
            };
            script.onload=function(){
                loadedScripts[name]=true;
                if(handle){
                    handle(B.Loader.State.FROM_SERVER);
                }
            };
        }
    };
    B.Loader.loadScripts=function(scripts,handle,real,noCache){
        var a=0;
        var c=0;
        B.each(scripts,function(){
            a++;
        });
        if(a==0){
            if(handle){
                handle();
            }
        }
        B.each(scripts,function(k,v){
            B.Loader.loadScript(k,v,function(){
                c++;
                if(a==c){
                    if(handle){
                        handle();
                    }
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
        if(B.min){
            name=name.replace(/^(?:Briage\.)?(.*?)(?:\.min)?(?:\.js)?$/,"Briage.$1.min.js");
        }else{
            name=name.replace(/^(?:Briage\.)?(.*?)(?:\.min)?(?:\.js)?$/,"Briage.$1.js");
        }
        if(loadedModules[name]){
            if(handle){
                loadedModules[name].handles.push(handle);
            }
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
            if(handle){
                loadedModules[name].handles.push(handle);
            }
            B.Loader.loadScript(name,name,function(state){
                if(state==B.Loader.State.HAS_BEEN_LOADED){
                    loadedModules[name].onload();
                }
            });
        }
    };
    B.Loader.loadModules=function(modules,handle){
        var a=0;
        var c=0;
        B.each(modules,function(){
            a++;
        });
        if(a==0){
            if(handle){
                handle();
            }
        }
        B.each(modules,function(k,v){
            B.Loader.loadModule(v,function(){
                c++;
                if(a==c){
                    if(handle){
                        handle();
                    }
                }
            });
        });
    };

    var Briage=new B.Class(function(){
        if(!(this instanceof Briage)){
            return new Briage();
        }
        return this;
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
                        handle=null;
                    }else{
                        if(typeof arguments[1]=="function"){
                            handle=arguments[1];
                        }else{
                            handle=null;
                        }
                    }
                }else{
                    if(typeof arguments[length-1]=="function"){
                        modules=Array.prototype.slice.call(arguments,0,-1);
                        handle=arguments[length-1];
                    }else{
                        modules=arguments;
                        handle=null;
                    }
                }
                B.Loader.loadModules(modules,function(){
                    if(handle){
                        handle(B.deepclone(B,true));
                    }
                });
            },
            add:function(handle,name,include,resource){
                if(B.min){
                    name=name.replace(/^(?:Briage\.)?(.*?)(?:\.min)?(?:\.js)?$/,"Briage.$1.min.js");
                }else{
                    name=name.replace(/^(?:Briage\.)?(.*?)(?:\.min)?(?:\.js)?$/,"Briage.$1.js");
                }
                resource=resource || {};
                this.use(include,function(){
                    B.Loader.loadScripts(resource.scripts,function(){
                        var event=new Briage.Event(name);
                        handle(B,event);
                        if(!event.isWaiting()){
                            event.end();
                        }
                    });
                    if(resource.images){
                        var images={};
                        B.each(resource.images,function(k,v){
                            images[v]=v;
                        });
                        B.Loader.loadImages(images);
                    }
                    if(resource.styleSheets){
                        var styleSheets={};
                        B.each(resource.styleSheets,function(k,v){
                            styleSheets[v]=v;
                        });
                        B.Loader.loadStyleSheets(styleSheets);
                    }
                });
            }
        }
    });
    Briage.Event=new B.Class(function(name){
        this._name=name;
    },{
        prototype:{
            _waiting:false,
            _complete:false,
            isWaiting:function(){
                return this._waiting;
            },
            wait:function(){
                this._waiting=true;
            },
            end:function(){
                if(!this._complete){
                    if(loadedModules[this._name]){
                        loadedModules[this._name].onload();
                    }
                    this._complete=true;
                }
            }
        }
    });
    window.Briage=Briage;
})(window);