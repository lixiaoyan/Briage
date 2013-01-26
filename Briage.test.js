Briage().add(function(B,event){
    event.wait();
    B.later(5000,function(){
        event.end();
    },this);
},"test",[]);