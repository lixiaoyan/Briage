Briage().add(function(B){
    B.Timer={};
    B.Timer.Timer=new B.Class(function(){
        this.handle=null;
        this.data=[];
        this.interval=1000;
    },{
        prototype:{
            timerHandle:-1,
            timerCallback:function(){
                if(typeof this.handle=="function"){
                    this.handle.apply(null,this.data);
                }
                var self=this;
                this.timerHandle=setTimeout(function(){self.timerCallback.call(self);},this.interval);
            },
            start:function(){
                if(this.timerHandle==-1){
                    this.timerCallback();
                }
            },
            stop:function(){
                clearTimeout(this.timerHandle);
                this.timerHandle=-1;
            },
            setData:function(){
                this.data=B.deepclone(arguments);
            },
            getData:function(){
                return B.deepclone(this.data);
            },
            setInterval:function(interval){
                this.interval=interval || 0;
            },
            getInterval:function(){
                return this.interval;
            },
            setHandle:function(handle){
                this.handle=handle;
            },
            getHandle:function(){
                return this.handle;
            }
        }
    });
},"timer",[]);