Briage().add(function(B){
    B.DOM={};
    B.DOM.NodeType={};
    B.DOM.NodeType.ELEMENT=1;
    B.DOM.NodeType.DOCUMENT=9;
    B.DOM.NodeType.TEXT=3;
    B.DOM.NodeType.COMMENT=8;
    B.DOM.Object=new B.Class(function($){
        this.$=$;
    },{
        method:{
            parse:function($){
                var args=Array.prototype.slice.call(arguments,1);
                if($){
                    if($.$){
                        if($ instanceof this){
                            return $;
                        }else{
                            return new this($.$,args);
                        }
                    }else{
                        return new this($,args);
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
                return other && this.$==other.$;
            }
        }
    });
    B.DOM.Selection=new B.Class(function($,document){
        this.document=B.DOM.Node.parse(document);
    },{
        extend:B.DOM.Object,
        prototype:{
            getRangeList:function(){
                var ranges=[];
                for(var i=0,len=this.getRangeCount();i<len;i++){
                    ranges.push(this.getRangeAt(i));
                }
                return B.DOM.RangeList.parse(ranges,this.document);
            },
            getRangeCount:function(){
                return this.$.rangeCount===undefined?1:this.$.rangeCount;
            },
            getRangeAt:function(index){
                index=index || 0;
                if(this.$.getRangeAt){
                    return B.DOM.Range.parse(this.$.getRangeAt(index),this.document);
                }else{
                    var range=this.document.$.createRange();
                    range.setStart(this.$.anchorNode,this.$.anchorOffset);
                    range.setEnd(this.$.focusNode,this.$.focusOffset);
                    return B.DOM.Range.parse(range,this.document);
                }
            }
        }
    });
    B.DOM.Range=new B.Class(function($){},{
        extend:B.DOM.Object,
        prototype:{

        }
    });
    B.DOM.RangeList=new B.Class(function($){},{
        extend:B.DOM.Object,
        prototype:{

        }
    });
    B.DOM.DOM=new B.Class(function(){},{
        extend:B.DOM.Object,
        prototype:{
            
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
            },
            getViewWidth:function(){
                return this.getDocument().getBody().getClientWidth() 
                    || this.getDocument().getDocumentElement().getClientWidth() 
                    || 0;
            },
            getViewHeight:function(){
                return this.getDocument().getBody().getClientHeight() 
                    || this.getDocument().getDocumentElement().getClientHeight() 
                    || 0;
            },
            getViewSize:function(){
                return [this.getViewWidth(),this.getViewHeight()];
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
        if(!(B.toString.call($)=="[object Array]" || $.length)){
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
            removeAttr:function(name){
                this.$.removeAttribute(name);
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
            setStyles:function(styles){
                var self=this;
                B.each(styles,function(k,v){
                    self.setStyle(k,v);
                });
            },
            setWidth:function(width){
                if(width.constructor==Number){
                    width=width+"px";
                }
                this.setStyle("width",width);
            },
            setHeight:function(height){
                if(height.constructor==Number){
                    height=height+"px";
                }
                this.setStyle("height",height)
            },
            setSize:function(width,height){
                this.setWidth(width);
                this.setHeight(height);
            },
            getClientWidth:function(){
                return this.$.clientWidth;
            },
            getClientHeight:function(){
                return this.$.clientHeight;
            },
            getClientSize:function(){
                return [this.getClientWidth(),this.getClientHeight()];
            },
            //FIXME: Save the display value for show.
            hide:function(){
                this.setStyle("display","none");
            },
            show:function(){
                this.setStyle("display","");
            },
            append:function(child){
                this.$.appendChild(child.$);
            },
            getHTML:function(){
                return this.getData("innerHTML");
            },
            setHTML:function(html){
                this.setData("innerHTML",html);
            },
            load:function(url,handle,real,noCache){
                var self=this;
                handle=B.getHandle(handle);
                B.Loader.loadFile(url,url,function(html){
                    self.setHTML(html);
                    handle();
                },real,noCache);
            },
            getClass:function(){
                var c=this.getAttr("class");
                return c?c.split(" "):[];
            },
            hasClass:function(name){
                return B.Array.indexOf(this.getClass(),name)!=-1?true:false;
            },
            setClass:function(name){
                if(typeof name=="string"){
                    this.setAttr("class",name);
                }else{
                    this.setAttr("class",name.join(" "));
                }
            },
            addClass:function(name){
                var c=this.getClass();
                c.push(name);
                this.setClass(c);
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
            getDocumentElement:function(){
                return B.DOM.Node.parse(this.$.documentElement);
            },
            getHead:function(){
                return this.getByTag("head").item(0);
            },
            getWindow:function(){
                return B.DOM.Window.parse(this.$.parentWindow || this.$.defaultView);
            },
            getRange:function(){
                var rangeList=null;
                if(this.$.getSelection){
                    var sel=B.DOM.Selection.parse(this.$.getSelection(),this);
                    rangeList=sel.getRangeList();
                }else if(this.getWindow().$.getSelection){
                    var sel=B.DOM.Selection.parse(this.getWindow().$.getSelection(),this);
                    rangeList=sel.getRangeList();
                }else if(this.$.selection){
                    rangeList=B.DOM.RangeList.parse(this.$.selection.createRange(),this);
                }
                return rangeList;
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
},"dom",[]);