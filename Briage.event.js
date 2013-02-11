Briage().add(function(B){
    var getType=function(type,remove){
        if(remove){
            return /^on/.test(type)?type.replace(/^on/,""):type;
        }else{
            return /^on/.test(type)?type:"on"+type;
        }
    };
    var addEventListener=(function(){
        if(window.addEventListener){
            return function(dom,type,handle){
                dom.addEventListener(getType(type,true),function(e){handle.call(dom,e);});
            };
        }else if(window.attachEvent){
            return function(dom,type,handle){
                dom.attachEvent(getType(type),function(e){handle.call(dom,e);});
            };
        }else{
            return function(dom,type,handle){
                dom[getType(type)]=function(e){handle.call(dom,e);};
            };
        }
    })();
    B.DOM.Event=new B.Class(function(){
        this._later=[];
    },{
        extend:B.DOM.Object,
        prototype:{
            returnValue:true,
            cancelBubble:false,
            preventDefault:function(stopPropagation){
                this.returnValue=false;
                if(this.$.preventDefault){
                    this.$.preventDefault();
                }else{
                    this.$.returnValue=false;
                }
                if(stopPropagation){
                    this.stopPropagation()
                }
            },
            stopPropagation:function(){
                this.cancelBubble=true;
                if(this.$.stopPropagation){
                    this.$.stopPropagation();
                }else{
                    this.$.cancelBubble=true;
                }
            },
            getPageX:function(){
                return this.$.pageX;
            },
            getPageY:function(){
                return this.$.pageY;
            },
            getPagePos:function(){
                return [this.getPageX(),this.getPageY()];
            }
        }
    });
    B.extend(B.DOM.DOM.prototype,{
        bind:function(type,handle){
            type=getType(type);
            switch(type){
                case "onload":
                {
                    if(B.document.getReadyState()=="complete"){
                        handle.call(this);
                    }else{
                        this._bind(type,handle);
                    }
                    break;
                }
                default:
                {
                    this._bind(type,handle);
                    break;
                }
            }
        },
        once:function(type,handle){
            this.bind(type,function(e){
                handle.call(this,e);
                var c=arguments.callee;
                e._later.push(function(){
                    this.unbind(type,c);
                });
            });
        },
        _bind:function(type,handle){
            type=getType(type);
            if(!this.getCustomData("event")){
                this.setCustomData("event",{});
            }
            var e=this.getCustomData("event");
            if(!e[type]){
                e[type]=[];
            }
            if(!this.getCustomData("listener")){
                this.setCustomData("listener",{});
            }
            var l=this.getCustomData("listener");
            if(!l[type]){
                var listener=function(event){
                    event=B.DOM.Event.parse(event || window.event);
                    var dom=B.DOM.Node.parse(this);
                    B.each(dom.getCustomData("event")[type],function(k,v){
                        var r=v.call(dom,event);
                        if(r===false || r===0){
                            event.returnValue=false;
                        }
                    });
                    B.each(event._later,function(){
                        this.call(dom);
                    });
                    if(!event.returnValue){
                        event.preventDefault();
                    }
                    if(event.cancelBubble){
                        event.stopPropagation();
                    }
                    return event.returnValue;
                };
                l[type]=listener;
                if(type in this.$){
                    addEventListener(this.$,type,listener);
                }else{
                    switch(type){
                        case "onready":
                            break;
                    }
                }
            }
            e[type].push(handle);
        },
        unbind:function(type,handle){
            type=getType(type);
            if(this.getCustomData("event") && this.getCustomData("event")[type]){
                B.Array.remove(this.getCustomData("event")[type],handle);
            }
        },
        unbindAll:function(type){
            type=getType(type);
            if(this.getCustomData("event")){
                this.getCustomData("event")[type]=[];
            }
        },
        fire:function(type){
            type=getType(type);
            var event=B.DOM.Event.parse({});
            if(this.getCustomData("listener") && this.getCustomData("listener")[type]){
                this.getCustomData("listener")[type].call(this,event);
            }
            if(!event.cancelBubble && this.getParent && this.getParent()){
                this.getParent().fire(type);
            }
        }
    },true,true);
},"event",["dom"]);