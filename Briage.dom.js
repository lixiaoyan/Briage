Briage.add(function(Briage){
    Briage.DOM={};
    Briage.DOM.NodeType={};
    Briage.DOM.NodeType.ELEMENT=1;
    Briage.DOM.NodeType.DOCUMENT=9;
    Briage.DOM.NodeType.TEXT=3;
    Briage.DOM.NodeType.COMMENT=8;
    Briage.DOM.Object=function($){
        if($){
            this.$=$;
        }
    };
    Briage.DOM.Object.parse=function($){
        if($){
            if($.$){
                if($ instanceof this){
                    return $;
                }else{
                    return new this($.$);
                }
            }else{
                return new this($);
            }
        }else{
            return null;
        }
    };
    Briage.DOM.Object.prototype={
        constructor:Briage.DOM.Object,
        getData:function(name){
            return this.$[name];
        },
        setData:function(name,data){
            this.$[name]=data;
        },
        getCustomData:function(name){
            if(this.getData("Briage-data")){
                return this.getData("Briage-data")[name];
            }else{
                return null;
            }
        },
        setCustomData:function(name,data){
            if(!this.getData("Briage-data")){
                this.setData("Briage-data",{});
            }
            this.getData("Briage-data")[name]=data;
        },
        removeCustomData:function(name){
            if(this.getData("Briage-data")){
                delete this.getData("Briage-data")[name];
            }
        },
        removeAllCustomData:function(){
            this.setData("Briage-data",{});
        },
        equals:function(other){
            return other && this.$==other.$;
        }
    };
    Briage.DOM.Event=function($){
        return Briage.DOM.Object.call(this,$);
    };
    Briage.DOM.Event.parse=Briage.DOM.Object.parse;
    Briage.DOM.Event.prototype=new Briage.DOM.Object();
    Briage.extend(Briage.DOM.Event.prototype,{
        constructor:Briage.DOM.Event,
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
        }
    },true,true);
    Briage.DOM.DOM=function($){
        return Briage.DOM.Object.call(this,$);
    };
    Briage.DOM.DOM.parse=Briage.DOM.Object.parse;
    Briage.DOM.DOM.prototype=new Briage.DOM.Object();
    Briage.extend(Briage.DOM.DOM.prototype,{
        constructor:Briage.DOM.DOM,
        addEventListener:function(type,handle){
            Briage.Event.addEventListener(this,type,handle);
        },
        removeEventListener:function(type,handle){
            Briage.Event.removeEventListener(this,type,handle);
        },
        removeAllEventListener:function(type){
            Briage.Event.removeAllEventListener(this,type);
        },
        dispatchEvent:function(type){
            Briage.Event.dispatchEvent(this,type);
        }
    },true,true);
    Briage.DOM.Window=function($){
        return Briage.DOM.Object.call(this,$);
    };
    Briage.DOM.Window.parse=Briage.DOM.Object.parse;
    Briage.DOM.Window.prototype=new Briage.DOM.DOM();
    Briage.extend(Briage.DOM.Window.prototype,{
        constructor:Briage.DOM.Window,
        getDocument:function(){
            return Briage.DOM.Node.parse(this.$.document);
        }
    },true,true);
    Briage.DOM.Node=function($){
        if(!$){
            return this;
        }
        switch($.nodeType){
            case Briage.DOM.NodeType.ELEMENT:
                return Briage.DOM.Element.parse($);
            case Briage.DOM.NodeType.DOCUMENT:
                return Briage.DOM.Document.parse($);
            case Briage.DOM.NodeType.TEXT:
                return Briage.DOM.Text.parse($);
            case Briage.DOM.NodeType.COMMENT:
                return Briage.DOM.Comment.parse($);
            default:
                return Briage.DOM.DOM.parse($);
        }
    };
    Briage.DOM.Node.parse=Briage.DOM.Object.parse;
    Briage.DOM.Node.prototype=new Briage.DOM.DOM();
    Briage.extend(Briage.DOM.Node.prototype,{
        constructor:Briage.DOM.Node,
        getParent:function(){
            return Briage.DOM.Node.parse(this.$.parentNode);
        },
        getDocument:function(){
            return Briage.DOM.Node.parse(this.$.ownerDocument);
        }
    },true,true);
    Briage.DOM.NodeList=function($){
        if(!(Object.prototype.toString.call($)=="[object Array]" || $.item)){
            $=[$];
        }
        var t=this.$=[];
        Briage.each($,function(k,v){
            if(!isNaN(k)){
                var c=Briage.DOM.Node.parse(v);
                if(c){
                    t.push(c);
                } 
            }
        });
    };
    Briage.DOM.NodeList.parse=Briage.DOM.Object.parse;
    Briage.DOM.NodeList.prototype={
        constructor:Briage.DOM.NodeList,
        size:function(){
            return this.$.length;
        },
        item:function(index){
            return this.$[index];
        },
        each:function(handle){
            Briage.each(this.$,handle);
        }
    };
    Briage.DOM.Element=function($){
        return Briage.DOM.Object.call(this,$);
    };
    Briage.DOM.Element.parse=Briage.DOM.Object.parse;
    Briage.DOM.Element.prototype=new Briage.DOM.Node();
    Briage.extend(Briage.DOM.Element.prototype,{
        constructor:Briage.DOM.Element,
        getAttribute:function(name){
            return this.$.getAttribute(name);
        },
        setAttribute:function(name,value){
            this.$.setAttribute(name,value);
        },
        removeAttribute:function(name){
            this.$.removeAttribute(name);
        }
    },true,true);
    Briage.DOM.Document=function($){
        return Briage.DOM.Object.call(this,$);
    };
    Briage.DOM.Document.parse=Briage.DOM.Object.parse;
    Briage.DOM.Document.prototype=new Briage.DOM.Node();
    Briage.extend(Briage.DOM.Document.prototype,{
        constructor:Briage.DOM.Document,
        getById:function(id){
            return Briage.DOM.Node.parse(this.$.getElementById(id));
        },
        getByTag:function(tag){
            return Briage.DOM.NodeList.parse(this.$.getElementsByTagName(tag));
        }
    },true,true);
    Briage.DOM.Text=function($){
        return Briage.DOM.Object.call(this,$);
    };
    Briage.DOM.Text.parse=Briage.DOM.Object.parse;
    Briage.DOM.Text.prototype=new Briage.DOM.Node();
    Briage.DOM.Comment=function($){
        return Briage.DOM.Object.call(this,$);
    };
    Briage.DOM.Comment.parse=Briage.DOM.Object.parse;
    Briage.DOM.Comment.prototype=new Briage.DOM.Node();
    Briage.window=Briage.DOM.Window.parse(window);
    Briage.document=Briage.DOM.Node.parse(document);
},"dom",["event"]);