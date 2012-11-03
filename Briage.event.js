Briage.add(function(Briage){
    Briage.Event={};
    Briage.Event.getType=function(type){
        return /^on/.test(type)?type:"on"+type;
    };
    Briage.Event.addEventListener=function(dom,type,handle){
        type=Briage.Event.getType(type);
        if(!dom.getCustomData("event")){
            dom.setCustomData("event",{});
        }
        var e=dom.getCustomData("event");
        if(!e[type]){
            e[type]=[];
        }
        if(!dom.$[type]){
            dom.$[type]=function(event){
                event=Briage.DOM.Event.parse(event || window.event);
                var dom=Briage.DOM.Node.parse(this);
                Briage.each(dom.getCustomData("event")[type],function(k,v){
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
        }
        e[type].push(handle);
    };
    Briage.Event.removeEventListener=function(dom,type,handle){
        type=Briage.Event.getType(type);
        if(dom.getCustomData("event") && dom.getCustomData("event")[type]){
            Briage.array.remove(dom.getCustomData("event")[type],handle);
        }
    };
    Briage.Event.removeAllEventListener=function(dom,type){
        type=Briage.Event.getType(type);
        if(dom.getCustomData("event")){
            dom.getCustomData("event")[type]=[];
        }
    };
    Briage.Event.dispatchEvent=function(dom,type){
        type=Briage.Event.getType(type);
        if(dom.$["on"+type]){
            dom.$["on"+type].call(dom);
        }
    };
},"event",[]);