Briage().add(function(B){
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
    B.DOM.RangeList=new B.Class(function($){
        if(!(B.toString.call($)=="[object Array]" || $.length!==undefined)){
            $=[$];
        }
        var t=this.$=[];
        B.each($,function(k,v){
            if(!isNaN(k)){
                var c=B.DOM.Range.parse(v);
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
    B.extend(B.DOM.Document.prototype,{
        getRangeList:function(){
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
    });
},"range",["dom"]);