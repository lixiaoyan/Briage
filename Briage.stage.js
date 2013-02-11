Briage().add(function(B){
    B.namespace("B.Stage");
    B.Stage.Break=B.Break;
    B.Stage.Continue=B.Continue;
    B.Stage.each=function(object,handle,deep){
        if(object instanceof B.Stage.Container && object.children){
            var flag=false;
            B.each(object.children,function(k,v){
                try{
                    handle.call(v,v,k);
                }catch(e){
                    if(e instanceof B.Stage.Break){
                        flag=true;
                    }
                    throw e;
                }
            });
            if(flag){
                return true;
            }
            if(deep){
                B.each(object.children,function(k,v){
                    if(B.Stage.each(v,handle)){
                        throw new B.Stage.Break();
                    }
                });
            }
        }
        return false;
    };
    B.Stage.Vector=new B.Class(function(x,y){
        this.x=x;
        this.y=y;
    },{
        prototype:{
            x:0,
            y:0,
            equals:function(v){
                return v && this.x==v.x && this.y==v.y;
            },
            add:function(v){
                if(v){
                    this.x=this.x+v.x;
                    this.y=this.y+v.y;
                }
            },
            scale:function(v){
                this.x=this.x*v;
                this.y=this.y*v;
            },
            clone:function(){
                return new B.Stage.Vector(this.x,this.y);
            }
        }
    });
    B.Stage.Timer=B.Timer;
    B.Stage.Event=new B.Class(function(){

    },{
        prototype:{
            returnValue:true,
            cancelBubble:false,
            preventDefault:function(stopPropagation){
                this.returnValue=false;
                if(stopPropagation){
                    this.stopPropagation()
                }
            },
            stopPropagation:function(){
                this.cancelBubble=true;
            }
        }
    })
    B.Stage.EventDispatcher=new B.Class(function(){
        this._listener={};
        this._events={};
    },{
        prototype:{
            bind:function(type,handle){
                if(!this._listener[type]){
                    this._listener[type]=function(e){
                        var self=this;
                        B.each(this._events[type],function(k,v){
                            v.call(self,e);
                        });
                    };
                }
                if(!this._events[type]){
                    this._events[type]=[];
                }
                this._events[type].push(handle);
            },
            unbind:function(type,handle){
                if(this._events[type]){
                    B.Array.remove(this._events[type],handle);
                }
            },
            fire:function(type,event){
                var e=event || new B.Stage.Event();
                if(this._listener[type]){
                    this._listener[type].call(this,e);
                }
                if(!e.cancelBubble && this.parent){
                    this.parent.fire(type,e);
                }
            }
        }
    });
    B.Stage.DisplayObject=new B.Class(function(){
        this.id=-1;
        this.depth=0;
        this.parent=null;
        this.pos=new B.Stage.Vector(0,0);
    },{
        extend:B.Stage.EventDispatcher,
        prototype:{
            getStage:function(){
                if(this instanceof B.Stage.Stage){
                    return this;
                }
                if(this.id!=-1 && this.parent){
                    return this.parent.getStage();
                }
                return null;
            },
            checkIn:function(){
                return null;
            },
            getDepthList:function(){
                if(this.parent){
                    return this.parent.getDepthList().concat(this.depth);
                }else{
                    return [this.depth];
                }
            },
            getLeft:function(){
                if(this.parent){
                    return this.parent.getLeft()+this.pos.x;
                }else{
                    return this.pos.x;
                }
            },
            getTop:function(){
                if(this.parent){
                    return this.parent.getTop()+this.pos.y;
                }else{
                    return this.pos.y;
                }
            },
            getPos:function(){
                return new B.Stage.Vector(this.getLeft(),this.getTop());
            },
            compareDepth:function(b){
                var al=this.getDepthList();
                var bl=b.getDepthList();
                var ret=0;
                if(al.length>bl.length){
                    B.each(bl,function(k,v){
                        if(ret=al[k]-v){
                            throw new B.Break();
                        }
                    });
                }else{
                    B.each(al,function(k,v){
                        if(ret=v-bl[k]){
                            throw new B.Break();
                        }
                    });
                }
                return ret || this.id-b.id;
            },
            _draw:function(context){

            }
        }
    });
    B.Stage.Widget=new B.Class(function(){

    },{
        extend:B.Stage.DisplayObject,
        prototype:{
            fromPoint:function(point){
                return this;
            }
        }
    });
    B.Stage.Rect=new B.Class(function(x,y,width,height,lineStyle,fillStyle,lineWidth){
        this.pos=new B.Stage.Vector(x || 0,y || 0);
        this.width=width || 100;
        this.height=height || 100;
        this.lineStyle=lineStyle;
        this.fillStyle=fillStyle;
        this.lineWidth=lineWidth;
    },{
        extend:B.Stage.Widget,
        prototype:{
            checkIn:function(point){
                if(this.pos.x<=point.x && point.x<=this.pos.x+this.width && this.pos.y<=point.y && point.y<=this.pos.y+this.height){
                    return this;
                }
                return null;
            },
            _draw:function(context){
                context.save();
                context.strokeStyle=this.lineStyle;
                context.fillStyle=this.fillStyle;
                context.lineWidth=this.lineWidth;
                context.strokeRect(this.getLeft(),this.getTop(),this.width,this.height);
                context.fillRect(this.getLeft(),this.getTop(),this.width,this.height);
                context.restore();
            }
        }
    });
    B.Stage.Container=new B.Class(function(){
        this.children=[];
    },{
        extend:B.Stage.Widget,
        prototype:{
            addChild:function(child){
                var stage=this.getStage();
                if(child instanceof B.Stage.Widget && !child.parent){
                    child.parent=this;
                    if(stage){
                        if(child.id==-1){
                            child.id=stage.getNextId();
                        }
                        B.Stage.each(child,function(v){
                            if(v.id==-1){
                                v.id=stage.getNextId();
                            }
                        },true);
                    }
                    var index=-1;
                    B.Stage.each(this,function(v,k){
                        if(child.compareDepth(v)<0){
                            index=k;
                            throw new B.Stage.Break();
                        }
                    });
                    if(index==-1){
                        this.children.push(child);
                    }else{
                        this.children.splice(index,0,child);
                    }
                }
            },
            removeChild:function(child){
                B.Array.remove(this.children,child);
                child.parent=null;
            },
            checkIn:function(point){
                var ret=null;
                B.Stage.each(this,function(v){
                    if(ret=v.checkIn(point)){
                        throw new B.Stage.Break();
                    }
                },false);
                return ret;
            },
            fromPoint:function(point){
                point=point.clone();
                point.add(this.getPos());
                var list=[];
                B.Stage.each(this,function(v){
                    if(v instanceof B.Stage.Widget){
                        if(v.checkIn(point)){
                            list.push(v);
                        }
                    }
                },true);
                if(list.length){
                    list.sort(function(a,b){
                        return b.compareDepth(a);
                    });
                    return list[0];
                }else{
                    return this;
                }
            },
            _draw:function(context){
                B.Stage.each(this,function(v){
                    v._draw(context);
                },false);
            }
        }
    })
    B.Stage.Stage=new B.Class(function(canvas,width,height,fps){
        var self=this;
        this.id=0;
        this._canvas=B.DOM.Node.parse(canvas);
        this.setSize(width || 400,height || 300);
        this._context=this._canvas.invoke("getContext","2d");
        this._idCount=1;
        this._canvas.bind("click",function(event){
            var pos=new B.Stage.Vector(event.getPageX()-self._canvas.getLeft(),event.getPageY()-self._canvas.getTop());
            var event=new B.Stage.Event();
            event.pos=pos;
            self.fromPoint(pos).fire("click",event);
        });
    },{
        extend:B.Stage.Container,
        prototype:{
            getNextId:function(){
                return this._idCount++;
            },
            setWidth:function(width){
                this._width=width || 0;
                this._canvas.setAttr("width",this._width);
            },
            setHeight:function(height){
                this._height=height || 0;
                this._canvas.setAttr("height",this._height);
            },
            setSize:function(width,height){
                this.setWidth(width);
                this.setHeight(height);
            },
            update:function(){
                this._context.clearRect(0,0,this._width,this._height);
                this._draw(this._context);
            }
        }
    });
},"stage",["dom","event","timer"])