(function(window){
    var B={};
    B.toString=Object.prototype.toString;
    B.error=function(msg){
        throw msg;
    };
    B.assert=function(bool,msg){
        !bool && B.error(msg);
    };
    B.Break=function(){};
    B.each=function(object,callback,prototype,ignore){
        if(object){
            if(B.toString.call(object)=="[object Array]"){
                for(var key=0,len=object.length;key<len;key++){
                    if(!ignore || object[key]!==undefined){
                        try{
                            callback.call(object[key],key,object[key]);
                        }catch(e){
                            if(e instanceof B.Break){
                                break;
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
                                callback.call(object[key],key,object[key]);
                            }catch(e){
                                if(e instanceof B.Break){
                                    break;
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
    B.some=function(object,callback,prototype,ignore){
        var ret=false;
        B.each(object,function(key,value){
            if(callback.call(value,key,value)){
                ret=true;
                throw new B.Break();
            }
        },prototype,ignore);
        return ret;
    };
    B.any=function(object,callback,prototype,ignore){
        var ret=true;
        B.each(object,function(key,value){
            if(!callback.call(value,key,value)){
                ret=false;
                throw new B.Break();
            }
        },prototype,ignore);
        return ret;
    };
    B.filter=function(object,callback,prototype,ignore){
        var obj={};
        B.each(object,function(key,value){
            if(callback.call(value,key,value)){
                obj[key]=value;
            }
        },prototype,ignore);
        return obj;
    };
    B.map=function(object,callback,prototype,ignore){
        var obj={};
        B.each(object,function(key,value){
            obj[key]=callback.call(value,key,value);
        },prototype,ignore);
        return obj;
    };
    B.extend=function(receiver,supplier,deepclone,overwrite,prototype,ignore){
        if(receiver && supplier){
            B.each(supplier,function(k,v){
                if(overwrite || !(k in receiver)){
                    if(deepclone && v){
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
    B.proxy=(function(){
        if(Function.prototype.bind){
            return function(func,context){
                return func.bind(context);
            };
        }else{
            return function(func,context){
                return function(){
                    return func.apply(context,arguments);
                }
            }
        }
    })();
    B.later=function(timeout,callback,context){
        if(arguments.length<3){
            context=callback;
            callback=timeout;
            timeout=0;
        }
        return setTimeout(B.proxy(callback,context),timeout);
    };
    B.Class=function(constructor,config,method){
        constructor=constructor || function(){};
        if(arguments.length==2){
            method=config;
            config={};
        }else{
            config=config || {};
        }
        var subClass;
        if(config.extend){
            subClass=function(){
                this._superClass.apply(this,arguments);
                return constructor.apply(this,arguments);
            };
            B.extend(subClass,config.extend,false,true);
            subClass.prototype=new config.extend();
            subClass.prototype._superClass=config.extend;
        }else{
            subClass=constructor;
            subClass._superClass=Object;
        }
        subClass.callSuper=function(name){
            if(this._superClass[name]){
                this._superClass[name].apply(this,Array.prototype.slice.call(arguments,1));
            }
        };
        subClass.constructor=subClass;
        B.extend(subClass.prototype,method,true,true);
        return subClass;
    };
    B.namespace=function(namespace,callback){
        namespace=namespace.replace(/^B\./,"");
        var names=namespace.split(".");
        var temp=this;
        B.each(names,function(index,name){
            if(!temp[name]){
                temp[name]={};
            }
            temp=temp[name];
        });
        if(callback){
            callback.call(temp);
        }
    };
    B.Array={};
    B.Array.find=(function(){
        if(Array.prototype.indexOf){
            return function(arr,value){
                return arr.indexOf(value);
            };
        }else{
            return function(arr,value){
                var index=-1;
                B.some(arr,function(k,v){
                    if(v===value){
                        index=k;
                        return true;
                    }
                });
                return index;
            };
        }
    })();
    B.Array.remove=function(arr,value){
        var index;
        if((index=B.Array.find(arr,value))!=-1){
            arr.splice(index,1);
            return true;
        }
        return false;
    };
    B.Array.contains=function(a,b){
        if(!b.length){
            return true;
        }
        if(!a.length){
            return false;
        }
        return B.any(b,function(index,value){
            return B.Array.find(a,value)!=-1;
        });
    };
    B.String={};
    B.String.format=function(str){
        B.each(Array.prototype.slice.call(arguments,1),function(k,v){
            str=str.replace(new RegExp("\\{"+k+"\\}","g"),v);
        });
        return str;
    };
    B.String.fill=function(length,fill){
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
    B.String.trim=(function(){
        if(String.prototype.trim){
            return function(str){
                return str.trim();
            };
        }else{
            return function(str){
                return B.String.trimLeft(B.String.trimRight(str));
            };
        }
    })();
    B.String.trimLeft=(function(){
        if(String.prototype.trimLeft){
            return function(str){
                return str.trimLeft();
            };
        }else{
            return function(str){
                return str.replace(/^\s+/,"");
            };
        }
    })();
    B.String.trimRight=(function(){
        if(String.prototype.trimRight){
            return function(str){
                return str.trimRight();
            };
        }else{
            return function(str){
                return str.replace(/\s+$/,"");
            }
        }
    })();
    B.EventQueue=new B.Class(function(){
        this._timer=-1;
        this._queue=[];
    },{
        push:function(func,context){
            this._queue.push(B.proxy(func,context));
            if(this._timer==-1){
                this._timer=B.later(function(){
                    while(!this.isEmpty()){
                        this.pop()();
                    }
                    this._timer=-1;
                },this);
            }
        },
        pop:function(){
            return this._queue.shift();
        },
        isEmpty:function(){
            return this._queue.length==0;
        }
    });
    B.MainQueue=new B.EventQueue();
    B.EventDispatcher=new B.Class(function(){
        this._listeners={};
        this._events={};
    },{
        on:function(type,handler){
            if(!this._listeners[type]){
                this._listeners[type]=function(){
                    var args=arguments;
                    B.each(this._events[type],B.proxy(function(index,handler){
                        handler.apply(this,args);
                    },this));
                }
            }
            if(!this._events[type]){
                this._events[type]=[];
            }
            this._events[type].push(handler);
            return this;
        },
        off:function(type,handler){
            if(this._events[type]){
                B.Array.remove(this._events[type],handler);
                if(this._events[type].length==0){
                    delete this._events[type];
                    delete this._listeners[type];
                }
            }
            return this;
        },
        once:function(type,handler){
            var triggered=false;
            var proxy=function(){
                if(!triggered){
                    handler.apply(this,arguments);
                    triggered=true;
                    B.later(function(){
                        this.off(type,proxy);
                    },this);
                }
            };
            this.on(type,proxy);
            return this;
        },
        trigger:function(type){
            var args=Array.prototype.slice.call(arguments,1);
            B.MainQueue.push(function(){
                var split=type.split(".");
                var type_name=split[0];
                var type_args=split.slice(1);
                B.each(this._listeners,B.proxy(function(name,func){
                    var arr=name.split(".");
                    if(arr[0]==type_name && B.Array.contains(arr.slice(1),type_args)){
                        func.apply(this,args);
                    }
                },this));
            },this);
            return this;
        }
    });
    B.Request=new B.Class(function(){
        var xhr;
        var self=this;
        if(window.XMLHttpRequest){
            xhr=this.$=new XMLHttpRequest();
        }else{
            xhr=this.$=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4){
                if((xhr.status>=200 && xhr.status<300) || xhr.status==304 || xhr.status==1223){
                    self.responseText=xhr.responseText;
                    self.trigger("success",xhr.responseText,xhr);
                }else{
                    self.trigger("failure",xhr);
                }
                self.trigger("complete",xhr);
            }
        };
    },{
        extend:B.EventDispatcher
    },{
        responseText:null,
        open:function(method,url,async,username,password){
            this.$.open(method,url,async,username,password);
        },
        send:function(body){
            try{
                this.$.send(body);
            }catch(e){
            }
        },
        setRequestHeader:function(name,value){
            this.$.setRequestHeader(name,value);
        },
        abort:function(){
            this.$.abort();
        }
    });
    B.Request.param=function(param){
        if(param.constructor==String){
            return param;
        }
        var arr=[];
        B.each(param,function(key,value){
            arr.push(encodeURIComponent(key)+"="+encodeURIComponent(value));
        });
        return arr.join("&");
    };
    B.ajax=B.Request.ajax=function(url,config){
        var xhr=new B.Request();
        config=B.extend({
            type:"GET",
            data:{},
            contentType:"application/x-www-form-urlencoded",
            async:true
        },config || {},true,true);
        config.data=B.Request.param(config.data);
        config.type=config.type.toUpperCase();
        if(config.data && config.type=="GET"){
            url+=(/\?/.test(url)?"&":"?")+config.data;
        }
        xhr.open(config.type,url,config.async);
        xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
        xhr.setRequestHeader("Content-Type",config.contentType);
        xhr.send(config.type=="GET"?null:config.data);
        return xhr;
    };
    var _Briage=new (new B.Class(function(){
        this.on("end",function(){
            if(this.queue.length && !this.queue[0].length){
                this.queue.splice(0,1);
                if(this.queue.length){
                    if(this.queue[0].length){
                        B.each(this.queue[0],B.proxy(function(index,func){
                            func.call(this);
                        },this));
                    }else{
                        this.trigger("end");
                    }
                }
                if(this.queue.length<2){
                    this.waiting=false;
                }
            }
        });
    },{
        extend:B.EventDispatcher
    },{
        defaultConfig:(function(B,doc){
            var path="";
            var min=false;
            var scripts=doc.getElementsByTagName("script");
            B.some(scripts,function(index,dom){
                var src=dom.src;
                var match;
                if(match=/Briage(\.min)?\.js$/.exec(src)){
                    path=src.replace(match[0],"");
                    if(match[1]){
                        min=true;
                    }
                    return true;
                }
            });
            return {
                path:path,
                min:min
            };
        })(B,document),
        config:null,
        queue:[],
        waiting:false,
        loaded:{},
        enqueue:function(func){
            if(!this.queue.length){
                this.queue.push([]);
            }
            this.queue[this.queue.length-1].push(func);
        },
        remove:function(func){
            B.some(this.queue,function(index,list){
                return B.Array.remove(list,func);
            });
        },
        exec:function(func){
            this.enqueue(func);
            if(!this.waiting){
                func.call(this);
            }
        },
        use:function(){
            var length=arguments.length;
            if(!length){
                return this;
            }
            var handler,modules;
            if(typeof arguments[length-1]=="function"){
                handler=arguments[length-1];
                modules=Array.prototype.slice.call(arguments,0,-1);
            }else{
                handler=null;
                modules=Array.prototype.slice.call(arguments,0);
            }
            this.exec(function(){
                var func=arguments.callee;
                this.loadModules(modules,function(){
                    if(handler){
                        B.MainQueue.push(function(){
                            handler.call(B,B);
                        });
                    }
                    this.remove(func);
                    this.trigger("end");
                },function(){
                    this.remove(func);
                    this.trigger("end");
                });
            });
            return this;
        },
        add:function(handler,name,include){
            var config=_Briage.defaultConfig || _Briage.config;
            if(config.min){
                name=name.replace(/^(?:Briage\.)?(.*?)(?:\.min)?(?:\.js)?$/,"Briage.$1.min.js");
            }else{
                name=name.replace(/^(?:Briage\.)?(.*?)(?:\.min)?(?:\.js)?$/,"Briage.$1.js");
            }
            var self=this;
            this.loadModules(include,function(){
                var event=new _Briage.Event(name);
                try{
                    handler.call(B,B,event);
                    if(!event.waiting){
                        event.end();
                    }
                }catch(e){
                    self.trigger("failed."+name);
                }
            },function(){
                self.trigger("failed."+name);
            });
            return this;
        },
        loadModules:function(modules,success,failure){
            if(modules && modules.length){
                var all=modules.length;
                var count=0;
                var self=this;
                B.each(modules,function(index,name){
                    self.loadModule(name,function(){
                        count++;
                        if(count==all){
                            success.call(this);
                        }
                    },function(){
                        failure.call(this);
                    });
                });
            }else{
                success.call(this);
            }
        },
        loadModule:function(name,success,failure){
            var self=this;
            new _Briage.Loader(name).on("success",function(){
                success.call(self);
            }).on("failure",function(){
                failure.call(self);
            });
        },
        setConfig:function(config){
            this.exec(function(){
                if(config){
                    this.config=B.extend(B.extend({},this.defaultConfig,true,true),config,true,true);
                }else{
                    this.config=null;
                }
                this.remove(arguments.callee);
                this.trigger("end");
            });
            return this;
        },
        wait:function(){
            if(this.queue.length && this.queue[this.queue.length-1].length){
                this.waiting=true;
                this.queue.push([]);
            }
            return this;
        },
        get:function(){
            return B;
        }
    }));
    _Briage.Event=new B.Class(function(name){
        this.name=name;
    },{
        complete:false,
        waiting:false,
        wait:function(){
            this.waiting=true;
        },
        end:function(){
            _Briage.loaded[this.name]=4;
            _Briage.trigger("finished."+this.name);
        }
    });
    _Briage.Loader=new B.Class(function(name){
        var config=_Briage.defaultConfig || _Briage.config;
        if(config.min){
            name=name.replace(/^(?:Briage\.)?(.*?)(?:\.min)?(?:\.js)?$/,"Briage.$1.min.js");
        }else{
            name=name.replace(/^(?:Briage\.)?(.*?)(?:\.min)?(?:\.js)?$/,"Briage.$1.js");
        }
        var self=this;
        if(_Briage.loaded[name]==4){
            this.trigger("success");
        }else if(_Briage.loaded[name]==0 || _Briage.loaded[name]==undefined){
            var path=config.path+name;
            _Briage.loaded[name]=1;
            B.ajax(path).on("success",function(text){
                _Briage.loaded[name]=2;
                B.later(function(){
                    _Briage.loaded[name]=3;
                    _Briage.once("finished."+name,function(){
                        _Briage.loaded[name]=4;
                        self.trigger("success");
                    }).once("failed."+name,function(){
                        self.trigger("failure");
                    });
                    try{
                        window.eval(text);
                    }catch(e){
                        self.trigger("failure");
                        B.error(e);
                    }
                });
            }).on("failure",function(){
                self.trigger("failure");
            });
        }else{
            _Briage.once("finished."+name,function(){
                _Briage.loaded[name]=4;
                self.trigger("success");
            }).once("failed."+name,function(){
                self.trigger("failure");
            });
        }
    },{
        extend:B.EventDispatcher
    },{});
    var Briage=function(config){
        if(config){
            _Briage.setConfig(config);
        }
        return _Briage;
    };
    window.Briage=Briage;
})(window);