Briage().add(function(B){
    B.DOM={};
    B.DOM.NodeType={};
    B.DOM.NodeType.ELEMENT=1;
    B.DOM.NodeType.DOCUMENT=9;
    B.DOM.NodeType.TEXT=3;
    B.DOM.NodeType.COMMENT=8;
    B.DOM.Object=new B.Class(function($){
        if($){
            this.$=$;
        }
    },{
        method:{
            parse:function($){
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
            }
        },
        prototype:{
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
                return this.$==other.$;
            }
        }
    });
    B.DOM.Event=new B.Class(function(){},{
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
            }
        }
    });
    B.DOM.DOM=new B.Class(function(){},{
        extend:B.DOM.Object,
        prototype:{
            bind:function(type,handle){
                B.Event.bind(this,type,handle);
            },
            unbind:function(type,handle){
                B.Event.unbind(this,type,handle);
            },
            unbindAll:function(type){
                B.Event.unbindAll(this,type);
            },
            fire:function(type){
                B.Event.fire(this,type);
            }
        }
    });
    B.DOM.Window=new B.Class(function(){},{
        extend:{
            constructor:B.DOM.Object,
            prototype:B.DOM.DOM
        },
        prototype:{
            getDocument:function(){
                return B.DOM.Node.parse(this.$.document);
            }
        }
    });
    B.DOM.Node=new B.Class(function($){
        if(!$){
            return this;
        }
        switch($.nodeType){
            case B.DOM.NodeType.ELEMENT:
                return B.DOM.Element.parse($);
            case B.DOM.NodeType.DOCUMENT:
                return B.DOM.Document.parse($);
            case B.DOM.NodeType.TEXT:
                return B.DOM.Text.parse($);
            case B.DOM.NodeType.COMMENT:
                return B.DOM.Comment.parse($);
            default:
                return B.DOM.DOM.parse($);
        }
    },{
        extend:{
            prototype:B.DOM.DOM
        },
        method:{
            parse:B.DOM.Object.parse
        },
        prototype:{
            getParent:function(){
                return B.DOM.Node.parse(this.$.parentNode);
            },
            getDocument:function(){
                return B.DOM.Node.parse(this.$.ownerDocument);
            }
        }
    });
    B.DOM.NodeList=new B.Class(function($){
        if(!(B.toString.call($)=="[object Array]" || $.item)){
            $=[$];
        }
        var t=this.$=[];
        B.each($,function(k,v){
            if(!isNaN(k)){
                var c=B.DOM.Node.parse(v);
                if(c){
                    t.push(c);
                } 
            }
        });
    },{
        method:{
            parse:B.DOM.Object.parse
        },
        prototype:{
            size:function(){
                return this.$.length;
            },
            item:function(index){
                return this.$[index];
            },
            each:function(handle){
                B.each(this.$,handle);
            }
        }
    });
    B.DOM.Element=new B.Class(function(){},{
        extend:{
            constructor:B.DOM.Object,
            prototype:B.DOM.Node
        },
        prototype:{
            getAttr:function(name){
                return this.$.getAttribute(name);
            },
            setAttr:function(name,value){
                this.$.setAttribute(name,value);
            },
            getId:function(){
                return this.getAttr("id");
            },
            setId:function(id){
                this.setAttr("id",id);
            },
            getStyle:function(name){
                return this.getData("style")[name];
            },
            setStyle:function(name,value){
                this.getData("style")[name]=value;
            },
            removeAttr:function(name){
                this.$.removeAttribute(name);
            },
            append:function(child){
                this.$.appendChild(child.$);
            },
            getHTML:function(){
                return this.getAttr("innerHTML");
            },
            setHTML:function(html){
                this.setAttr("innerHTML",html);
            },
            load:function(url,handle,real,noCache){
                var self=this;
                handle=B.getHandle(handle);
                B.Loader.loadFile(url,url,function(html){
                    self.setHTML(html);
                    handle();
                },real,noCache);
            }
        }
    });
    B.DOM.Document=new B.Class(function(){},{
        extend:{
            constructor:B.DOM.Object,
            prototype:B.DOM.Node
        },
        prototype:{
            getById:function(id){
                return B.DOM.Node.parse(this.$.getElementById(id));
            },
            getByTag:function(tag){
                return B.DOM.NodeList.parse(this.$.getElementsByTagName(tag));
            },
            create:function(tag){
                return B.DOM.Node.parse(this.$.createElement(tag));
            },
            getBody:function(){
                return B.DOM.Node.parse(this.$.body);
            },
            getHead:function(){
                return this.getByTag("head").item(0);
            }
        }
    });
    B.DOM.Text=new B.Class(function(){},{
        extend:{
            constructor:B.DOM.Object,
            prototype:B.DOM.Node
        }
    });
    B.DOM.Comment=new B.Class(function(){},{
        extend:{
            constructor:B.DOM.Object,
            prototype:B.DOM.Node
        }
    });
    B.window=B.DOM.Window.parse(window);
    B.document=B.DOM.Node.parse(document);
},"dom",["event"]);