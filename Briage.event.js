Briage().add(function(B){
    B.Event={};
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
    B.Event.bind=function(dom,type,handle){
        type=getType(type);
        if(!dom.getCustomData("event")){
            dom.setCustomData("event",{});
        }
        var e=dom.getCustomData("event");
        if(!e[type]){
            e[type]=[];
        }
        if(!dom.getCustomData("listener")){
            dom.setCustomData("listener",{});
        }
        var l=dom.getCustomData("listener");
        if(!l[type]){
            console.log("aa");
            var listener=function(event){
                event=B.DOM.Event.parse(event || window.event);
                var dom=B.DOM.Node.parse(this);
                B.each(dom.getCustomData("event")[type],function(k,v){
                    var r=v.call(dom,event);
                    if(r===false || r===0){
                        event.returnValue=false;
                    }
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
            addEventListener(dom.$,type,listener);
        }
        e[type].push(handle);
    };
    B.Event.unbind=function(dom,type,handle){
        type=getType(type);
        if(dom.getCustomData("event") && dom.getCustomData("event")[type]){
            B.array.remove(dom.getCustomData("event")[type],handle);
        }
    };
    B.Event.unbindAll=function(dom,type){
        type=getType(type);
        if(dom.getCustomData("event")){
            dom.getCustomData("event")[type]=[];
        }
    };
    B.Event.fire=function(dom,type){
        type=getType(type);
        var event=B.DOM.Event.parse({});
        if(dom.getCustomData("listener") && dom.getCustomData("listener")[type]){
            dom.getCustomData("listener")[type].call(dom,event);
        }
        if(!event.cancelBubble && dom.getParent && dom.getParent()){
            dom.getParent().fire(type);
        }
    };
},"event",["dom"]);